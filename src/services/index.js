const { axios, authInfo } = require('../api')

const login = (username, password) => {
  if (authInfo.cookie) {
    return Promise.resolve({ code: 200 })
  }
  return axios.post('/login', { username, password })
}

const verify = () => {
  return axios.get('/applying/?verifying')
}

const auth = (username, password) => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      reject({ success: false, message: '请求超时，请确认是否连接内网！' })
    }, 5 * 1000)
    try {
      const loginRes = (await login(username, password)) || {}
      if (loginRes.code !== 200) {
        authInfo.cookie = undefined
        reject({ success: false, message: loginRes.msg })
      }
      const verifyRes = (await verify()) || {}
      if (verifyRes.code !== 200) {
        reject({ success: false, message: verifyRes.msg })
      }
      resolve({ code: 200 })
    } catch (err) {
      reject({ success: false, message: err.message })
    }
  })
}

module.exports = {
  auth
}