const vscode = require('vscode');
const { username, password } = vscode.workspace.getConfiguration('generateRequest')

module.exports = {
  apiHost: 'https://yuyidata.w.eolink.com/api',
  username,
  password
}