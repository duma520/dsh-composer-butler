# 输入框按钮管家 · dsh-composer-butler

统一管理 DSH 输入框（composer）工具栏上**所有插件塞进来的按钮**：逐项开关显隐，随时关掉不用的，想用时再打开。**只隐藏界面，不卸载插件**——被隐藏的插件仍在后台正常工作。

## 为什么需要它

DSH 的输入框工具栏（`conversation.input.*` 这些 slot）一旦有插件注册就必然渲染，官方渲染层**没有**逐 entry 的可见性属性，插件市场里也**没有**任何做「输入框按钮统一管理 / 显隐」的插件——所有相关插件都是在往里**加**东西。装多了就会像这样越挤越乱：

```
+  ⚠完全权限⌄  ⟳自动继续 跟随…⌄  预览  🔧技能  ⚡技能  ⏻PUA
```

## 怎么用

1. 输入框右侧多出一个 **`⋯`** 按钮；
2. 点开，面板列出当前工具栏上的**每一个**控件（含它来自哪个 slot）；
3. 勾掉不想看到的 → 立即消失；勾回来 → 立即出现；
4. 同名控件会标上 **「重复」** 徽章，那就是功能重叠的两个插件；
5. 顶部三个按钮：**重新扫描**（DOM 变动后刷新列表）、**全部恢复**（一键回到默认）、**关闭**。

状态实时存 `localStorage`（刷新不丢），并同步到插件的 `state.json`（换浏览器/清缓存也能补回来）。

## 它是怎么工作的

- 官方 `SlotOutlet` 把每个 slot 渲染成 `<div data-slot="conversation.input.xxx" style="display:contents">`，且错误边界在正常情况下**不额外包 DOM**，所以**锚点的直接子元素 = 各插件自己的根节点**——这是天然的分组边界。
- 给命中的子元素打 `data-composer-butler-hidden`，并注入一条 `[data-composer-butler-hidden]{display:none!important}`。
- 控件身份用**运行时指纹**生成：`slot::aria-label` → `title` → 文本 → `svg path` → 索引兜底。**不写死任何中文文案**，所以 DSH 改版、插件改名后仍能自动发现新控件。
- `MutationObserver`（60ms 节流）持续套用，切换会话、插件热装配导致 DOM 重建时会自动重新隐藏。

## API（host 半身）

前缀 `/@lanbaolu/dsh-composer-butler/api`：

| 方法 | 路径 | 说明 |
|---|---|---|
| GET/POST | `/state` | 读/写隐藏清单（`state.json`） |
| GET/POST | `/rules` | 读/写特征表（`rules.json`，升级适配用） |
| GET/POST | `/scan` | 读/写侦察快照（`scan.json`，开发期核对真实 DOM） |
| GET | `/info` | 返回数据目录与 API 前缀 |

会话内也可直接问：工具 `composer_butler_status`。

## 已知限制

- **依赖 DOM 结构**：DSH 大版本重写 composer 渲染时，特征选择器可能要跟着调（数据文件在插件目录，改配置即可，不必重编译）。
- **粒度是「一个插件贡献的一个控件」**：如果某插件在自己的根节点内部塞了多个按钮，本插件只能整体显隐，管不到它内部。
- **不卸载**：要彻底停用某个插件，请用侧栏「插件」页的行开关（那会把状态写进 `cordis.patch.yml`）。

## 目录

```
lib/index.js      host 半身（ESM，API + 落盘 + 工具）
lib/client.js     浏览器半身（手写 ModuleLoader bundle，零构建，只依赖 shell 提供的 react）
cordis.patch.yml  bundle patch：一行 insert 挂载 host 半身
```

零构建是刻意的：本机没有可用的 DSH 源码 checkout 与 tsc（`dev_build_plugin` 报「无 DSH checkout，且运行环境解析不到 DSH 依赖/tsc」），生态里 `dsh-our-free-model` 已验证同一路线可用。
