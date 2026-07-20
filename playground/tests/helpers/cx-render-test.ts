import { createApp } from 'vue'

import { CxLoader } from '@lionad/cx-definition'

import type { CxComponentRuntime } from '@lionad/cx-definition'

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
    installComponent: (key: string, cmpt: unknown) => Promise<void>
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
  for (const cmpt of Object.values(materials)) {
    const key = (cmpt as { _cx_meta?: { key?: string } })?._cx_meta?.key
    if (key) {
      void cx.installComponent(key, cmpt)
    }
  }
}

/**
 * 低样板构造 schema 节点（补齐未提供的可选字段），供测试内联组装页面树。
 */
export function cmpt(
  id: string,
  key: string,
  data: Record<string, unknown> = {},
  components: Record<string, CxComponentRuntime[]> = {},
  parents: string[] = [],
): CxComponentRuntime {
  return {
    id,
    key,
    name: id,
    data,
    components,
    parents,
    aliasKeys: [],
    props: {},
    emits: {},
    exposes: {},
  } as CxComponentRuntime
}
