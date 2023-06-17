const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const config = require("./dist/config.json");
const fs = require('fs');

const EXTENSION = "mie"
let DEFAULT_FILE_DATA = {
    "layers": [
        {
            "name": "test_layer",
            "z-index": 0,
            "dataURL": "NO DATA URL"
        }
    ]
}
DEFAULT_FILE_DATA = JSON.stringify(DEFAULT_FILE_DATA)

class GraphicsWindow {
    constructor() {
        this.window = null;
        this.current_z_index = 0;
        this.layers = []; // List to store layers
        this.active_layer = null; // Currently active layer

        this.currentProject = null; this.currentProject = null;

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
                preload: path.join(__dirname, './dist/js/preload.js')
            },
        });

        // Set the window icon
        const iconPath = path.join(__dirname, './dist/images/icon.png');
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

        const newFile = async () => {
            const result = await dialog.showSaveDialog({
                title: 'New File',
                buttonLabel: 'Save',
                filters: [
                    { name: 'Project Files', extensions: [EXTENSION] }
                ]
            })

            try {
                fs.writeFile(result.filePath, DEFAULT_FILE_DATA, (err) => {
                    if (err) {
                        console.error('An error occurred:', err);
                    } else {
                        console.log('File saved successfully!');
                    }
                });
                this.window.webContents.send('open-client', result.filePath);
            } catch (e) {
                console.error(e);
            }
        }

        const open = async () => {
            const result = await dialog.showOpenDialog(this.window, {
                filters: [
                    { name: 'Project Files', extensions: [EXTENSION] }
                ]
            });
            try {
                fs.readFile(result.filePath, (err, data) => {
                    if (err) {
                        console.error('An error occurred:', err);
                    } else {
                        console.log('File read successfully!\t', atob(data));
                        this.currentProject = result.filePath;
                    }
                })
                this.window.webContents.send('open-client', result.filePath);
            } catch (e) {
                console.error(e);
            }
        }

        const save = () => {
            if (true) {
                console.log("Save")
            }
        }

        const saveas = () => {
            if (true) {
                let obj = {
                    "layers": [
                        {
                            "name": "test_layer",
                            "z-index": 0,
                            "dataURL": "NO DATA URL"
                        }
                    ]
                }
                let jsn = JSON.stringify(obj);
                console.log(jsn, typeof (jsn));
                let encoded = btoa(jsn);
                let decoded = atob(encoded);
                console.log(encoded, "\t", decoded);
                fs.writeFile('projectDataTest', encoded, (err) => {
                    if (err) {
                        console.error('An error occurred:', err);
                    } else {
                        console.log('File saved successfully!');
                    }
                });
            }
        }


        const menuTemplate = [
            {
                label: 'File',
                submenu: [
                    { label: 'New', click: newFile },
                    { label: 'Open', click: open },
                    { label: 'Refresh', role: 'reload' },
                    { type: 'separator' },
                    { label: 'Save', click: save },
                    { label: 'Save As', click: saveas },
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

        this.window.loadFile('./dist/html/index.html');

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