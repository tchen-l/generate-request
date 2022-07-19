// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { username, password, cookie } from './config';
import { auth, getInterfaceInfo } from './services';
import { transformResult } from './helpers/transform';
import { getSnippetTemplate, getSnippetTemplate2Ts } from './helpers/snippet';
import { authInfo } from './api';

const typeOptions = ['JavaScript', 'TypeScript'];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    'generate-request.interfaceCode',
    async () => {
      // The code you place here will be executed every time your command is executed
      const activeTextEditor = vscode.window.activeTextEditor;
      if ([username, password].includes('') && !cookie) {
        vscode.window.showErrorMessage('请先前往扩展完善基本信息！');
        return;
      }
      const type = await vscode.window.showQuickPick(typeOptions);

      if (!type || !typeOptions.includes(type)) {
        return;
      }

      const apiID = await vscode.window.showInputBox({
        title: '接口信息',
        value: 'apiID',
        placeHolder: '请输入接口 apiID',
        prompt: '只需填写接口 apiID。',
      });

      try {
        if (!apiID) {
          return;
        }
        await auth(username, password);
        const res = await getInterfaceInfo({ apiID });
        const { statusCode, apiInfo } = res || {};

        if (statusCode !== '000000') {
          authInfo.cookie = undefined;
          throw Error('请求接口信息失败，请重试！');
        }

        const transformData = transformResult(apiInfo);
        const snippetTemp =
          type === 'JavaScript'
            ? getSnippetTemplate(transformData)
            : getSnippetTemplate2Ts(transformData);

        const snippet = new vscode.SnippetString(snippetTemp);

        if (!activeTextEditor) {
          throw Error('当前激活的编辑器不是文件或者没有文件被打开！');
        }
        activeTextEditor.insertSnippet(snippet, activeTextEditor.selection);
      } catch (err: any) {
        vscode.window.showErrorMessage(err.message);
      }
    },
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
