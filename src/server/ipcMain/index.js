const {ipcMain} = require('electron');

const oauthManager = require('./oauthManager');
const settingsManager = require('./settingsManager');


exports.start = function start(app) {
    ipcMain.on('electron-app-getPath', (e, type) => {
        e.returnValue = app.getPath(type);
    });

    oauthManager.start(app, ipcMain);
    settingsManager.start(app, ipcMain);
};
