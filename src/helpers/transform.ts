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

type FormatParamsType = {
  paramKey: string;
  paramName: string;
  paramType: ParamNameType;
  paramNotNull: '0' | '1';
  childList: FormatParamsType[];
}[];

type Result = {
  key: string;
  name: string;
  type: string;
  required: boolean;
  children?: Result[];
};
function formatParams(params: FormatParamsType & Result[]): Result[] {
  return (
    params?.map((param) => {
      const { paramKey, paramName = '', paramType, paramNotNull } = param || {};

      return {
        key: underlineToCamel(paramKey),
        name: paramName,
        type: getParamTypeName(paramType),
        required: paramNotNull !== '0',
        children: param?.childList?.length
          ? formatParams(param?.childList as any)
          : undefined,
      };
    }) || []
  );
}

export function transformResult(result: any) {
  const {
    baseInfo,
    restfulParam = [],
    urlParam = [],
    requestInfo = [],
    resultInfo = [],
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
  const resultData = formatParams(resultInfo?.[0]?.paramList || []);

  return {
    apiName,
    see,
    apiURI,
    methodType,
    urlParams,
    restfulParams,
    requestParams,
    resultData,
  };
}
