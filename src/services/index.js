const md5 = require('md5')
const { axios, authInfo } = require('../api')

const login = (username, password) => {
  if (authInfo.cookie) {
    return Promise.resolve({ statusCode: '000000', spaceKey: authInfo.spaceKey })
  }
  const secretPassword = md5(password)
  return axios.post('/common/Guest/login', {
    loginCall: username,
    loginPassword: secretPassword,
    verifyCode: '78b627ad51421de1c05e38855ad26258',
    client: 0
  })
}

const auth = (username, password) => {
  const { authInfo } = require('../api')
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      reject({ success: false, message: '请求超时！' })
    }, 5 * 1000)
    try {
      const loginRes = (await login(username, password)) || {}
      authInfo.spaceKey = loginRes.spaceKey
      if (loginRes.statusCode !== '000000') {
        authInfo.cookie = undefined
        authInfo.spaceKey = undefined
        reject({ success: false, message: loginRes.msg })
      }

      resolve({ code: 200 })
    } catch (err) {
      reject({ success: false, message: err.message })
    }
  })
}

const getInterfaceInfo = ({ apiID } = {}) => {
  const { authInfo } = require('../api')

  return axios.post('/apiManagementPro/Api/getApi', {
    spaceKey: authInfo.spaceKey,
    projectHashKey: 'eQzNgq9ae5c60a4e452990ea471c64a699bd3673890ab88',
    apiID,
  })
}

module.exports = {
  auth,
  getInterfaceInfo
}