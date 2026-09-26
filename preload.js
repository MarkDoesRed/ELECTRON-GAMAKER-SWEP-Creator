const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
    exportAddon: (code, addonName, className) => ipcRenderer.invoke('dialog:exportAddon', code, addonName, className),
    openExternal: (url) => ipcRenderer.send('app:openExternal', url)
});