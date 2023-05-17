const { app, dialog, BrowserWindow, ipcMain } = require('electron');
require('electron-reload')(__dirname);
const path = require('path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

var mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,     // Need to be false, or preload.js can't have node modules
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  var direc = "C:\\Users\\Genesect\\Desktop";

  ipcMain.on('get-dir', (event, arg) => {
    event.reply('dir', direc);
  });
  
  ipcMain.on('folder-clicked-show', (event, arg) => {
    event.reply('add-folders-list', arg);
  });
  ipcMain.on('folder-clicked-collapse', (event, arg) => {
    event.reply('collapse-folders-list', arg);
  });

  mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
  createWindow();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});