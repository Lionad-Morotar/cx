import { createApp } from 'vue'

import { CxLoader, cxNode, type CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 构造测试可用的最小 CxLoader。
 *
 * 绕开 init() 的远程 metadata 拉取（playground 的 plugin.client 走 init(url) 会触网），
 * 手动补齐 installComponent 所依赖的 config.app 与 installed/installedAsync 字典
 * （新 loader 中这两者为 null，installComponent 用非空断言访问会崩）。
 */
export function createTestCx() {
  const app = createApp({ render: () => null })
  const cx = new CxLoader() as unknown as {
    config: unknown
    installed: Record<string, unknown>
    installedAsync: Record<string, unknown>
    installComponent: (key: string, comp: unknown) => Promise<void>
  }
  cx.config = { app, type: 'umd' }
  cx.installed = Object.create(null)
  cx.installedAsync = Object.create(null)
  return cx
}

/**
 * 把一组 normalize 过的物料安装进 loader（与 standup-materials.ts 的装配方式一致）。
 */
export function installMaterials(
  cx: ReturnType<typeof createTestCx>,
  materials: Record<string, unknown>,
) {
  for (const comp of Object.values(materials)) {
    const key = (comp as { _cx_meta?: { key?: string } })?._cx_meta?.key
    if (key) {
      void cx.installComponent(key, comp)
    }
  }
}

/**
 * 低样板构造 schema 节点（补齐未提供的可选字段），供测试内联组装页面树。
 */
export function comp(
  id: string,
  key: string,
  data: Record<string, unknown> = {},
  components: Record<string, CxComponentRuntime[]> = {},
  parents: string[] = [],
): CxComponentRuntime {
  // 委托平台工厂 cxNode 填充标准字段。parents 是测试断言树关系用的，
  // schema 层不需要，故不在 cxNode 主签名，由本适配层补回。
  const c = cxNode(id, key, components, data)
  c.parents = parents
  return c
}
