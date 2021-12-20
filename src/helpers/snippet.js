const { underlineToCamel } = require('./utils')

function replacePath(path = '') {
  return path.replace(/\{(.+?)\}/g, (key) => {
    const finalKey = underlineToCamel(key, '')
    return '\\\$' + finalKey + ''
  })
}

function getParamsString({ methodTypeName = '' }) {
  return ['post', 'put', 'delete', 'patch'].includes(methodTypeName) ? 'data' : 'params'
}

function getSnippetTemplate(result) {
  const { 
    see,
    methodTypeName,
    apiName = '',
    apiURI = '',
    restfulParams = [],
    urlParams = [],
    requestParams = []
  } = result || {}

  let finalPath = apiURI

  const finalPathParamKeys = restfulParams.map(param => param.key)

  const paramsString = getParamsString({ methodTypeName })
  const paramsDocString = [...urlParams, ...restfulParams, ...requestParams].reduce((prev, cur, index) => {
    const { key, type, required, name = '' } = cur
    return `${prev}${index === 0 ? '' : '\n'} * @param {${type}} ${paramsString}.${key} ${name}${required ? '(必填)' : ''}`
  }, '')
  /**
   * 注释信息模板
   */
  const descTemplate = `/**
 * ${apiName}
 * @see ${see}
 *
 * @param {object} ${paramsString} 请求参数
${paramsDocString}
 * @returns {Promise} AxiosPropmise
*/`

  if (!finalPathParamKeys || !finalPathParamKeys.length) {
    return `${descTemplate}
export function \${1:fetchData}(${paramsString}) {
  return request({
    url: '${finalPath}',
    method: '${methodTypeName}',
    ${paramsString},
  });
}

`
  }

  finalPath = replacePath(finalPath)

  return `${descTemplate}
export function \${1:fetchData}({ ${finalPathParamKeys.join(', ')}, ...${paramsString} }) {
  return request({
    url: \`${finalPath}\`,
    method: '${methodTypeName}',
    ${paramsString},
  });
}

`
}

module.exports = {
  getSnippetTemplate
}
