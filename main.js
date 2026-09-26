const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') 
    }
  })
  win.removeMenu()
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Source Models', extensions: ['mdl'] }]
    });
    
    if (!canceled && filePaths.length > 0) {
      let rawPath = filePaths[0];
      let cleanPath = rawPath.replace(/\\/g, '/');
      const match = cleanPath.match(/(models\/.*\.mdl)$/i);
      
      if (match) return match[1]; 
      return cleanPath;
    }
  });
  ipcMain.on('app:openExternal', (event, url) => {
    shell.openExternal(url);
  });
  ipcMain.handle('dialog:exportAddon', async (event, codeContent, addonName, className) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select your garrysmod/addons folder',
      properties: ['openDirectory']
    });
    
    if (!canceled && filePaths.length > 0) {
      const baseDirectory = filePaths[0]; 
      const targetDirectory = path.join(baseDirectory, addonName, 'lua', 'weapons');
      try {
        fs.mkdirSync(targetDirectory, { recursive: true });
        const finalFilePath = path.join(targetDirectory, `${className}.lua`);
        fs.writeFileSync(finalFilePath, codeContent);
        
        return true;
      } catch (error) {
        console.error("Failed to create directories or file:", error);
        return false;
      }
    }
    return false;
  });

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})