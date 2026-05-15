import { contextBridge, ipcRenderer } from 'electron';

type DragDelta = { x: number; y: number };

contextBridge.exposeInMainWorld('petOverlay', {
  moveBy(delta: DragDelta) {
    return ipcRenderer.invoke('overlay:move-by', delta);
  },
  setDragging(dragging: boolean) {
    ipcRenderer.send('overlay:set-dragging', dragging);
  },
  showMenu() {
    ipcRenderer.send('overlay:show-menu');
  },
  tuckAway() {
    ipcRenderer.send('overlay:tuck-away');
  },
  onPetData(callback: (pet: unknown) => void) {
    ipcRenderer.on('pet:data', (_event, pet) => callback(pet));
  },
  onProximity(callback: (state: unknown) => void) {
    ipcRenderer.on('pet:proximity', (_event, state) => callback(state));
  },
  onTyping(callback: () => void) {
    ipcRenderer.on('pet:typing', () => callback());
  },
  onMouseActivity(callback: () => void) {
    ipcRenderer.on('pet:mouse-activity', () => callback());
  },
  onPetNotice(callback: (notice: unknown) => void) {
    ipcRenderer.on('pet:notice', (_event, notice) => callback(notice));
  },
  onOverlayLayout(callback: (layout: unknown) => void) {
    ipcRenderer.on('overlay:layout', (_event, layout) => callback(layout));
  },
  getPetData() {
    return ipcRenderer.invoke('pet:get-data');
  },
  onSettingsData(callback: (settings: unknown) => void) {
    ipcRenderer.on('settings:data', (_event, settings) => callback(settings));
  },
  getSettingsData() {
    return ipcRenderer.invoke('settings:get-data');
  },
  saveSettingsData(settings: unknown) {
    return ipcRenderer.invoke('settings:save-data', settings);
  },
  resetSettingsData() {
    return ipcRenderer.invoke('settings:reset-data');
  },
  closeSettingsWindow() {
    ipcRenderer.send('settings:close-window');
  }
});
