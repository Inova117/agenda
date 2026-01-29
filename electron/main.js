const { app, BrowserWindow } = require('electron');
const path = require('path');
const serve = require('electron-serve').default || require('electron-serve');

const appServe = app.isPackaged ? serve({ directory: path.join(__dirname, '../out') }) : null;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        title: "Agenda",
        autoHideMenuBar: true,
    });

    if (app.isPackaged) {
        appServe(win).then(() => {
            win.loadURL('app://-');
            win.webContents.openDevTools();
        });
    } else {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
        win.webContents.on('did-fail-load', (e, code, desc) => {
            win.webContents.reloadIgnoringCache();
        });
    }
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
