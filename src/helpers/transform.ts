import { underlineToCamel } from './utils';

type RequestMethod = 0 | 1 | 2 | 3;

const requestMethodMapping = {
  0: 'post',
  1: 'get',
  2: 'put',
  3: 'delete',
};

type ParamNameType = 0 | 3 | 7 | 8 | 11 | 12 | 13;

const typeMapping = {
  0: 'string',
  3: 'number',
  7: 'string',
  8: 'boolean',
  11: 'string',
  12: 'array',
  13: 'object',
};

function getMethodType(methodType: RequestMethod) {
  return requestMethodMapping[methodType] || 'get';
}

function getParamTypeName(paramType: ParamNameType) {
  return typeMapping[paramType] || '';
}

function formatParams(params = []) {
  return params.map((param) => {
    const { paramKey, paramName = '', paramType, paramNotNull } = param || {};

    return {
      key: underlineToCamel(paramKey),
      name: paramName,
      type: getParamTypeName(paramType),
      required: paramNotNull !== '0',
    };
  });
}

export function transformResult(result: any) {
  const {
    baseInfo,
    restfulParam = [],
    urlParam = [],
    requestInfo = [],
  } = result || {};

  const {
    apiID = '',
    apiName = '',
    groupID = '',
    apiURI = '',
    apiRequestType,
  } = baseInfo || {};

  /**
   * 接口文档网址
   */
  const see = `https://yuyidata.w.eolink.com/home/api_studio/inside/api/detail?apiID=${apiID}&groupID=${groupID}&projectHashKey=eQzNgq9ae5c60a4e452990ea471c64a699bd3673890ab88&spaceKey=yuyidata`;
  /**
   * 请求名 method
   */
  const methodType = getMethodType(apiRequestType);

  const urlParams = formatParams(urlParam);
  const restfulParams = formatParams(restfulParam);
  const requestParams = formatParams(requestInfo);

  return {
    apiName,
    see,
    apiURI,
    methodType,
    urlParams,
    restfulParams,
    requestParams,
  };
}
