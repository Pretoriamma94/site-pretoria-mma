import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  ASSOCIATION_ADRESSE,
  ASSOCIATION_EMAIL,
  ASSOCIATION_NOM,
  ASSOCIATION_RNA,
  ASSOCIATION_SIRET,
} from '@/lib/inscription/legal-texts';
import type { RecuCotisationPayload } from '@/lib/email/recu-cotisation';

function winAnsi(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/€/g, 'EUR')
    .replace(/·/g, '-');
}

async function embedClubLogo(pdf: PDFDocument) {
  const recuJpg = path.join(process.cwd(), 'public', 'images', 'logo-recu.jpg');
  try {
    return await pdf.embedJpg(await readFile(recuJpg));
  } catch {
    const fallback = path.join(process.cwd(), 'public', 'images', 'logo.png');
    try {
      const bytes = await readFile(fallback);
      try {
        return await pdf.embedPng(bytes);
      } catch {
        return await pdf.embedJpg(bytes);
      }
    } catch {
      return null;
    }
  }
}

/**
 * Reçu de cotisation (association loi 1901, hors TVA) — 1 page A4.
 */
export async function buildRecuCotisationPdf(
  payload: RecuCotisationPayload,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const red = rgb(0.863, 0.149, 0.149);
  const black = rgb(0.05, 0.05, 0.05);
  const gray = rgb(0.35, 0.35, 0.35);
  const pageWidth = 595.28;
  const left = 50;
  const right = pageWidth - 50;

  const draw = (
    text: string,
    x: number,
    y: number,
    size = 11,
    useBold = false,
    color = black,
  ) => {
    page.drawText(winAnsi(text), {
      x,
      y,
      size,
      font: useBold ? bold : font,
      color,
    });
  };

  const logo = await embedClubLogo(pdf);
  let y = 792;
  const headerLines = [
    { text: ASSOCIATION_NOM, size: 14, bold: true, color: red },
    { text: 'Association sportive - loi 1901', size: 9, bold: false, color: gray },
    { text: ASSOCIATION_ADRESSE, size: 9, bold: false, color: gray },
    {
      text: `SIRET ${ASSOCIATION_SIRET}  -  RNA ${ASSOCIATION_RNA}`,
      size: 9,
      bold: false,
      color: gray,
    },
    { text: ASSOCIATION_EMAIL, size: 9, bold: false, color: gray },
  ];

  if (logo) {
    const maxH = 78;
    const maxW = 88;
    const ratio = logo.width / logo.height;
    let h = maxH;
    let w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    page.drawImage(logo, { x: left, y: y - h + 12, width: w, height: h });
    let ty = y;
    const tx = left + w + 14;
    for (const row of headerLines) {
      draw(row.text, tx, ty, row.size, row.bold, row.color);
      ty -= row.size + 5;
    }
    y = Math.min(ty, y - h + 12) - 10;
  } else {
    for (const row of headerLines) {
      draw(row.text, left, y, row.size, row.bold, row.color);
      y -= row.size + 5;
    }
    y -= 6;
  }

  page.drawLine({
    start: { x: left, y: y + 4 },
    end: { x: right, y: y + 4 },
    thickness: 1.5,
    color: red,
  });
  y -= 18;

  const line = (text: string, size = 11, useBold = false, color = black) => {
    draw(text, left, y, size, useBold, color);
    y -= size + 6;
  };

  line('Recu de cotisation', 18, true);
  y -= 8;
  line(`Adherent : ${payload.prenom} ${payload.nom}`, 12, true);
  if (payload.packShareNote) {
    line(payload.packShareNote, 9, false, gray);
  }
  line(`Saison : ${payload.anneeScolaire}`);
  line(`Categorie : ${payload.coursLabel}`);
  line(`Date : ${payload.dateLabel}`);
  y -= 8;
  line('Reglements', 12, true);
  if (payload.lignes.length === 0) {
    line('Aucun reglement detaille (solde enregistre sur la fiche).', 10, false, gray);
  } else {
    for (const row of payload.lignes) {
      line(`${row.dateLabel}  -  ${row.modeLabel}  -  ${row.montantLabel}`, 10);
    }
  }
  y -= 8;
  line(`Total cotisation : ${payload.montantTotalLabel}`, 12, true);
  line(`Montant paye : ${payload.montantPayeLabel}`, 12, true);
  y -= 12;
  line(
    'Ce document est un recu de cotisation associative. Il ne constitue pas une facture',
    9,
    false,
    gray,
  );
  line('assujettie a la TVA (association loi 1901 non assujettie).', 9, false, gray);
  y -= 8;
  line('Sportivement,', 11);
  line(ASSOCIATION_NOM, 11, true);

  draw(ASSOCIATION_ADRESSE, left, 42, 8, false, gray);
  draw(`SIRET ${ASSOCIATION_SIRET}  -  RNA ${ASSOCIATION_RNA}`, left, 30, 8, false, gray);

  return pdf.save();
}
