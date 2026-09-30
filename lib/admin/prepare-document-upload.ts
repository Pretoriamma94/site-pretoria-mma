const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

/** Leave room for multipart metadata under the server action request limit. */
export async function prepareAdminDocument(file: File): Promise<File> {
  if (!file.size) throw new Error('Le fichier est vide. Choisissez une autre photo.');
  const pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (pdf) {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('Le PDF est trop volumineux. Choisissez un PDF de moins de 3 Mo.');
    return file;
  }
  if (!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name) && !/^image\/(jpeg|jpg|png|webp|heic|heif)$/.test(file.type)) {
    throw new Error('Choisissez une photo JPG, PNG ou WebP, ou un document PDF.');
  }
  if (file.size <= MAX_UPLOAD_BYTES && (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name))) return file;
  if (file.size > 30 * 1024 * 1024) throw new Error('La photo dépasse 30 Mo. Exportez une version plus petite.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try { await img.decode(); } catch {
      throw new Error('Cette photo ne peut pas être lue. Exportez-la en JPG ou PNG puis réessayez (notamment pour les photos HEIC d’iPhone).');
    }
    const scale = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Impossible de préparer cette photo dans ce navigateur.');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob || blob.size > MAX_UPLOAD_BYTES) throw new Error('La photo reste trop volumineuse. Choisissez une version plus petite.');
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } finally { URL.revokeObjectURL(url); }
}
