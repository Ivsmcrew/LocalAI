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
  OPEN_CHAT: 'stack:open-chat',
} as const
