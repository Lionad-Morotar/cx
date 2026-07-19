/**
 * Nuxt #build/app.config 的离线 shim：宿主应用可经 cx-nuxt module 注入覆盖，
 * 默认空 ui 段（组件配置回退 ui.config 默认值，strategy 读取不炸）。
 */
export default { ui: {} as Record<string, any> }
