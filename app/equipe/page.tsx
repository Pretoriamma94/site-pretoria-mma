import { permanentRedirect } from 'next/navigation';

/** Ancienne page fusionnée dans /le-club (section #equipe). */
export default function EquipePage() {
  permanentRedirect('/le-club');
}
