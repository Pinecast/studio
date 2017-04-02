'use strict';
const electron = require('electron');
const {app, ipcMain} = electron;

const os = require('os');

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function createMainWindow() {
    const win = new electron.BrowserWindow({
        height: 400,
        titleBarStyle: 'hidden-inset',
        width: 600,

        webPreferences: {
            backgroundThrottling: false,
        },
    });

    win.loadURL(`file://${__dirname}/src/ui/views/record.html`);
    win.setTitle('Authorize Pinecast Studio')
    win.on('closed', () => {
        mainWindow = null;
    });

    return win;
}

app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.on('ready', () => {
    mainWindow = createMainWindow();
});

require('./src/server/ipcMain').start(app);
