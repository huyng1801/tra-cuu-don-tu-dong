export const PRODUCT_LABEL_MAX_BYTES = 5 * 1024 * 1024;

export const PRODUCT_LABEL_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function resolveLabelContentType(file: Pick<File, "name" | "type">) {
  if (file.type && PRODUCT_LABEL_ALLOWED_TYPES.includes(file.type as never)) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPE[extension] ?? null;
}

export function validateProductLabelFile(file: Pick<File, "name" | "type" | "size">) {
  if (file.size <= 0) {
    return "Vui lòng chọn ảnh nhãn hợp lệ.";
  }

  if (file.size > PRODUCT_LABEL_MAX_BYTES) {
    return "Ảnh nhãn tối đa 5MB.";
  }

  if (!resolveLabelContentType(file)) {
    return "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.";
  }

  return null;
}
