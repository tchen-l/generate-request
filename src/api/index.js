const axios = require('axios').default
const { apiHost } = require('../config')
const authInfo = { cookie: undefined }
const service = axios.create({ baseURL: `${apiHost}/api`, withCredentials: true })

service.interceptors.request.use(config => {
  if (authInfo.cookie) {
    config.headers['Cookie'] = authInfo.cookie
  }
  return config
})

service.interceptors.response.use(response => {
  const res = response.data
  if (!authInfo.cookie) {
    authInfo.cookie = response.headers['set-cookie']
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