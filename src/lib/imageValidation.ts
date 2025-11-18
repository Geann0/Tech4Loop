/**
 * Validação de upload de imagens
 * Previne upload de arquivos maliciosos e garante qualidade das imagens
 */

export const IMAGE_VALIDATION = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_FILE_SIZE: 1024, // 1KB (evita arquivos vazios)
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  MAX_FILES: 5,
  MIN_WIDTH: 300, // pixels
  MIN_HEIGHT: 300, // pixels
};

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida um arquivo de imagem
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Verificar se o arquivo existe
  if (!file || file.size === 0) {
    return { valid: false, error: "Arquivo de imagem inválido ou vazio" };
  }

  // Verificar tamanho mínimo
  if (file.size < IMAGE_VALIDATION.MIN_FILE_SIZE) {
    return { valid: false, error: "Arquivo muito pequeno (mínimo 1KB)" };
  }

  // Verificar tamanho máximo
  if (file.size > IMAGE_VALIDATION.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande (máximo ${IMAGE_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB)`,
    };
  }

  // Verificar tipo MIME
  if (!IMAGE_VALIDATION.ALLOWED_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: "Tipo de arquivo não permitido. Use JPG, PNG ou WEBP",
    };
  }

  // Verificar extensão do arquivo
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!IMAGE_VALIDATION.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: "Extensão de arquivo não permitida. Use .jpg, .png ou .webp",
    };
  }

  return { valid: true };
}

/**
 * Valida múltiplos arquivos de imagem
 */
export function validateImageFiles(files: File[]): ImageValidationResult {
  // Filtrar arquivos vazios primeiro
  const validFiles = files.filter((f) => f && f.size > 0);

  if (validFiles.length === 0) {
    return { valid: false, error: "Pelo menos uma imagem é obrigatória" };
  }

  if (validFiles.length > IMAGE_VALIDATION.MAX_FILES) {
    return {
      valid: false,
      error: `Máximo de ${IMAGE_VALIDATION.MAX_FILES} imagens permitidas`,
    };
  }

  // Validar cada arquivo individualmente
  for (let i = 0; i < validFiles.length; i++) {
    const result = validateImageFile(validFiles[i]);
    if (!result.valid) {
      return {
        valid: false,
        error: `Imagem ${i + 1}: ${result.error}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Valida dimensões da imagem (cliente-side)
 * Retorna uma Promise que resolve quando a validação estiver completa
 */
export function validateImageDimensions(
  file: File
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (
        img.width < IMAGE_VALIDATION.MIN_WIDTH ||
        img.height < IMAGE_VALIDATION.MIN_HEIGHT
      ) {
        resolve({
          valid: false,
          error: `Imagem muito pequena. Mínimo: ${IMAGE_VALIDATION.MIN_WIDTH}x${IMAGE_VALIDATION.MIN_HEIGHT}px`,
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: "Não foi possível carregar a imagem" });
    };

    img.src = objectUrl;
  });
}

/**
 * Formata bytes para exibição legível
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
