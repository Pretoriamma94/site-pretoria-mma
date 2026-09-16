import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ASSOCIATION_NOM, ASSOCIATION_ADRESSE, ASSOCIATION_EMAIL } from '@/lib/inscription/legal-texts';

export type AttestationData = {
  nom: string; saison: string; activite: string; date: string;
  total: string; paye: string; reste: string; modePrevu: string;
  paiements: { date: string; mode: string; montant: string }[];
};

export async function buildAttestationPdf(data: AttestationData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 790;
  const clean = (s: string) => Array.from(s.replace(/[’]/g, "'").replace(/[–—]/g, '-').replace(/[\u202f\u00a0]/g, ' ')).map(c => {
    try { font.encodeText(c); return c; } catch { return '?'; }
  }).join('');
  const line = (text: string, size = 11, strong = false) => {
    const f = strong ? bold : font;
    let current = '';
    const flush = () => {
      if (y < 70) { page = pdf.addPage([595.28, 841.89]); y = 790; }
      page.drawText(current, { x: 48, y, font: f, size, color: rgb(.12, .12, .15) });
      y -= size + 8;
    };
    for (const word of clean(text).split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (f.widthOfTextAtSize(candidate, size) <= 495) { current = candidate; continue; }
      if (current) { flush(); current = ''; }
      for (const c of word) {
        if (f.widthOfTextAtSize(current + c, size) > 495 && current) { flush(); current = ''; }
        current += c;
      }
    }
    if (current) flush();
  };
  try {
    const bytes = await readFile(path.join(process.cwd(), 'public/images/logo.png'));
    let logo;
    try { logo = await pdf.embedPng(bytes); } catch { logo = await pdf.embedJpg(bytes); }
    const dims = logo.scaleToFit(130, 65);
    page.drawImage(logo, { x: 48, y: y - dims.height, ...dims });
    y -= dims.height + 22;
  } catch { /* Les coordonnées restent visibles si le logo est indisponible. */ }
  line(ASSOCIATION_NOM, 14, true);
  line(ASSOCIATION_ADRESSE, 9);
  line(ASSOCIATION_EMAIL, 9);
  y -= 15;
  line("ATTESTATION D'INSCRIPTION", 20, true);
  line(`Établie le ${data.date}`, 10);
  y -= 10;
  line(`Adhérent : ${data.nom}`, 13, true);
  line(`Saison : ${data.saison}`);
  line(`Activité : ${data.activite}`);
  y -= 15;
  line(`Cotisation totale : ${data.total}`, 13, true);
  line(`Montant déjà payé : ${data.paye}`, 13, true);
  line(`Reste à régler : ${data.reste}`, 13, true);
  line(`Mode de paiement prévu : ${data.modePrevu}`, 10);
  y -= 15;
  line('Paiements enregistrés', 12, true);
  if (!data.paiements.length) line('Aucun détail de paiement disponible. Le montant payé est celui enregistré sur la fiche.', 10);
  for (const p of data.paiements) line(`${p.date}  |  ${p.mode}  |  ${p.montant}`, 10);
  y -= 15;
  line("Situation enregistrée au jour de l'émission. Cette attestation ne certifie pas le règlement intégral de la cotisation ni la complétude du dossier.", 9);
  return pdf.save();
}
