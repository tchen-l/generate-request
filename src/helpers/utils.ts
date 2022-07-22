/**
 * 横线转换驼峰
 */
export function underlineToCamel(str = '') {
  return str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());
}
