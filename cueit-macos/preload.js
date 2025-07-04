import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  start: apps => ipcRenderer.invoke('start', apps),
  onLog: handler => ipcRenderer.on('log', (_e, data) => handler(data)),
  readEnvs: () => ipcRenderer.invoke('read-envs'),
  writeEnvs: envs => ipcRenderer.invoke('write-envs', envs)
});
