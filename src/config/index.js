const vscode = require('vscode');
const { apiHost, username, password } = vscode.workspace.getConfiguration('generateRequest')

module.exports = {
  apiHost,
  username,
  password
}