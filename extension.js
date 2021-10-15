// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { apiHost, username, password } = require('./src/config')
const { auth, getInterfaceInfo } = require('./src/services')
const { getSnippetTemplate } = require('./src/helpers/snippet')
const { SnippetString } = vscode

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('generate-request.interfaceCode', function () {
    // The code you place here will be executed every time your command is executed
    const activeTextEditor = vscode.window.activeTextEditor

    if ([apiHost, username, password].includes('')) {
      vscode.window.showErrorMessage('请先前往扩展完善基本信息！')
      return
    }
    vscode.window.showInputBox({
      title: '接口信息',
      value: '{id}',
      placeHolder: "请输入接口id",
      prompt: '只需填写接口 {id}。'
    }).then(async id => {
      try {
        if (!id) {
          return
        }

        await auth(username, password)
        const res = await getInterfaceInfo(id)
        const { code, result, msg } = res || {}

        if (code !== 200) {
          throw Error(msg || '请求接口信息失败')
        }
        const snippetTemp = getSnippetTemplate(result)
        const snippet = new SnippetString(snippetTemp)
        if (!activeTextEditor) {
          throw Error('当前激活的编辑器不是文件或者没有文件被打开！')
        }
        activeTextEditor.insertSnippet(snippet, activeTextEditor.selection);
      } catch (err) {
        vscode.window.showErrorMessage(err.message)
      }
    })
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
