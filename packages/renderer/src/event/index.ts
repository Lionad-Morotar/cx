/**
 * 事件系统已下沉至 @lionad/cx-definition（loader 直接消费），
 * 本文件仅作兼容转发出口；nativeEvents 目录保留在本地（native-event.ts）。
 */
export {
  isValidEvent,
  isValidSubEvent,
  createEvent,
  createSubEvent,
  createCxEmitter,
} from '@lionad/cx-definition'
