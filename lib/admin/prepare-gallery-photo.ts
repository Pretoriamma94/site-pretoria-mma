/** Upload display-sized JPEGs, keeping large originals off the public gallery. */
export async function prepareGalleryPhoto(file: File): Promise<File> {
 if (!file.size || file.size > 30 * 1024 * 1024) throw new Error('Photo vide ou trop volumineuse (30 Mo maximum).');
 const url = URL.createObjectURL(file);
 try {
  const image = new Image(); image.src = url;
  try { await image.decode(); } catch { throw new Error('Photo illisible. Choisissez une photo JPG, PNG ou WebP.'); }
  const scale = Math.min(1, 2000 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Impossible de préparer la photo.');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob || blob.size > 10 * 1024 * 1024) throw new Error('Photo trop volumineuse après réduction.');
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
 } finally { URL.revokeObjectURL(url); }
}
