import axios from 'axios';
import { stringify } from 'qs';
import { apiHost, cookie as defaultCookie } from '../config';

export const authInfo: { cookie?: string; spaceKey?: string } = {
  cookie: defaultCookie,
  spaceKey: undefined,
};

const service = axios.create({
  baseURL: apiHost,
  headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

service.interceptors.request.use((config) => {
  // eslint-disable-next-line no-param-reassign
  config.data = stringify(config.data); // 转为formdata数据格式
  if (authInfo.cookie && config.headers) {
    // eslint-disable-next-line no-param-reassign
    config.headers.cookie = authInfo.cookie;
  }

  return config;
});

service.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (!authInfo.cookie) {
      const findCookieItem = (response.headers['set-cookie'] as any)
        ?.find((item: string) => item?.includes('userToken'))
        .split(';');
      authInfo.cookie = Array.isArray(findCookieItem)
        ? findCookieItem[0]
        : undefined;
    }

    return res;
  },
  (error) => {
    // eslint-disable-next-line no-underscore-dangle
    if (!error.__CANCEL__) {
      return Promise.reject(error);
    }
    return Promise.resolve({
      error,
      success: false,
    });
  },
);

export default service;
