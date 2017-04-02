const {BrowserWindow} = require('electron');
const {URL} = require('url');

const constants = require('../../shared/constants');
const settingsManager = require('./settingsManager');


let oauthStateString = '';
let oauthWindow = null;

function startOAuthFlow() {
    if (oauthWindow) {
        return;
    }

    oauthWindow = new BrowserWindow({
        height: 600,
        width: 350,

        webPreferences: {
            nodeIntegration: false,
        },
    });
    oauthWindow.on('closed', () => {
        oauthWindow = null;
    });
    oauthWindow.webContents.on('will-navigate', (e, url) => {
        // TODO: do this check with the URL object below
        if (url.substr(0, constants.oauthInterceptURL.length) === constants.oauthInterceptURL) {
            oauthWindow.close();

            const u = new URL(url);
            if (u.searchParams.get('state') !== oauthStateString) {
                return;
            }

            const token = u.searchParams.get('code');
            settingsManager.set('oauth.authToken.value', token);
            settingsManager.set('oauth.authToken.acquired', new Date().toISOString());
        }
    });

    oauthStateString = Math.random().toString(36);

    oauthWindow.loadURL(`http://localhost:8000/oauth/authorize/?client_id=${constants.clientID}&state=${oauthStateString}&response_type=code`);
}

exports.start = function(app, ipcMain) {
    ipcMain.on('pinecast-oauth-start', e => {
        startOAuthFlow();
    });
};
