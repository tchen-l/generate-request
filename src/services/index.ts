import md5 from 'md5';
import axios, { authInfo } from '../api';

const login: (
  username: string,
  password: string,
) => Promise<{ statusCode: string; msg?: string }> = (username, password) => {
  if (authInfo.cookie) {
    return Promise.resolve({ statusCode: '000000' });
  }
  const secretPassword = md5(password);
  return axios.post('/common/Guest/login', {
    loginCall: username,
    loginPassword: secretPassword,
    verifyCode: '78b627ad51421de1c05e38855ad26258',
    client: 0,
  });
};

const getUserInfo: () => Promise<{
  statusCode: string;
  msg?: string;
  userInfo: { spaceKey: string };
}> = () => axios.post('/common/User/getUserInfo');

export const auth = (username: string, password: string) => {
  const { authInfo } = require('../api');
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      reject({ success: false, message: '请求超时！' });
    }, 5 * 1000);
    try {
      const loginRes = await login(username, password);
      if (loginRes?.statusCode !== '000000') {
        authInfo.cookie = undefined;
        authInfo.spaceKey = undefined;
        reject({ success: false, message: loginRes.msg });
        return;
      }
      const userRes = await getUserInfo();
      if (userRes?.statusCode !== '000000') {
        authInfo.cookie = undefined;
        authInfo.spaceKey = undefined;
        reject({ success: false, message: userRes.msg });
        return;
      }
      authInfo.spaceKey = userRes?.userInfo?.spaceKey;
      resolve({ code: 200 });
    } catch (err) {
      reject({ success: false, message: err.message });
    }
  });
};

export const getInterfaceInfo: ({
  apiID: string,
}) => Promise<{ statusCode: string; apiInfo: any }> = ({ apiID }) => {
  const { authInfo } = require('../api');

  return axios.post('/apiManagementPro/Api/getApi', {
    spaceKey: authInfo.spaceKey,
    projectHashKey: 'eQzNgq9ae5c60a4e452990ea471c64a699bd3673890ab88',
    apiID,
  });
};
