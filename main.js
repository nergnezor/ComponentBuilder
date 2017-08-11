const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let mainWindow

// function createWindow() {
//     // Create the browser window.
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         color: '#ffffff',
//         backgroundColor: '#303030',
//         show: false
//     })

//     // and load the index.html of the app.
//     mainWindow.loadURL(url.format({
//         pathname: path.join(__dirname, 'index.html'),
//         protocol: 'file:',
//         slashes: true
//     }))

//     // Open the DevTools.
//     mainWindow.webContents.openDevTools()

//     // Emitted when the window is closed.
//     mainWindow.on('closed', function() {
//         // Dereference the window object, usually you would store windows
//         // in an array if your app supports multi windows, this is the time
//         // when you should delete the corresponding element.
//         mainWindow = null
//     })
//     mainWindow.once('ready-to-show', ()=>{
//         mainWindow.show()
//     }
//     )
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

const windowStateKeeper = require('electron-window-state');
let win;
app.on('ready', function() {
    // Load the previous state with fallback to defaults
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
    });

    // Create the window using the state information
    win = new BrowserWindow({
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': mainWindowState.width,
        'height': mainWindowState.height,
        backgroundColor: '#303030'
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools()
    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(win)
    win.once('did-finish-load', ()=>{
        // Send Message
        win.webContents.send('selected-file', 'C:\stash\electron-quick-start\components.xml');
    })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog

ipc.on('open-file-dialog', function(event) {
    console.log("open file")
    dialog.showOpenDialog({
        filters: [{
            name: 'Components XML',
            extensions: ['xml']
        }],
        properties: ['openFile']
    }, function(files) {
        if (files)
            event.sender.send('selected-file', files[0])
    })
})
