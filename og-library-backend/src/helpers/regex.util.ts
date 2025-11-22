export function convertToRegex(text: string): string {
  let result = text.toLowerCase();
  result = result.replace(/a/g, '[aàáạảãâầấậẩẫăằắặẳẵ]');
  result = result.replace(/e/g, '[eèéẹẻẽêềếệểễ]');
  result = result.replace(/i/g, '[iìíịỉĩ]');
  result = result.replace(/o/g, '[oòóọỏõôồốộổỗơờớợởỡ]');
  result = result.replace(/u/g, '[uùúụủũưừứựửữ]');
  result = result.replace(/y/g, '[yỳýỵỷỹ]');
  result = result.replace(/d/g, '[dđ]');

  result = result.replace(/\s+/g, '\\s+');

  return result;
}
