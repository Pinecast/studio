const {ipcMain} = require('electron');
const settings = require('electron-settings');


const appKeys = {
    'oauth.authToken.value': settings.get('oauth.authToken.value') || null,
    'oauth.authToken.acquired': settings.get('oauth.authToken.acquired') || null,
};

const watchers = new Set();

exports.start = function start(app, ipcMain) {
    ipcMain.on('pinecast-get-app-keys', e => {
        e.returnValue = appKeys;
    });
    ipcMain.on('pinecast-watch-keys', e => {
        watchers.add(e.sender);
    });
    ipcMain.on('pinecast-unwatch-keys', e => {
        watchers.delete(e.sender);
    });
};

exports.set = function set(key, value) {
    appKeys[key] = value;
    settings.set(key, value);
    watchers.forEach(w => w.send('pinecast-got-app-keys', appKeys));
};
