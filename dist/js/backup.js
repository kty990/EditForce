const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { readFileSync, writeFileSync } = require('fs');
// const Jimp = require('jimp');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('open-image-dialog', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
    });

    if (filePaths && filePaths.length > 0) {
        const filePath = filePaths[0];
        const imageBuffer = readFileSync(filePath);
        return imageBuffer.toString('base64');
    }

    return null;
});

ipcMain.handle('save-image-dialog', async (_, dataUrl) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
    });

    if (filePath) {
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const { data, info } = await sharp(imageBuffer).toBuffer({ resolveWithObject: true });

        if (info.format) {
            writeFileSync(filePath, data);
            return true;
        }
    }

    return false;
});
