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

type Result = {
  see: string,
  apiName: string,
  apiURI: string,
  methodType: string,
  requestParams: { key: string, name: string, type: string, required: boolean }[]
  restfulParams: { key: string, name: string, type: string, required: boolean }[]
  urlParams: { key: string, name: string, type: string, required: boolean }[]
  resultData: { key: string, name: string, type: string, required: boolean, children?: Result['resultData'] }[]
};

export function getSnippetTemplate(result: Result) {
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

const getDataType = (data: Result['resultData'] = []) => {
  const str: string = data?.reduce((prev, cur) => {
    const { key, name, type, required, children } = cur || {};

    if (type === 'array') {
      return `${prev}/** ${name} */\n${key}${required ? '':'?'}: Array<\n${children?.length ? `{${getDataType(children)}}` : ''}\n>,\n`;
    }

    if (type === 'object') {
      return `${prev}/** ${name} */\n${key}${required ? '':'?'}: {${children?.length ? getDataType(children) : ''}},\n`;
    }

    return `${prev}/** ${name} */\n${key}${required ? '':'?'}: ${type || 'number'},\n`;
  }, '');

  return str;
};

export function getSnippetTemplate2Ts(result: Result) {
  const {
    see,
    methodType,
    apiName = '',
    apiURI = '',
    restfulParams = [],
    urlParams = [],
    requestParams = [],
    resultData
  } = result || {};

  let finalPath = apiURI;

  const finalPathParamKeys = restfulParams.map((param: any) => param?.key);

  const paramsString = getParamsString({ methodType });

  const paramsDefineString = getDataType([
    ...urlParams,
    ...restfulParams,
    ...requestParams,
  ]);

  const resStr = getDataType(resultData);

  /**
   * 注释信息模板
   */
  const descTemplate = `type \${1:fetchData}Params = {
    ${paramsDefineString}}\n
    type \${1:fetchData}Response = {
    ${resStr}}
/**
 * ${apiName}
 * @see ${see}
*/`;

  if (!finalPathParamKeys || !finalPathParamKeys.length) {
    return `${descTemplate}
export function \${1:fetchData}(${paramsString}: \${1:fetchData}Params): Promise<\${1:fetchData}Response> {
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
  )}, ...${paramsString} }: \${1:fetchData}Params): Promise<\${1:fetchData}Response> {
  return request({
    url: \`${finalPath}\`,
    method: '${methodType}',
    ${paramsString},
  });
}
`;
}
