'use strict';
const electron = require('electron');
const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function createMainWindow() {
    const win = new electron.BrowserWindow({
        width: 600,
        height: 400
    });

    win.loadURL(`file://${__dirname}/src/ui/record/index.html`);
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


// Post-startup includes
require('./bg/postStartup');
