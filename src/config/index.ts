import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('generateRequest');

export const apiHost = 'https://yuyidata.w.eolink.com/api';

export const { username } = config;

export const { password } = config;

export const { cookie } = config;
