const axios = require('axios').default
const qs = require('qs')
const { apiHost } = require('../config')
const authInfo = { cookie: undefined, spaceKey: undefined }

const service = axios.create({
  baseURL: apiHost,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

service.interceptors.request.use(config => {
  config.data = qs.stringify(config.data) // 转为formdata数据格式
  if (authInfo.cookie) {
    config.headers['cookie'] = authInfo.cookie
  }

  return config
})

service.interceptors.response.use(response => {
  const res = response.data

  if (!authInfo.cookie) {
    const findCookieItem = response.headers['set-cookie'].find(item => item.includes('userToken')).split(';')
    authInfo.cookie = Array.isArray(findCookieItem) ? findCookieItem[0] : undefined
  }

  return res
}, (error) => {
  if (!error.__CANCEL__) {
    return Promise.reject(error);
  }
  return Promise.resolve({
    error,
    success: false,
  });
})

module.exports = {
  axios: service,
  authInfo
}