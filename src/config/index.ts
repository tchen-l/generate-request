import * as vscode from 'vscode';
const config = vscode.workspace.getConfiguration('generateRequest');

export const apiHost = 'https://yuyidata.w.eolink.com/api';

export const username = config.username;

export const password = config.password;

export const cookie = config.cookie;
