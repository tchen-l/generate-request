const { apiHost } = require('../config')

const TypeNameMapping = {
  Number: 'number',
  String: 'string'
}

const RequestMethoMapping = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
  OPTIONS: 'options',
  HEAD: 'head'
}

function getTypeName(typeName, isArray = 0) {
  let finalTypeName = TypeNameMapping[typeName] || "object"
  if (isArray) {
    finalTypeName = `${finalTypeName}[]`
  }
  return finalTypeName
}

function getMethodTypeName(methodTypeName) {
  return RequestMethoMapping[methodTypeName] || methodTypeName
}

/**
 * 横线转换驼峰
 * @param {string} str name_value
 * @returns nameValue
 */
function underlineToCamel(str) {
  return str.replace(/\-(\w)/g, (all, letter) => letter.toUpperCase())
}

function replacePath(path = '') {
  return path.replace(/\{.*\}/g, (key) => {
    const finalKey = underlineToCamel(key.replace(/(\{)|(\})/g, ''))
    return '\\\$\{' + finalKey + '\}'
  })
}

function formatPathParams({ path = '', pathParams = [] }) {
  /**
   * 接口文档可能出现以下情况：
   * path 中有参数，但是 pathParams 数组为空，为了容错，直接从 path 中取出参数
   */
  const finalPathParamsKeys = (path.match(/\{.*\}/g) || []).map(n => underlineToCamel(n.replace(/(\{)|(\})/g, '')))
  const finalPathParams = finalPathParamsKeys.map(key => {
    const findParam = pathParams.find(n => underlineToCamel(n.name) === key) || {}
    // 转驼峰
    const camelKey = underlineToCamel(key)
    return { typeName: 'String', description: '', ...findParam, name: camelKey }
  })

  return { finalPathParamsKeys, finalPathParams }
}

function getParamsString({ methodTypeName = '', pathParamsKeys = [] }) {
  let str = ''
  if (!pathParamsKeys.length) {
    str = ['post', 'put', 'delete', 'patch'].includes(methodTypeName) ? 'data' : 'params: data'
    return str
  }
  str = ['post', 'put', 'delete', 'patch'].includes(methodTypeName) ? 'data: restData' : 'params: restData'
  return str
}

function getSnippetTemplate(result) {
  const { id, name, description, group, params, path, method } = result || {}
  const { projectId } = group || {}
  const { pathParams = [], inputs = [] } = params || {}
  /**
   * 请求名 method
   */
  const methodTypeName = getMethodTypeName(method)
  /**
   * url 中的请求参数
   */
  const { finalPathParamsKeys, finalPathParams } = formatPathParams({ path, pathParams })
  let finalPath = path
  /**
   * 接口文档网址
   */
  const see = `${apiHost}/interface/detail/?pid=${projectId}&id=${id}`

  const paramsString = [...inputs, ...finalPathParams].reduce((prev, cur, index) => {
    const { name, typeName, isArray, description } = cur
    const finalTypeName = getTypeName(typeName, isArray)
    let finalDescription = description
    if (name === 'companyId') {
      finalDescription += '（此处可不传，已经在 axios 拦截器统一处理）'
    }
    return `${prev}${index === 0 ? '' : '\n'} * @param {${finalTypeName}} data.${name} ${finalDescription}`
  }, '')
  /**
   * 注释信息模板
   */
  const descTemplate = `
/**
 * ${name}
 * @see ${see}
 * @description ${description}
 * 
 * @param {object} data 请求参数
${paramsString}
 * @returns {Promise} AxiosPropmise
*/`

  if (!finalPathParams || !finalPathParams.length) {
    return `
${descTemplate}
export function \${1:fetchData}(data) {
  return request({
    url: '${finalPath}',
    method: '${methodTypeName}',
    ${getParamsString({ methodTypeName, pathParamsKeys: finalPathParamsKeys })},
  });
};

`
  }

  finalPath = replacePath(finalPath)

  return `
${descTemplate}
export function \${1:fetchData}(data) {
  const { ${finalPathParamsKeys.join(', ')}, ...restData } = data;
  return request({
    url: \`${String(finalPath)}\`,
    method: '${methodTypeName}',
    ${getParamsString({ methodTypeName, pathParamsKeys: finalPathParamsKeys })},
  });
};

`
}

module.exports = {
  getSnippetTemplate
}
