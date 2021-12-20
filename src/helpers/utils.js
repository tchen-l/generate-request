/**
 * 横线转换驼峰
 * @param {string} str name_value
 * @returns nameValue
 */
function underlineToCamel(str) {
  return str.replace(/\-(\w)/g, (all, letter) => letter.toUpperCase())
}

module.exports = {
  underlineToCamel
}