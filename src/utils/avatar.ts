/**
 * Utilitários para resolução e compressão de avatares do FilaFácil.
 */

/**
 * Silhueta padrão neutra em SVG (person placeholder cinza com sombra suave) para perfis sem foto.
 * Fornecido como Data URI nativo (100% offline, sem requisições de rede ou risco de 404).
 */
export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128' width='128' height='128'><circle cx='64' cy='64' r='64' fill='%23E2E8F0'/><g><circle cx='64' cy='46' r='22' fill='%2394A3B8'/><path d='M64 76 C44 76 28 92 24 114 C23 120 27 128 34 128 L94 128 C101 128 105 120 104 114 C100 92 84 76 64 76 Z' fill='%2394A3B8'/></g></svg>";

/**
 * Resolve a URL completa de exibição do avatar, corrigindo caminhos relativos
 * entre Vercel (frontend) e Render (backend).
 */
export function resolveAvatarUrl(url?: string | null): string {
  if (
    !url ||
    typeof url !== 'string' ||
    url.trim() === '' ||
    url.includes('avatar-male-agent.jpg') ||
    url.includes('default-avatar.svg')
  ) {
    return DEFAULT_AVATAR;
  }

  const trimmed = url.trim();

  // Se já for Base64 (Data URI) ou URL absoluta (https://, http://)
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Se for preset estático do frontend (/images/avatars/...)
  if (trimmed.startsWith('/images/')) {
    return trimmed;
  }

  // Se for caminho relativo de upload (/uploads/avatars/...)
  if (trimmed.startsWith('/uploads/')) {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'https://backend-filafacil.onrender.com/api';
    const backendOrigin = rawApiUrl.replace(/\/api\/?$/, '');
    return `${backendOrigin}${trimmed}`;
  }

  return trimmed;
}

/**
 * Comprime e redimensiona um arquivo de imagem diretamente no navegador
 * para uma foto quadrada leve (320x320) em formato Data URL (JPEG 85%).
 * Garante persistência permanente no banco de dados sem depender de storage efêmero.
 */
export function compressImageFile(file: File, maxDimension = 320, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Crop centralizado para formato 1:1 quadrado
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          canvas.width = maxDimension;
          canvas.height = maxDimension;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          // Desenha com antialiasing de alta qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            maxDimension,
            maxDimension
          );

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(readerEvent.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error('Falha ao processar arquivo de imagem.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Falha ao ler arquivo do computador.'));
    };

    reader.readAsDataURL(file);
  });
}

