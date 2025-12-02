export function convertToRegex(text: any): string {
  if (!text) return '';
  let result = String(text);
  result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
  result = result.toLowerCase();
  result = result.replace(/a/g, '[aàáạảãâầấậẩẫăằắặẳẵ]');
  result = result.replace(/e/g, '[eèéẹẻẽêềếệểễ]');
  result = result.replace(/i/g, '[iìíịỉĩ]');
  result = result.replace(/o/g, '[oòóọỏõôồốộổỗơờớợởỡ]');
  result = result.replace(/u/g, '[uùúụủũưừứựửữ]');
  result = result.replace(/y/g, '[yỳýỵỷỹ]');
  result = result.replace(/d/g, '[dđ]');

  result = result.trim();
  result = result.replace(/\s+/g, '[\\W_]+');

  return result;
}
