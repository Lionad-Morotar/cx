# Playground Mock 数据层

站会模块（日会/周会）的断网自洽演示数据：虚构种子 JSON + nitro 内存态写层。

## 数据模型

| 文件                 | 模型            | 规模          | 说明                                                                                                                                                                                                                               |
| -------------------- | --------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| users.json           | User[]          | 24            | `{id, name, username, avatarUrl, created, email, state, webUrl}`；avatarUrl 指向 `/api/avatar/<username>`                                                                                                                          |
| project.json         | Project         | 1             | 五角色（pm/de/fe/be/te）`<role>Project`/`<role>Users` 为逗号分隔 ID 串，前端 `formatEAPProject` 展开                                                                                                                               |
| gitlab-projects.json | GitlabProject[] | 12            | `{id, name, webUrl, issueGroup: {code, name}, ...}`；code ∈ requirement/design/development；含 `pm-hub`/`frontend-hub`/`backend-hub` 三个枢纽仓（团队管理员视角按 URL 片段聚合）                                                   |
| labels.json          | Label[]         | 31            | 19 个 `stage: xxx` 标签（id "1"~~"19"、stepValue 0~~6，与前端 StageLabels 常量对齐）+ 12 个普通标签（id 100 起）                                                                                                                   |
| standups.json        | Standup[]       | 55            | 42 场日会（连续工作日）+ 13 场周会（每周最后工作日，chinese-workday 推算）；`participants` 为 **JSON 字符串**（元素为用户 id，前端 JSON.parse）；最近一场日会/周会为 IN_PROGRESS；`type` 为 mock 过滤用附加字段                    |
| issues.json          | Issue[]         | 120           | 约 60 字段；`eventList` 为时序递增的 label add/remove 事件流，可被 issue-stage 状态机从 wait 消化；含 18 个阶段时间戳（可空）；`title/assigneeUserName/participantUserNames/labelIds/gitlabProjectId/gitlabIssueID` 为冗余别名字段 |
| memos.json           | Memo[]          | 每会议×参会人 | `{id, assignee, meetingId, problem}`；`problem` 为 **JSON 字符串**（parse 得 `[{id, content}]`，前端 JSON.parse(problem) 消费）；内容部分含 `#<gitlabIssueID>` 引用                                                                |
| sync-time.json       | `{syncTime}`    | 1             | ISO 字符串，issues/sync 写操作会刷新为当前时刻                                                                                                                                                                                     |

时间形态约定（前端展示依赖）：

- `Standup.meetingDate`：`YYYY-MM-DD` 日期串；`startTime`/`endTime`：`HH:mm:ss` 时钟串（前端按 `meetingDate + " " + startTime` 拼接）
- Issue 时间戳：`YYYY-MM-DD HH:mm:ss`；`eventList[].createdAt` 同形态且非降序
- 议题当前阶段 = `labels` 中唯一的 stage 标签 = `issueStage`，与 eventList 末个 add 事件一致

## 再生成

```bash
pnpm gen:mocks   # 等价于 node scripts/generate-mocks.mjs
```

生成器以运行当日为锚：seed 由当日 YYYYMMDD 推导（mulberry32 PRNG），**同一天两次运行产物 diff 为空**；跨天运行则会议日期、议题时间轴整体平移到新锚日期。

## 内存态写层语义

`server/utils/mock-store.ts` 首次访问时从 `mocks/data/*.json` 读种子，之后全部写操作（开会/结束/参会人/备忘/改标题/同步）只落在内存态：

- nitro 热重载（server 文件变动）与 dev server 重启都会**重置为种子数据**——这是预期行为
- 需要全新种子时重新执行 `pnpm gen:mocks`

## 红线

全部数据为虚构生成：人名由内置姓氏+名字词库组合，项目/仓库名为天文词库，域名为 RFC 保留域 `example.com`。敏感字样（原雇主商标、内网域名、鉴权串）在本目录必须零残留，由 `tests/mock-contract.test.ts` 的拼接式扫描守护（扫描目标词不在任何交付文件中完整出现）。
