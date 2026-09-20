-- Correction atomique réservée au serveur admin : paiement et solde ensemble.
create or replace function public.correct_inscription_payment(p_id uuid, p_expected jsonb, p_values jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  payment public.inscription_paiements%rowtype;
  member public.inscriptions%rowtype;
  member_id uuid;
  history_total numeric;
  new_paid numeric;
  new_amount numeric;
  new_date date;
  new_id uuid;
  latest_date date;
  latest_mode public.mode_paiement_type;
begin
  select inscription_id into member_id from public.inscription_paiements where id = p_id;
  if member_id is null then
    select * into member from public.inscriptions where id = p_id for update;
    if member.id is null or member.status = 'cancelled' or coalesce(member.montant_paye,0) <= 0
      or member.mode_paiement is null or member.date_paiement is null then raise exception 'Paiement introuvable.'; end if;
    if exists(select 1 from public.inscription_paiements where inscription_id=p_id) then
      raise exception 'Ce paiement a été modifié. Actualisez la fiche avant de réessayer.';
    end if;
    if jsonb_build_object('montant',member.montant_paye,'mode_paiement',member.mode_paiement,
      'date_reception',to_char(member.date_paiement at time zone 'UTC','YYYY-MM-DD'),'numero_echeance',null,'note',null)
      is distinct from p_expected then raise exception 'Ce paiement a été modifié. Actualisez la fiche avant de réessayer.'; end if;
    insert into public.inscription_paiements(inscription_id,montant,mode_paiement,date_reception)
      values(p_id,member.montant_paye,member.mode_paiement,(member.date_paiement at time zone 'UTC')::date)
      returning id into new_id;
    perform public.correct_inscription_payment(new_id,p_expected,p_values);
    return;
  end if;
  select * into member from public.inscriptions where id = member_id for update;
  select * into payment from public.inscription_paiements where id = p_id for update;
  if payment.id is null then raise exception 'Paiement introuvable.'; end if;
  if member.status = 'cancelled' then raise exception 'Inscription annulée.'; end if;
  if jsonb_build_object('montant', payment.montant, 'mode_paiement', payment.mode_paiement,
     'date_reception', payment.date_reception, 'numero_echeance', payment.numero_echeance, 'note', payment.note)
     is distinct from p_expected then
    raise exception 'Ce paiement a été modifié. Actualisez la fiche avant de réessayer.';
  end if;
  new_amount := (p_values->>'montant')::numeric;
  new_date := (p_values->>'date_reception')::date;
  if new_amount is null or new_amount <= 0 or new_amount >= 100000000 or round(new_amount, 2) <> new_amount
     or new_date is null or new_date > current_date
     or (p_values->>'mode_paiement') is null
     or (p_values->>'mode_paiement') not in ('cash','cheque','virement')
     or coalesce(length(p_values->>'note'),0) > 280
     or ((p_values->>'numero_echeance') is not null and (p_values->>'numero_echeance')::int not in (1,2,3)) then
    raise exception 'Données de paiement invalides.';
  end if;
  select coalesce(sum(montant),0) into history_total from public.inscription_paiements where inscription_id = member_id;
  -- Préserve les anciens encaissements non détaillés et les trop-perçus historiques.
  new_paid := greatest(coalesce(member.montant_paye,0), history_total) - payment.montant + new_amount;
  update public.inscription_paiements set montant = new_amount,
    mode_paiement = (p_values->>'mode_paiement')::public.mode_paiement_type,
    date_reception = new_date, numero_echeance = (p_values->>'numero_echeance')::smallint,
    note = nullif(p_values->>'note','') where id = p_id;
  select date_reception, mode_paiement into latest_date, latest_mode from public.inscription_paiements
    where inscription_id = member_id order by date_reception desc, created_at desc, id desc limit 1;
  update public.inscriptions set montant_paye = new_paid, mode_paiement = latest_mode,
    date_paiement = case when new_paid >= montant_total then latest_date::timestamp at time zone 'Europe/Paris' else null end,
    status = case
      when new_paid < montant_total and status in ('paid','finalized') then 'pending_payment'::public.inscription_status_type
      when new_paid >= montant_total and status = 'pending_payment' then 'paid'::public.inscription_status_type
      else status end
    where id = member_id;
end;
$$;
revoke all on function public.correct_inscription_payment(uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.correct_inscription_payment(uuid,jsonb,jsonb) to service_role;
notify pgrst, 'reload schema';
