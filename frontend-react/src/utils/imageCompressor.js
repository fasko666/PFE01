/**
 * Compress an image File/Blob to a JPEG data-URL.
 * - Resizes to at most maxDim × maxDim (preserving aspect ratio)
 * - Converts any format (HEIC, BMP, GIF, PNG, WebP…) to JPEG
 * - Keeps file well under 200 KB so backend never hits PHP body limits
 */
export function compressImage(file, { maxDim = 512, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.round(img.width  * ratio);
      const h = Math.round(img.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image'));
    };

    img.src = objectUrl;
  });
}
