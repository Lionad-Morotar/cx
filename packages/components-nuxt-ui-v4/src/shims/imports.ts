// Nuxt #imports 虚拟模块占位；运行时由宿主 Nuxt 提供真实实现。
// 物料多数不直接依赖 #imports（裸用 U* 全局组件即可），
// 仅供个别物料（如 useToast/useAppConfig）typecheck 占位。
export const useAppConfig = (): Record<string, any> => ({})
