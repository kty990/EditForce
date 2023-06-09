const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const config = require("../config.json");

const EXTENSION = "mie"

class GraphicsWindow {
    constructor() {
        this.window = null;
        this.current_z_index = 0;
        this.layers = []; // List to store layers
        this.active_layer = null; // Currently active layer

        app.on('ready', () => {
            this.createWindow();
        });
    }

    createWindow() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,   // Set the minimum width
            minHeight: 600,  // Set the minimum height
            webPreferences: {
                nodeIntegration: true,
                spellcheck: false,
                preload: path.join(__dirname, 'preload.js')
            },
        });

        // Set the window icon
        const iconPath = path.join(__dirname, '../images/icon.png');
        this.window.setIcon(iconPath);

        const placeholder = (prompt) => {
            let func = () => {
                console.log(prompt);
            }
            return func;
        }

        const toggleDevTools = () => {
            this.window.webContents.toggleDevTools();
        }


        let exportImg = async () => {
            const result = await dialog.showSaveDialog(this.window, {
                defaultPath: `export.png`,
                filters: [
                    { name: 'PNG Images', extensions: ['png'] },
                    { name: 'JPEG Images', extensions: ['jpeg', 'jpg'] },
                    { name: 'WEBP Images', extensions: ['webp'] }
                    // { name: 'All Files', extensions: ['*'] }
                ]
            });

            if (result.canceled || !result.filePath) {
                return;
            }

            // Send event to renderer to save the image
            this.window.webContents.send('export-client', result.filePath);
        }


        const menuTemplate = [
            {
                label: 'File',
                submenu: [
                    { label: 'New', click: placeholder("New") },
                    { label: 'Open', click: placeholder("Open") },
                    { label: 'Refresh', role: 'reload' },
                    { type: 'separator' },
                    { label: 'Save', click: placeholder("Save") },
                    { label: 'Save As', click: placeholder("Save As") },
                    { label: 'Export', click: exportImg },
                    { type: 'separator' },
                    { label: 'Exit', click: app.quit }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { label: 'Cut', role: 'cut' },
                    { label: 'Copy', role: 'copy' },
                    { label: 'Paste', role: 'paste' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', click: toggleDevTools }
                ]
            }
            // Add more menu items as needed
        ];

        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);

        this.window.setMenu(menu);

        this.window.loadFile('../html/index.html');

        this.window.on('closed', () => {
            this.window = null;
        });

    }
}

const graphicsWindow = new GraphicsWindow();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        graphicsWindow.createWindow();
    }
});


ipcMain.on("export-server", (event, data) => {
    console.log(`Ready to export ${data}`);
});

if (process.platform === 'win32') {
    app.setAppUserModelId(config['project-name']);
}