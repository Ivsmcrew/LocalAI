/** 
 * IPC каналы для взаимодействия между процессами
 */
export const IPC = {
  INIT: 'stack:init',
  START: 'stack:start',
  STOP: 'stack:stop',
  STATUS: 'stack:status',
  LOG: 'stack:log',
  INIT_PROGRESS: 'stack:init-progress',
  ENTER_SHELL: 'window:enter-shell',
} as const
