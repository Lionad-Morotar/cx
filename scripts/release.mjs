#!/usr/bin/env node

/**
 * 多包（workspace）发布脚本 — pnpm release
 *
 * 生命周期门禁链在根 package.json 配置，本脚本不重复:
 *   pnpm release → prerelease → pnpm build → prebuild → pnpm test
 *
 * 2FA/OTP 边界: npm 账号开 auth-and-writes 2FA 时，pnpm 12 会对每个 publish
 * 进程启动 web 授权流（"Press ENTER to open the URL in your browser."——按 Enter
 * 才启动轮询，仅在浏览器完成验证 CLI 无感知）。多包 = 最多 11 次授权，不可行。
 * 正式发布请配 bypass-2FA 的 granular access token 写入 ~/.npmrc 后
 * `! pnpm release`（全程无交互）；dry-run 不受影响。
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// ─── 配置 ────────────────────────────────────────────────────

/** 按依赖序硬编码（被依赖者先发），路径相对仓库根目录 */
const PACKAGES = [
  'packages/definition',
  'packages/stream',
  'packages/vue',
  'packages/renderer',
  'packages/comps',
  'packages/comps-element-plus',
  'packages/comps-naive-ui',
  'packages/comps-nuxt-ui-v2',
  'packages/comps-nuxt-ui-v4',
  'packages/comps-vtu',
  'packages/nuxt',
]

/**
 * 显式锁官方源：本地 .npmrc 可能指向镜像（npmmirror），发布必须打到 npmjs。
 * Why 用 --config.registry= 形式: pnpm 12 起 `publish --registry` flag 已移除，
 * `npm_config_registry` 环境变量也不再覆盖用户 .npmrc，CLI 参数是唯一可靠入口。
 */
const REGISTRY = 'https://registry.npmjs.org'

// ─── 参数 ────────────────────────────────────────────────────

// pnpm 会把 `--` 字面量原样透传给脚本，需过滤
const args = process.argv.slice(2).filter((a) => a !== '--')
const dryRun = args.includes('--dry-run')

// ─── 发布 ────────────────────────────────────────────────────

/**
 * tarball 完整性实测（仅 dry-run）：`pnpm publish --dry-run` 的 SKIP 输出不展示
 * 文件清单，打包工具链 silent 丢文件无从发现——pnpm 12 alpha 实测会把 files
 * 白名单内产物清空（仅剩 main + README + package.json 的坍缩态）。实测 tarball
 * 两处：文件数 > 3（坍缩拦截）、tarball 内 package.json 无 workspace:* 残留。
 */
function verifyTarball(pkgDir, pkg) {
  const tmp = mkdtempSync(join(tmpdir(), 'release-pack-'))
  try {
    execFileSync('pnpm', ['pack', '--pack-destination', tmp], {
      cwd: pkgDir,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    })
    const tgz = readdirSync(tmp).find((f) => f.endsWith('.tgz'))
    const listing = execFileSync('tar', ['-tzf', join(tmp, tgz)], { encoding: 'utf8' }).trim().split('\n')
    if (listing.length <= 3) {
      console.error(`✗ ${pkg.name} tarball 仅 ${listing.length} 个文件，疑似打包丢产物: ${listing.join(', ')}`)
      process.exit(1)
    }
    const pkgJson = execFileSync('tar', ['-xzf', join(tmp, tgz), '-O', 'package/package.json'], { encoding: 'utf8' })
    if (/"workspace:/.test(pkgJson)) {
      console.error(`✗ ${pkg.name} tarball 内 dependencies 仍含 workspace:* 残留（应经 pnpm publish 转换）`)
      process.exit(1)
    }
    console.log(`  tarball 实测 ${listing.length} 个文件，无 workspace:* 残留`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

const root = process.cwd()

for (const dir of PACKAGES) {
  const pkgDir = join(root, dir)
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))

  // dist-tag 自动推导: prerelease 段（0.1.0-alpha.0）→ --tag alpha，防止顶掉 latest。
  // 注意 npm 平台行为: 首发时 registry 强制 latest 指向首版本，该防护只对已有 latest 的包生效。
  const channel = pkg.version.match(/-([a-z]+)/i)?.[1]
  const tagArgs = channel ? ['--tag', channel] : []

  const publishArgs = [
    'publish',
    `--config.registry=${REGISTRY}`,
    // 发版流程本身已保证工作区干净，pnpm 的 git-checks 额外要求（如必须在 main）易误伤
    '--no-git-checks',
    ...tagArgs,
    ...args,
  ]
  console.log(`\n▸ ${pkg.name}@${pkg.version} (tag: ${channel ?? 'latest'})${dryRun ? ' [dry-run]' : ''}`)

  if (dryRun) verifyTarball(pkgDir, pkg)

  try {
    // cwd 设为包目录后裸 `pnpm publish`: `pnpm publish <dir>` 后接 flag 有解析冲突。
    // 必须用 pnpm 而非 npm——只有 pnpm 会把 workspace:* 转成实体版本号（npm 原样打包，安装即炸）。
    // Windows 上 pnpm 是 .cmd，execFileSync 需要 shell 才能解析。
    execFileSync('pnpm', publishArgs, {
      cwd: pkgDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
  } catch {
    console.error(`\n✗ ${pkg.name} 发布失败，已中止。已发布的包不会回滚，修复后重跑即可。`)
    process.exit(1)
  }
}

console.log(`\n✓ ${dryRun ? 'dry-run 通过' : '全部发布完成'}（${PACKAGES.length} 个包）`)
