import { underlineToCamel } from './utils';

type RequestMethod = 0 | 1 | 2 | 3;

const requestMethodMapping = {
  0: 'post',
  1: 'get',
  2: 'put',
  3: 'delete',
};

const typeMapping = {
  0: 'string',
  3: 'number',
  7: 'string',
  8: 'boolean',
  11: 'string',
  12: 'array',
  13: 'object',
};

type ParamNameType = keyof typeof typeMapping;

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
function formatParams(
  params: FormatParamsType & Result[],
  dataStructureObj?: { [key: string]: any },
): Result[] {
  return (
    params?.map((param) => {
      const { paramKey, paramName = '', paramType, paramNotNull } = param || {};

      const structure = dataStructureObj?.[paramType];
      const isComplexType = Boolean(structure);
      // 目前暂定复杂类型是 object
      const actualType = isComplexType ? 'object' : getParamTypeName(paramType);

      const childList = isComplexType
        ? structure?.structureData
        : param?.childList;

      return {
        key: underlineToCamel(paramKey),
        name: paramName,
        type: actualType,
        required: paramNotNull !== '1',
        children: childList?.length
          ? formatParams(childList as any, dataStructureObj)
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
    dataStructureList: dataStructureObj = {},
  } = result || {};
  console.log(
    '🚀 ~ file: transform.ts ~ line 73 ~ transformResult ~ result',
    result,
  );

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

  const urlParams = formatParams(urlParam, dataStructureObj);
  const restfulParams = formatParams(restfulParam, dataStructureObj);
  const requestParams = formatParams(requestInfo, dataStructureObj);
  const resultData = formatParams(
    resultInfo?.[0]?.paramList || [],
    dataStructureObj,
  );

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
