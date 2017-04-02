const {ipcMain} = require('electron');
const settings = require('electron-settings');


const appKeys = {
    'oauth.authToken.value': settings.get('oauth.authToken.value') || null,
    'oauth.authToken.acquired': settings.get('oauth.authToken.acquired') || null,
};

exports.start = function start(app, ipcMain) {
    ipcMain.on('pinecast-get-app-keys', e => {
        e.returnValue = appKeys;
    });
};

exports.set = function set(key, value) {
    appKeys[key] = value;
    settings.set(key, value);
};
