const MAX_FILE_MB = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

function validateFile(f) {
  if (!f) return "파일을 선택해주세요.";

  if (!ALLOWED_TYPES.includes(f.type))
    return "JPG 또는 PNG 파일만 업로드 가능합니다.";

  if (f.size > MAX_FILE_MB * 1024 * 1024)
    return `파일 크기는 ${MAX_FILE_MB}MB 이하여야 합니다.`;

  return null;
}

export { MAX_FILE_MB, validateFile };
