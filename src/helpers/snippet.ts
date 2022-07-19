import { underlineToCamel } from './utils';

function replacePath(path = '') {
  return path.replace(/\{(.+?)\}/g, (key) => {
    const finalKey = underlineToCamel(key);
    return '\\$' + finalKey + '';
  });
}

function getParamsString({ methodType = '' }) {
  return ['post', 'put', 'delete', 'patch'].includes(methodType)
    ? 'data'
    : 'params';
}

export function getSnippetTemplate(result: any) {
  const {
    see,
    methodType,
    apiName = '',
    apiURI = '',
    restfulParams = [],
    urlParams = [],
    requestParams = [],
  } = result || {};

  let finalPath = apiURI;

  const finalPathParamKeys = restfulParams.map((param: any) => param?.key);

  const paramsString = getParamsString({ methodType });
  const paramsDocString = [
    ...urlParams,
    ...restfulParams,
    ...requestParams,
  ].reduce((prev, cur, index) => {
    const { key, type, required, name = '' } = cur;
    return `${prev}${
      index === 0 ? '' : '\n'
    } * @param {${type}} ${paramsString}.${key} ${name}${
      required ? '(必填)' : ''
    }`;
  }, '');
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
*/`;

  if (!finalPathParamKeys || !finalPathParamKeys.length) {
    return `${descTemplate}
export function \${1:fetchData}(${paramsString}) {
  return request({
    url: '${finalPath}',
    method: '${methodType}',
    ${paramsString},
  });
}
`;
  }

  finalPath = replacePath(finalPath);

  return `${descTemplate}
export function \${1:fetchData}({ ${finalPathParamKeys.join(
    ', ',
  )}, ...${paramsString} }) {
  return request({
    url: \`${finalPath}\`,
    method: '${methodType}',
    ${paramsString},
  });
}
`;
}
