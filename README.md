# 输入框按键管家 · dsh-composer-butler

> **一句话**：给你的 DSH 输入框工具栏装一个「总开关面板」——把那些你可能一年用一次、却天天占着地方的按钮收起来，想用的时候一条命令全放回来。

[![版本](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/duma520/dsh-composer-butler/releases)
[![许可](https://img.shields.io/badge/license-BSD--3--Clause-green)](LICENSE)
[![平台](https://img.shields.io/badge/platform-DSH%20Web%20GUI-purple)](https://github.com/duma520/dsh-composer-butler)
[![构建](https://img.shields.io/badge/build-%E9%9B%B6%E6%9E%84%E5%BB%BA-brightgreen)](https://github.com/duma520/dsh-composer-butler)

> 本项目遵守「任何敏感信息不得上传到仓库」的最高红线：仓库里没有你的隐藏清单、没有扫描快照、没有任何密钥。
> 运行期数据（`state.json` / `scan.json` / `rules.json`）全部在 `.gitignore` 里，永远不会被提交。

---

## 目录

- [一、这是什么东西](#一这是什么东西)
  - [1.1 用一句人话说](#11-用一句人话说)
  - [1.2 一个类比](#12-一个类比)
  - [1.3 五个真实场景](#13-五个真实场景)
  - [1.4 它**不**做什么](#14-它不做什么)
  - [1.5 名词表（看不懂先查这里）](#15-名词表看不懂先查这里)
- [二、零基础安装](#二零基础安装)
  - [2.1 装之前先确认三件事](#21-装之前先确认三件事)
  - [2.2 方式一：从 zip / 源码装进 profile（通用）](#22-方式一从-zip--源码装进-profile通用)
  - [2.3 方式二：本机有注入器插件时，一条命令](#23-方式二本机有注入器插件时一条命令)
  - [2.4 方式三：开发调试（改完即生效）](#24-方式三开发调试改完即生效)
  - [2.5 三种验证方法](#25-三种验证方法)
  - [2.6 卸载（含数据清理）](#26-卸载含数据清理)
  - [2.7 装崩了怎么救](#27-装崩了怎么救)
- [三、界面完全图解](#三界面完全图解)
  - [3.1 按钮长在哪](#31-按钮长在哪)
  - [3.2 面板逐行说明](#32-面板逐行说明)
  - [3.3 面板底部的四个动作](#33-面板底部的四个动作)
  - [3.4 勾掉之后发生什么](#34-勾掉之后发生什么)
  - [3.5 「重复」徽章是什么](#35-重复徽章是什么)
- [四、五个手把手场景](#四五个手把手场景)
  - [场景 1：把用不上的按钮全收起来](#场景-1把用不上的按钮全收起来)
  - [场景 2：某个按钮突然不见了，怎么找回来](#场景-2某个按钮突然不见了怎么找回来)
  - [场景 3：换浏览器 / 换电脑，隐藏清单还在吗](#场景-3换浏览器--换电脑隐藏清单还在吗)
  - [场景 4：两个插件功能重复，留哪个](#场景-4两个插件功能重复留哪个)
  - [场景 5：只想临时藏一下，不想它记住](#场景-5只想临时藏一下不想它记住)
- [五、配置文件与 HTTP API](#五配置文件与-http-api)
  - [5.1 三个数据文件](#51-三个数据文件)
  - [5.2 `state.json` 逐字段](#52-statejson-逐字段)
  - [5.3 `scan.json` 逐字段](#53-scanjson-逐字段)
  - [5.4 `rules.json`](#54-rulesjson)
  - [5.5 数据目录怎么定](#55-数据目录怎么定)
  - [5.6 HTTP API 全表](#56-http-api-全表)
  - [5.7 浏览器 localStorage 键](#57-浏览器-localstorage-键)
  - [5.8 手工编辑 state.json 的正确姿势](#58-手工编辑-statejson-的正确姿势)
- [六、工作原理（想改代码的人看）](#六工作原理想改代码的人看)
  - [6.1 为什么必须这么做](#61-为什么必须这么做)
  - [6.2 DOM 锚点机制](#62-dom-锚点机制)
  - [6.3 控件身份指纹算法](#63-控件身份指纹算法)
  - [6.4 防自锁](#64-防自锁)
  - [6.5 自愈：MutationObserver](#65-自愈mutationobserver)
  - [6.6 状态单例为何重要](#66-状态单例为何重要)
  - [6.7 host / client 两个半身](#67-host--client-两个半身)
  - [6.8 为什么零构建](#68-为什么零构建)
  - [6.9 一次完整生命周期](#69-一次完整生命周期)
- [七、排错手册](#七排错手册)
- [八、FAQ（15 问）](#八faq15-问)
- [九、已知限制与安全说明](#九已知限制与安全说明)
- [十、目录结构、测试与开发](#十目录结构测试与开发)
- [十一、版本更新简介](#十一版本更新简介)
- [十二、贡献与许可](#十二贡献与许可)
- [附录 A：与同类方案对比](#附录-a与同类方案对比)
- [附录 B：一分钟速查卡](#附录-b一分钟速查卡)

---

## 一、这是什么东西

### 1.1 用一句人话说

DSH 的输入框上方、下方、两侧，会挂着很多插件塞进来的小按钮：技能、PUA、Computer Use、语音输入、文件浏览……插件一多，输入框就被挤成一条缝。

**这个插件给你一个「⋯」按钮。点开它，是一个清单，列出输入框工具栏里现在有哪些控件；不想要的，勾掉就立刻从界面上消失；想要的，勾回来就回来。它会记住你的选择，下次打开还在。**

### 1.2 一个类比

把它想成**工具箱的抽屉**：

- 你的工具箱（DSH 输入框）里有 20 件工具，但常用的只有 3 件。
- 官方没给你抽屉，所有工具都摊在桌面上。
- 这个插件做了一件事：**给每件工具贴标签，然后告诉你「哪些可以收起来」**，收起来只是看不见，工具还在，随时能拿出来。

再换个说法：它像 Windows 的「显示/隐藏桌面图标」。图标藏了，程序还在，双击桌面空白处右键就能调回来——不是卸载。

### 1.3 五个真实场景

**场景 A：输入框被挤爆了**

你装了 8 个插件，输入框右侧排了一长串图标，每点一次都怕点错。打开面板，把「PUA」「Computer Use」「语音输入」勾掉，输入框瞬间清爽，只剩你每天用的「发送」和「文件」。

**场景 B：某个按钮在开会演示时很碍眼**

你要给同事演示 DSH，不想让他看到一堆实验性按钮。演示前勾掉，演示后勾回来——不用卸载重装，不用改配置。

**场景 C：你有两个功能重复的插件**

一个插件提供「技能」按钮，另一个也提供，两个并排出现，点哪个都行但看着乱。面板里会给它们都打上「重复」标记，你留一个勾掉另一个。

**场景 D：孩子/同事借你电脑**

你的插件配置里有些私人用途的入口（比如某些自动化脚本）。临时勾掉，交还电脑，回来再勾上。

**场景 E：你想知道某个按钮到底是谁加的**

面板每一行右侧写着它来自哪个 slot（`left` / `right` / `activity` / `dock` 等）。你看到 `activity` 下有个不认识的控件，就知道它不是输入框右侧的常驻按钮，而是活动区的东西——这一类信息对排查「界面上这个鬼东西是谁」非常有用。

### 1.4 它**不**做什么

明确划清边界，避免误会：

| 你可能以为 | 实际上 |
|---|---|
| 它会卸载插件 | ❌ 不。只是给它套一个 `display:none`。被隐藏的插件**仍在后台运行**，仍在消耗资源、仍在响应快捷键。 |
| 它会关掉插件功能 | ❌ 不。要真正停用，去 DSH 侧栏「插件」页关开关。 |
| 它能隐藏任意界面元素 | ❌ 不。它只处理 `conversation.input.*` 这一类 slot 下的**直接子元素**。侧栏、设置页、消息气泡都不在范围内。 |
| 它能改按钮顺序 | ❌ 不。顺序由各插件的 `order` 决定，本插件不重排。 |
| 它能同步到别的电脑 | ❌ 不。状态存在**这台机器 ＋ 这个浏览器**里。换机器要重新勾。 |
| 它需要联网 | ❌ 不。全部本地。 |

### 1.5 名词表（看不懂先查这里）

| 词 | 意思 |
|---|---|
| **composer** | DSH 底部那个输入区（含输入框和它周围的按钮）。本项目名里的 composer 就是它。 |
| **slot** | DSH 客户端预留给插件挂 UI 的「插槽」。名字形如 `conversation.input.right`。插件把自己的按钮塞进指定插槽。 |
| **锚点（anchor）** | 一个 slot 在 DOM 里对应的容器元素，带 `data-slot="…"` 属性，且样式为 `display:contents`（本身不占位，子元素直接参与布局）。 |
| **控件（control）** | 本文指锚点的**直接子元素**——也就是各个插件挂上去的按钮本体。 |
| **半身** | DSH 插件分两半：**host 半身**跑在 Node 进程里（能读文件、能注册路由和工具）；**client 半身**跑在浏览器里（能操作 DOM、能渲染 UI）。本项目两半都有。 |
| **bundle** | DSH 里能被装配的插件包形态。包里通过 `dsh.bundle.patch` 声明「怎么挂进宿主」。 |
| **profile** | DSH 的配置档案（本机默认是 `desktop` 或 `web`）。插件装在 `<DSH配置目录>/profiles/<profile>/` 下。 |
| **inject 声明** | 插件 `export const inject = [...]`，声明「我需要哪些宿主服务」。声明漏了，注册时会崩。 |

---

## 二、零基础安装

### 2.1 装之前先确认三件事

**① Node.js 版本**

本项目 `engines` 要求：

```
node ^22.19.0 || >=24.0.0
```

在终端里查：

```bat
node -v
```

低于 22.19 就先升级。**为什么要求这么高**：DSH 客户端运行时与 `cordis` 依赖都基于这个区间，低版本可能在加载 ESM 与 `import.meta` 时直接报错。

**② DSH 能正常启动**

装插件的前提是宿主本身能跑。先确认你能打开 DSH 的 Web GUI（本机默认 `http://127.0.0.1:9603`），能在里面正常聊天。

**③ 知道你的 profile 目录在哪**

插件要装进某个 profile。常见位置：

```
C:\Users\<你>\.dsh\profiles\desktop\      ← 桌面版
C:\Users\<你>\.dsh\profiles\web\          ← Web 版
```

不确定就两个都看一眼，哪个里面有你正在用的 `package.json`（里面有 `bundles` 字段）就是它。

> ⚠️ **装之前先备份** `package.json` 与 `pnpm-lock.yaml`。改坏了能一键还原。
> 备份命令（PowerShell，在 profile 目录里执行）：
> ```powershell
> Copy-Item package.json package.json.bak-before-butler
> Copy-Item pnpm-lock.yaml pnpm-lock.yaml.bak-before-butler
> ```

### 2.2 方式一：从 zip / 源码装进 profile（通用）

**第 1 步：拿到包**

两个来源，任选：

- **从 Release 下载**：打开 <https://github.com/duma520/dsh-composer-butler/releases>，下载 `dsh-composer-butler-v0.1.0.zip`，解压。
- **从源码 clone**：
  ```bat
  git clone https://github.com/duma520/dsh-composer-butler.git
  ```

解压/clone 后，你会看到一个目录，里面有 `package.json`、`lib\index.js`、`lib\client.js`、`cordis.patch.yml`。

**第 2 步：放进 profile 的 node_modules**

假设 profile 是 `desktop`：

```bat
mkdir "C:\Users\%USERNAME%\.dsh\profiles\desktop\node_modules\@lanbaolu"
xcopy /E /I /Y "解压出来的目录" "C:\Users\%USERNAME%\.dsh\profiles\desktop\node_modules\@lanbaolu\dsh-composer-butler"
```

> 包名是 `@lanbaolu/dsh-composer-butler`，所以目录必须是 `node_modules\@lanbaolu\dsh-composer-butler`。**层级少一层都加载不到**。

**第 3 步：在 profile 的 `package.json` 里登记两处**

打开 `C:\Users\%USERNAME%\.dsh\profiles\desktop\package.json`，找到两个地方：

```jsonc
{
  "dependencies": {
    // ……原有内容……
    "@lanbaolu/dsh-composer-butler": "0.1.0"     // ← 加上这一行
  },
  "bundles": [
    // ……原有内容……
    "@lanbaolu/dsh-composer-butler"               // ← 再加这一行
  ]
}
```

两处都必须加：

- `dependencies` 让包管理知道它存在（避免 `pnpm install` 把它清掉）；
- `bundles` 是**真正让它被装配**的清单。只加 `dependencies` 不会生效。

**第 4 步：重启 DSH**

完全退出 DSH（不是关窗口，是退出进程），再启动。

**第 5 步：刷新页面**

DSH 起来后，浏览器里按 `Ctrl+F5` 强制刷新一次。原因是**注入/装配只更新服务端的模块表，不会推送给已经打开的页面**。

刷新后，输入框右侧应该出现「⋯」。

### 2.3 方式二：本机有注入器插件时，一条命令

如果你的 DSH 装了超级注入器（`dsh-super-injector`，提供 `dev_*` 工具），可以用它的运行时注入通道，**免重启**：

```
dev_inject_plugin  <源码目录绝对路径>
```

例如（把路径换成你自己的）：

```
dev_inject_plugin  D:\my-plugins\dsh-composer-butler
```

它会做三件事：建 junction → `loader.create` → 立即生效。

**然后仍需刷新浏览器页面**（同上，服务端模块表更新不推给已打开页面）。

验证注入结果：

```
dev_plugin_status
```

看到 `dsh-composer-butler` 的 fiber 是 `active` 就对了。

卸载：

```
dev_uninject_plugin  dsh-composer-butler
```

> ⚠️ 已知缺陷：某些版本的注入器卸载时**不删 junction**（报 `Path is a directory`）。手工清理时必须用 `rmdir` 删链接本身，**绝不能递归删除**，否则会连带删掉你的源码目录。

### 2.4 方式三：开发调试（改完即生效）

你就是要改代码，那就别走上面两条：

1. 把源码目录 junction 到 profile 的 `node_modules\@lanbaolu\dsh-composer-butler`；
2. profile `package.json` 的 `bundles` 加上包名；
3. 改完 `lib\client.js` 或 `lib\index.js` 后：
   - 有注入器：`dev_reload_package dsh-composer-butler`
   - 没注入器：重启 DSH
4. 浏览器刷新页面看效果。

**改完一定要做的三件事**：

```bat
node --check lib\index.js
node --check lib\client.js
npx --yes dsh-plugin-standard@2 . --json
```

第三条是 DSH 插件规范校验，输出里 `failCount` 必须是 0。

### 2.5 三种验证方法

**验证 A：看界面**

输入框右侧出现「⋯」按钮 → client 半身起来了。
点开能列出控件 → host 半身（API）也通了。

**验证 B：问工具**

在会话里让 AI 调：

```
composer_butler_status
```

返回 JSON，里面有 `dataDir`（数据目录）、`scan`（最近一次扫描）、`state`（当前隐藏清单）。有这三样说明两半都正常。

**验证 C：看数据文件**

打开数据目录（默认就是包根目录），应该逐渐出现：

- `state.json` —— 你勾选后立即生成
- `scan.json` —— 页面加载 2 秒后生成

如果 `scan.json` 一直不出现，说明浏览器那半没跑起来（见第七部分）。

### 2.6 卸载（含数据清理）

**第 1 步：让它不再装配**

从 profile `package.json` 的 `bundles` 数组里删掉 `"@lanbaolu/dsh-composer-butler"`（`dependencies` 里那行一起删更干净）。

**第 2 步：删包**

```bat
rmdir /S /Q "C:\Users\%USERNAME%\.dsh\profiles\desktop\node_modules\@lanbaolu\dsh-composer-butler"
```

> 如果这个目录是 junction（链接），**不要**用 `rmdir /S`，改用 `rmdir` 只删链接本身。

**第 3 步：重启 DSH**

**第 4 步（可选）：清数据**

```bat
del 你原来的数据目录\state.json
del 你原来的数据目录\scan.json
del 你原来的数据目录\rules.json
```

浏览器里还有一份缓存，F12 → Application → Local Storage → 删掉键 `composer-butler.hidden.v1`。

### 2.7 装崩了怎么救

症状：DSH 起不来 / 起是起来了但一直报错。

**急救三步**：

1. **还原 profile 配置**
   ```powershell
   Copy-Item package.json.bak-before-butler package.json -Force
   Copy-Item pnpm-lock.yaml.bak-before-butler pnpm-lock.yaml -Force
   ```
2. **移除包目录**（见 2.6 第 2 步）
3. **重启 DSH**

如果还不行，说明问题不在本插件——去看 DSH 自己的日志。

---

## 三、界面完全图解

### 3.1 按钮长在哪

```
┌──────────────────────────────────────────────────────────────┐
│  [技能] [PUA] [Computer Use] …      [⋯]  [文件] [发送]        │
│   ↑                                                           │
│   conversation.input.left 下的控件      ↑                     │
│                                    conversation.input.right   │
│                                    本插件把「⋯」挂在这里        │
└──────────────────────────────────────────────────────────────┘
```

- 槽位：`conversation.input.right`
- 控件 id：`composer-butler`
- 排序值 `order: 900`（数值越大越靠右/越靠后）
- 外观：一个 `⋯` 字符按钮
- 提示文本（鼠标悬停）：`输入框按钮管家：自定义显示哪些控件`
- 无障碍名（读屏器）：`输入框按钮管家`

**再点一次「⋯」会关闭面板**——它是开关，不是「打开」。

### 3.2 面板逐行说明

点开后面板长这样：

```
┌────────────────────────────────────────────┐
│ 输入框按钮管家                    [×]      │  ← 标题行
├────────────────────────────────────────────┤
│ ☑ ⚡ 技能                             left  │  ← 每行：勾选框 + 名称 + 槽位
│ ☐ PUA                                left  │
│ ☑ Computer Use                       left  │
│ ☑ 选择一个技能                        left  │
│ ☐ 文件                               right │
│ ☐ 发送                               right │
│ ☐ 4 条排队消息                        dock  │
├────────────────────────────────────────────┤
│ [重新扫描]  [全部恢复]  [关闭]              │
│ 只隐藏界面，不卸载插件——被隐藏的插件仍在    │
│ 后台运行。要彻底停用请用侧栏「插件」页的开关。│
└────────────────────────────────────────────┘
```

**勾选框的含义**：勾上 = **显示**（可见）；勾掉 = **隐藏**。

> 注意方向：勾选表示「保留它在界面上」。这和「勾选=启用」是一致的直觉，但和某些「勾选=隐藏」的工具相反，用的时候留意一眼。

**每行右侧的灰字**是槽位名去掉前缀 `conversation.input.` 之后的部分：

| 右侧显示 | 实际槽位 | 位置 |
|---|---|---|
| `left` | `conversation.input.left` | 输入框左侧 |
| `right` | `conversation.input.right` | 输入框右侧 |
| `activity` | `conversation.input.activity` | 活动/状态区 |
| `dock` | `conversation.input.dock` | 停靠条（如排队消息） |
| `overlay` | `conversation.input.overlay` | 浮层 |

**空面板**显示：

> 未在输入框工具栏发现控件。请先打开一个会话。

原因见排错第 2 条。

### 3.3 面板底部的四个动作

| 按钮 | 作用 | 什么时候用 |
|---|---|---|
| **重新扫描** | 立刻重扫 DOM，刷新列表并上报 `scan.json` | 你刚装了新插件，或某个控件没出现在列表里 |
| **全部恢复** | 清空隐藏清单，所有控件全部显示 | 搞乱了想一键回到出厂状态 |
| **关闭** | 关面板，**不改状态** | 只是不想看了 |
| 点面板外部 / `Esc` | 同「关闭」 | 快速关闭 |

### 3.4 勾掉之后发生什么

发生在 0.1 秒内，三步：

1. **写 localStorage**（键 `composer-butler.hidden.v1`）—— 本浏览器立即记住；
2. **上报服务端**（`POST /state`）—— 落盘成 `state.json`，换浏览器也能补回；
3. **改 DOM** —— 给对应控件加属性 `data-composer-butler-hidden`，再用一段注入的 CSS 把它 `display:none !important`。

**关键点**：它没有删 DOM、没有停插件、没有动 React 树。所以：

- 被隐藏的控件**还在运行**（快捷键、后台任务、定时器都照常）；
- 撤销是**零代价**的（去掉一个属性而已）；
- 不会触发插件重渲染导致的副作用。

### 3.5 「重复」徽章是什么

当同一个槽位里出现**两个及以上名称相同**的控件，面板会给它们加一个 `重复` 徽章，鼠标悬停提示：

> 同一工具栏里出现了多个同名控件（多半来自两个功能相近的插件）

**这不是错误**，是提示。你该做的是：留一个、勾掉另一个，否则两个按钮占两份地方、可能触发两次相同动作。

---

## 四、五个手把手场景

### 场景 1：把用不上的按钮全收起来

1. 点输入框右侧 `⋯`。
2. 面板列出所有控件，逐个看右侧槽位名。
3. 对不想要的，**点掉勾选**——它立刻从输入框消失。
4. 关面板。
5. 刷新浏览器，确认还是隐藏的。

**结果**：`state.json` 里多了一条 `hidden` 记录，下次打开自动应用。

### 场景 2：某个按钮突然不见了，怎么找回来

1. 点 `⋯`（如果连 `⋯` 都不见了，说明整个插件没加载，看第七部分）。
2. 面板里找到那一行——它现在是**未勾选**状态。
3. 勾上，立刻回来。
4. 如果不确定是哪一个，点「全部恢复」，全部出现后再逐个收。

### 场景 3：换浏览器 / 换电脑，隐藏清单还在吗

- **同机换浏览器**：会。打开新浏览器首次加载时，client 发现本地 `localStorage` 为空，会向服务端 `GET /state` 拉一次清单，自动套用。
- **换电脑**：不会。`state.json` 在旧机器上。想带走就把这个文件复制到新机器的数据目录（路径见 5.5）。

### 场景 4：两个插件功能重复，留哪个

1. 面板里找带 `重复` 徽章的行。
2. 两行的名称相同、槽位相同，区别可能在图标（`aria-label` / `title` 不同则不会判重）。
3. 决定留哪个（通常留你更常点的），勾掉另一个。
4. 如果两个都想留，那就都留——徽章只是提醒，不阻止你。

### 场景 5：只想临时藏一下，不想它记住

当前版本**没有「临时隐藏」模式**——所有勾选都会立即持久化。

变通做法：临时勾掉 → 用完点「全部恢复」。多两步，但效果一样。

> 如果你确实需要「临时模式」，可以在 Issue 里提，这是合理的功能请求。

---

## 五、配置文件与 HTTP API

### 5.1 三个数据文件

全部在**数据目录**（默认 = 包根目录，可用 `dataDir` 配置改）：

| 文件 | 谁写 | 内容 | 能删吗 |
|---|---|---|---|
| `state.json` | client → `POST /state` | 你的隐藏清单 | 能删（等于全部恢复） |
| `scan.json` | client → `POST /scan` | 界面侦察快照（诊断用） | 能删（会自动重建） |
| `rules.json` | 外部 POST `/rules` | 预留的特征表 | 能删（当前 client 不读它） |

> ⚠️ **这三个文件都不会上传到 GitHub**。它们在 `.gitignore` 里，属于「使用者本机状态」。

### 5.2 `state.json` 逐字段

```json
{
  "hidden": [
    "conversation.input.left::text::⚡ 技能",
    "conversation.input.right::svg::M1121h-1l1-7H7.5c-.580-."
  ],
  "updatedAt": "2026-11-10T10:36:56.798Z"
}
```

| 字段 | 类型 | 说明 | 写错会怎样 |
|---|---|---|---|
| `hidden` | 字符串数组 | 要隐藏的控件身份 key | 不是数组 → client 解析失败，按空清单处理（等于全部显示） |
| `updatedAt` | ISO 8601 字符串 | 最后更新时间 | 只用于展示/排查，写错不崩 |

**key 的构成**：

```
<槽位名>::<指纹类型>::<指纹值>
```

例：`conversation.input.left::text::⚡ 技能`

| 指纹类型 | 什么时候用 | 例子 |
|---|---|---|
| `aria` | 控件有 `aria-label` | `…::aria::输入框按钮管家` |
| `title` | 有 `title` 属性 | `…::title::只控制当前会话` |
| `text` | 有可见文本 | `…::text::⚡ 技能` |
| `svg` | 只有图标 | `…::svg::M79A9.59.5001144.5` |
| `index` | 以上都没有 | `…::index::0` |

**为什么用这种 key**：官方渲染层不提供稳定 id，只能用「可观测特征」拼一个。`aria` 最稳、`index` 最脆（顺序一变就失效）。

### 5.3 `scan.json` 逐字段

```json
{
  "capturedAt": "2026-11-10T10:38:59.816Z",
  "hidden": ["…当前的隐藏清单…"],
  "slots": [
    {
      "slot": "conversation.input.dock",
      "children": [
        {
          "key": "conversation.input.dock::text::4 条排队消息",
          "tag": "div",
          "className": "F07MqG_dock",
          "ariaLabel": "",
          "title": "",
          "text": "4 条排队消息",
          "hidden": false
        }
      ]
    }
  ]
}
```

| 字段 | 说明 |
|---|---|
| `capturedAt` | 采集时刻 |
| `hidden` | 采集时的隐藏清单（快照，不参与判断） |
| `slots[].slot` | 槽位名 |
| `slots[].children[]` | 该槽位下每个控件的信息 |
| `children[].key` | 身份 key（与 `state.json` 里对应） |
| `children[].tag` | 标签名（`button` / `div` / `span`…） |
| `children[].className` | 类名（截 60 字节，可能是 CSS Module 哈希） |
| `children[].ariaLabel` / `title` / `text` | 三个候选名称来源（`text` 截 30 字） |
| `children[].hidden` | 采集时是否处于隐藏状态 |

**采集时机**：页面加载后 2 秒一次 + 每次打开面板一次。

**这个文件是干什么的**：它就是你「界面上到底有什么」的体检报告。排查「这个按钮是谁加的」「为什么某控件没被列出来」时，先看它。

### 5.4 `rules.json`

预留接口，`POST /rules` 可写，当前 client **不读取**它。设计意图是将来支持「按规则批量隐藏」（例如「所有 `aria-label` 含『实验』的控件默认隐藏」）。

**现在不用管它**，留着就行。

### 5.5 数据目录怎么定

**默认**：包根目录（`lib` 的上一级），也就是 `state.json` 和 `package.json` 并排。

**自定义**：在 `cordis.patch.yml` 里给 `config` 加 `dataDir`：

```yaml
- insert:
    - id: composer-butler
      name: '@lanbaolu/dsh-composer-butler'
      config:
        dataDir: 'D:\dsh-data\composer-butler'
```

`dataDir` 是**绝对路径**。相对路径会被 `path.resolve` 按进程工作目录解析——**不要用相对路径**，你会找不到文件在哪。

**为什么不放 `lib/`**：代码和数据混放，`git clone` 后容易把运行期状态一起提交（本项目 v0.1.0 开发期就踩过，已改到包根）。

### 5.6 HTTP API 全表

前缀：`/@lanbaolu/dsh-composer-butler/api`

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|---|---|---|---|---|
| `GET` | `/info` | — | `{dataDir, apiBase}` | 查数据目录与 API 前缀 |
| `GET` | `/state` | — | `{hidden:[…], updatedAt}`；文件不存在返 `{hidden:[]}` | 读隐藏清单 |
| `POST` | `/state` | `{hidden:[…], updatedAt}` | `{ok:true}` | 写隐藏清单（落 `state.json`） |
| `GET` | `/scan` | — | `{capturedAt, hidden, slots}`；文件不存在 **404** + `scan.json 尚不存在` | 读扫描快照 |
| `POST` | `/scan` | 同上 | `{ok:true}` | 上报扫描快照 |
| `GET` | `/rules` | — | 原样返回 `rules.json` | 读规则表 |
| `POST` | `/rules` | 任意 JSON | `{ok:true}` | 写规则表 |
| 其他 | — | — | **404** + `未知路由` | 兜底 |

**手工调用示例**（PowerShell）：

```powershell
# 看数据目录
Invoke-RestMethod http://127.0.0.1:9603/@lanbaolu/dsh-composer-butler/api/info

# 看当前隐藏清单
Invoke-RestMethod http://127.0.0.1:9603/@lanbaolu/dsh-composer-butler/api/state

# 一键全部恢复（等价于点面板上的「全部恢复」）
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:9603/@lanbaolu/dsh-composer-butler/api/state `
  -ContentType 'application/json' `
  -Body '{"hidden":[],"updatedAt":"2026-11-10T00:00:00Z"}'
```

> 端口按你自己的 GUI 地址改（本机默认 9603）。

### 5.7 浏览器 localStorage 键

| 键 | 内容 | 清了会怎样 |
|---|---|---|
| `composer-butler.hidden.v1` | 隐藏清单 JSON | 下次加载会从服务端 `GET /state` 补回（若服务端有）；服务端也没有就全显示 |

**为什么同时存两边**：localStorage 保证「刷新立即生效、不用等网络」；服务端保证「换浏览器能补回」。这是规则「设置实时自动保存并持久化」的落地方式。

### 5.8 手工编辑 state.json 的正确姿势

可以手改，但要注意：

1. **先关浏览器页面**（否则你改完，页面一上报就覆盖回去）。
2. 保持 JSON 合法（用 VSCode 之类带校验的编辑器）。
3. `hidden` 里的字符串必须与 `scan.json` 里的 `key` **逐字符相同**——多一个空格就失效。
4. 改完刷新页面。

最稳的做法其实是**别手改**：点面板。手改只在你需要批量清理时才有价值（比如把整个 `hidden` 清空）。

---

## 六、工作原理（想改代码的人看）

### 6.1 为什么必须这么做

DSH 官方渲染层**没有提供「逐 entry 可见性」的属性或 API**——插件只能声明「我挂在哪个 slot」，不能声明「我默认隐藏」。插件市场也没有显隐管理能力。

所以唯一可行的路径是：**在 DOM 层动手**。

代价是：这条路依赖官方 DOM 结构的稳定性。官方哪天改了 Slots 的实现（比如给每个 child 多包一层 div），本插件就会失效。这是这套方案的根本性限制，写在这里让你心里有数。

### 6.2 DOM 锚点机制

官方 `SlotOutlet` 渲染出来是这样：

```html
<div data-slot="conversation.input.right" style="display:contents">
  <!-- 各插件挂上来的根节点，直接是这里的子元素 -->
  <button aria-label="文件">…</button>
  <button aria-label="发送">…</button>
  <button data-composer-butler-self="1" aria-label="输入框按钮管家">⋯</button>
</div>
```

三个关键事实：

1. **锚点带 `data-slot`**，所以能精确选到：`[data-slot^="conversation.input."]`。
2. **锚点 `display:contents`**——它自己盒子不参与布局，子元素直接按父级布局规则排。所以「隐藏子元素」在视觉上就等于「这个按钮没出现过」。
3. **错误边界不额外包 DOM**——官方在插件崩了时用错误边界兜底，但没有加包裹 div。所以「锚点的直接子元素」就是「插件的根节点」。

于是隐藏一个控件 = 给这个直接子元素加一个属性 + 一段全局 CSS。

```css
[data-composer-butler-hidden]{ display:none !important; }
```

用 `!important` 是因为个别插件的根节点带内联 `display`，不加会被压不住。

### 6.3 控件身份指纹算法

难点不在「隐藏」，在**「怎么认出同一个控件」**。

官方没给 id。只能拿可观测特征拼：

```js
identityOf(el, slot, fallbackIndex)
```

优先级（前面的拿到就用）：

1. `aria-label`（最稳，语义化，通常不随状态变）
2. `title`（次稳）
3. 可见文本（会被状态文案污染，所以要归一，见下）
4. `svg` 的 `path d`（图标指纹，去空白后截 24 字符）
5. `index`（兜底，最脆——顺序一变就认错）

拼出来的 key 形如：

```
conversation.input.left::text::⚡ 技能
```

**为什么需要 `stableName()` 归一**：

PUA 那个按钮的 `aria-label` 是动态的：

- 会话开着时：`PUA（当前会话已开启）`
- 会话关了时：`PUA（当前会话已关闭）`

如果把整串当 key，你切一个会话，key 就变了，隐藏立刻失效。

解法是取分隔符**之前**的前缀：

```js
text.split(/[，,、（(：:—–]/)[0].trim().slice(0, 24)
```

于是两种状态都归一成 `PUA`。

**分隔符集合为什么刻意不含 ASCII 连字符 `-`**：

这是个踩过的坑。如果 `-` 也算分隔符，`hold-to-dictate`（按住说话）会被截成 `hold`，而这个 `hold` 前缀可能与另一个控件（比如某个叫 `hold to edit` 的）撞车，造成**误隐藏**——你隐藏 A，B 也没了。

所以分隔符最终定为：`[，,、（(：:—–]`（中文逗号/英文逗号、顿号、中文括号/英文左括号、中文冒号/英文冒号、破折号、连接号），**7 类，不含 `-`**。

> 这一条有 7 条真实文案的单测守着，改之前先看测试。

### 6.4 防自锁

最尴尬的 bug 会是：**你把这个插件自己的按钮隐藏了，然后面板再也打不开**——只能手改 state.json 才能救。

所以：

1. 「⋯」按钮带标记 `data-composer-butler-self="1"`；
2. `scanControls()` 里对每个候选做 `child.closest('[data-composer-butler-self]') !== null` 判断，命中就跳过。

于是它**永远不会出现在自己的清单里**，也就永远隐藏不了自己。

> 如果你在面板里看到「输入框按钮管家」这一行，说明这道防线被绕过了（极少见），去 Issue 报。

### 6.5 自愈：MutationObserver

DOM 不是静止的。切会话、插件热装配、组件重渲染，都可能把锚点重建，**重建之后你加的属性就没了**。

对策：

```js
new MutationObserver(callback).observe(document.body, {
  childList: true,
  subtree: true
})
```

- **60ms 节流**：DOM 变化很密集，不节流会把主线程拖死。节流的意思是「60ms 内的多次变化合并成一次处理」。
- **只监听 `childList` + `subtree`**：节点增删才处理，不管属性变化（避免自己改属性又触发自己，形成循环）。
- 卸载时 `disconnect()`，不留观察者。

这就是「切会话回来，隐藏还在」的原因。

### 6.6 状态单例为何重要

代码里有一份**全局唯一**的 `hiddenSet`：

```js
const hiddenSet = new Set()
function getHidden() { return hiddenSet }
```

**为什么不能各持一份**：

v0.1.0 开发期踩过——`apply()` 的闭包持有 `Set A`，面板组件持有 `Set B`。你在面板里勾选改了 `B`，`apply` 用的还是 `A`，于是「面板显示已隐藏、界面没有任何变化」。更要命的是 `MutationObserver` 每次回调都持旧引用，改 `B` 永远不生效。

改成单例后，所有路径读写同一份数据，问题消失。

> 这是个典型的「看起来能跑、实则状态不同步」的 bug，改这块代码时别退回多实例写法。

### 6.7 host / client 两个半身

| | host 半身 | client 半身 |
|---|---|---|
| 文件 | `lib/index.js` | `lib/client.js` |
| 运行在 | Node 进程（服务端） | 浏览器 |
| 能做什么 | 注册 HTTP 路由、读写文件、注册工具 | 操作 DOM、渲染 UI、读写 localStorage |
| 导出 `name` | `'@lanbaolu/dsh-composer-butler'` | — |
| 声明 `inject` | `['webServer', 'tools']` | `['slots']` |
| 注册的 effect | `'composer-butler: api'`、`'composer-butler: status tool'` | 一个 slot 注册 |

**`inject` 声明漏了会怎样**：

v0.1.0 开发期踩过——`inject` 只写了 `['webServer']`，没写 `'tools'`，于是注册工具时宿主没注入 `tools` 服务，直接崩，整个插件 entry 变成 `[no-fiber]`（等于没加载）。

**能注册工具却不声明 `tools`，是宿主设计的严格性，不是 bug**。改代码时两个都要声明。

### 6.8 为什么零构建

`lib/client.js` 是**手写的** bundle：

```js
window.__ModuleLoader__.load({ id: '@lanbaolu/dsh-composer-butler/client', factory: (require) => { … } })
```

它只 `require('react')`，而 `react` 由 shell 提供（`dsh.client.inject` 里声明了 `@deepseek-ai/dsh-client-runtime` 与 `@deepseek-ai/dsh-client-ui-slots`）。

**好处**：

- 没有 `npm install` 依赖树、没有 webpack/vite/tsc，`git clone` 就能跑；
- 改一行刷新页面就见效，调试路径最短；
- 包体积极小（client 21KB）。

**代价**：

- 不能用 JSX，只能 `h()` 函数式写法；
- 不能用 TS；
- 依赖手工维护，改错一个字符就可能整页白；

**所以 `node --check` 是必须的**（见 2.4）。

### 6.9 一次完整生命周期

```
┌─ DSH 启动 ─────────────────────────────────────────┐
│ 1. bundles 里发现 @lanbaolu/dsh-composer-butler    │
│ 2. 读 cordis.patch.yml → insert entry              │
│ 3. 加载 lib/index.js（host 半身）                   │
│    ├─ 建 /@lanbaolu/dsh-composer-butler/api 路由    │
│    └─ 注册工具 composer_butler_status               │
└────────────────────────────────────────────────────┘
                     ↓
┌─ 浏览器打开 GUI ───────────────────────────────────┐
│ 4. 加载 lib/client.js（client 半身）                │
│ 5. apply(ctx)：                                     │
│    ├─ ensureStyle()        注入 CSS                 │
│    ├─ applyHidden()        套用本地隐藏清单           │
│    ├─ 若本地为空 → GET /state 补一次                 │
│    ├─ MutationObserver    开始盯着 DOM               │
│    └─ slots.inject('conversation.input.right', …)   │
│         → 挂上「⋯」按钮                              │
│ 6. 2 秒后 → 首次 reportScan() → POST /scan          │
└────────────────────────────────────────────────────┘
                     ↓
┌─ 你点「⋯」 ────────────────────────────────────────┐
│ 7. 扫 DOM → 渲染行                                  │
│ 8. 每次打开都再 reportScan() 一次                    │
│ 9. 勾选 → commit()：                                │
│    writeLocal → POST /state → applyHidden → 重渲染   │
└────────────────────────────────────────────────────┘
                     ↓
┌─ 你切会话 / 重渲染 ────────────────────────────────┐
│ 10. MutationObserver 触发（60ms 节流）→ applyHidden  │
└────────────────────────────────────────────────────┘
```

---

## 七、排错手册

按「现象 → 原因 → 处置」写。12 条，覆盖绝大多数情况。

### 1. 输入框右侧根本没有「⋯」

**原因**（按概率排序）：

- client 半身没加载（最常见：注入后没刷新页面）
- `bundles` 里没加包名（只加了 `dependencies`）
- 包目录层级不对（不是 `node_modules\@lanbaolu\dsh-composer-butler`）
- slot 名不匹配（你的 DSH 版本里 `conversation.input.right` 不存在）

**处置**：

1. `Ctrl+F5` 强刷页面。
2. 查 profile `package.json` 的 `bundles` 是否含包名。
3. F12 → Console 看有没有报错（`__ModuleLoader__` 相关）。
4. 重启 DSH。

### 2. 有「⋯」，但面板是空的

**面板原文**：`未在输入框工具栏发现控件。请先打开一个会话。`

**原因**：

- 你还没打开任何会话（输入框没渲染，锚点不存在）
- 或者当前页面的 DOM 结构里没有 `data-slot^="conversation.input."`

**处置**：先打开/新建一个会话，再点「⋯」。若仍为空，点「重新扫描」，然后看 `scan.json` 里 `slots` 是否为空数组。

### 3. 勾掉了，但按钮还在

**原因**：

- 控件的 key 在你点完之后变了（DOM 重建 + 以 `index` 为指纹）
- 另一个插件每次渲染都重建根节点，把属性冲掉了（观察者应该在 60ms 内补，但极端情况会闪）
- 你勾的是另一个同名控件

**处置**：

1. 点「重新扫描」，看该控件现在的 key 是否还和 `state.json` 里一致。
2. 若不一致，说明指纹不稳定（`index` 类），改为隐藏旁边更稳定的那个，或接受它。
3. 看 `aria-label` 是否含动态状态文案——这类应当被 `stableName()` 归一，若没归一是 bug。

### 4. 隐藏了，刷新后又出现

**原因**：

- `POST /state` 失败（服务端没落盘），且 localStorage 被清
- 手工编辑过 `state.json` 且格式非法

**处置**：

1. 调 `GET /state` 看服务端有没有记录。
2. 没有 → 看 host 半身是否正常（`composer_butler_status` 能不能返回）。
3. 有记录但页面没应用 → 强刷，看 Console。

### 5. 隐藏清单里出现 `::index::0` 这种

**说明**：这个控件的三个名称来源（`aria-label` / `title` / 文本 / svg）全都没有，只能退化成「按位置」。**它的隐藏最不稳定**——别的控件一增删，位置就变。

**处置**：能接受就接受；想让作者改进，去 Issue 里贴 `scan.json` 对应片段。

### 6. 面板里看到「输入框按钮管家」自己

**这是防自锁失效**，属 bug。理论上不可能（`closest('[data-composer-butler-self]')` 拦着）。

**处置**：别勾它（勾了面板就再也打不开）。若已勾，手工把 `state.json` 里 `hidden` 清空，刷新。

### 7. 两个按钮并排，都带「重复」

见 3.5。**处置**：勾掉一个。

### 8. 切换会话后，隐藏失效了一两秒

**原因**：MutationObserver 60ms 节流 + 浏览器重渲染，会有极短窗口。这是设计取舍（不节流会卡）。

**处置**：不用管，会自愈。若持续不恢复，见第 3 条。

### 9. `GET /scan` 返回 404 `scan.json 尚不存在`

**这不算错误**。含义是「页面还没上报过」。打开页面等 2 秒，或点一次「⋯」就会生成。

### 10. 调 API 报 404 `未知路由`

**原因**：路径拼错。前缀必须完整：

```
/@lanbaolu/dsh-composer-butler/api/info
```

注意开头的 `/@`、中间的 `@lanbaolu/`，以及结尾的 `/api`。

### 11. DSH 启动报错，插件 entry 变 `[no-fiber]`

**原因**：通常是 `inject` 声明缺项（例如缺 `tools`），或者包加载阶段就抛异常。

**处置**：

1. `node --check lib/index.js` 查语法。
2. 看 `export const inject` 是否含 `['webServer', 'tools']`。
3. 从 `bundles` 移除，先保证 DSH 能起来，再逐步排查。

### 12. 装完感觉界面变卡

**原因**：MutationObserver 每 60ms 最多跑一次，全量扫 `conversation.input.*` 下的直接子元素。控件数一般 < 50，正常无感。若你装了某个**每秒重建上百个节点**的插件，会叠加。

**处置**：F12 → Performance 录 5 秒，看 `applyHidden` 占比。是它就去 Issue 报，可以加缓存优化。

---

## 八、FAQ（15 问）

**Q1：这是官方插件吗？**
不是。这是第三方插件，基于 DSH 公开的 slot / bundle 机制实现，不改宿主源码。宿主升级可能让它失效，请留意版本发布说明。

**Q2：隐藏按钮会不会让插件不工作？**
不会。只加了一个 CSS 属性和一个 DOM 属性，插件本身完全不知道。它的快捷键、后台任务、定时器全部照常。

**Q3：那我想真正停用某个插件怎么办？**
用 DSH 侧栏的「插件」页开关。本插件面板底部也写了这句提示——就是为了防止混淆这两个概念。

**Q4：会影响别人吗？**
不会。状态存在你的机器上（`state.json`）和你的浏览器里（localStorage）。多用户共用一台机器时，各自浏览器各存一份 localStorage，但**服务端 `state.json` 是共享的**——后打开的人会补到前一个人的清单。这是个已知取舍，记在这里。

**Q5：支持哪些 DSH 版本？**
依赖 `@deepseek-ai/dsh-client-ui-slots` 提供的 `ctx.slots` 与 `conversation.input.*` 槽位。作者验证于 DSH 0.2.x。更早的版本可能没有这些槽位。

**Q6：能隐藏侧栏按钮吗？**
不能。只处理 `conversation.input.*`。侧栏、设置页、消息区都不在范围。

**Q7：能改按钮顺序吗？**
不能。顺序由插件的 `order` 决定。本插件自己用 `order: 900` 排在右侧偏后。

**Q8：能导出/导入配置吗？**
能，手动：复制 `state.json` 即可（内容就是纯 JSON 数组）。没有做 UI 导入按钮。

**Q9：为什么按钮用「⋯」而不是图标？**
零构建、不引入图标库，且「⋯」在中文界面里表意清楚（更多操作）。想换可以在 `ButlerButton` 里改字符。

**Q10：面板能拖动吗？**
不能。固定在按钮下方（空间不足时上翻）。点击外部或 `Esc` 关闭。

**Q11：能批量操作吗？**
「全部恢复」是唯一的批量操作。单个勾选是逐行的——设计上故意不做「全选/全不选」，因为「全不选」会让输入框变成空的，容易吓到人。

**Q12：`rules.json` 有什么用？**
预留。将来做「按规则自动隐藏」用。现在写它没有可见效果。

**Q13：会不会和别的显隐插件冲突？**
可能。若两个插件都往同一个控件上加属性，行为叠加。实际中作者没遇到过，因为这类插件极少。

**Q14：源码能改吗？许可允许吗？**
BSD-3-Clause，可以改、可以分发，保留版权声明即可。改完建议跑 `dsh-plugin-standard` 校验。

**Q15：我发现 bug / 想加功能，怎么办？**
到 <https://github.com/duma520/dsh-composer-butler/issues> 提。附上：DSH 版本、`scan.json` 对应片段、浏览器 Console 报错（如有）。**不要贴任何密钥、Cookie 或含个人信息的截图**。

---

## 九、已知限制与安全说明

### 9.1 硬限制（不是 bug，是方案决定的）

| 限制 | 原因 | 有没有可能解决 |
|---|---|---|
| 只隐藏界面，不卸载 | 官方无卸载 API | 不解决（这是定位） |
| 只处理 `conversation.input.*` | 其他区域的 slot 结构未逐一验证 | 可扩展，需实测 |
| 依赖官方 DOM 结构 | 没有官方可见性 API | 官方改结构就得跟着改 |
| 身份指纹可能漂移 | 无稳定 id | 官方给 id 才能根治 |
| 状态不跨机器同步 | 无云端 | 不解决（隐私优先） |
| 服务端 `state.json` 是机器级共享 | 无用户隔离 | 多用户场景需自行隔离数据目录 |

### 9.2 安全说明

- **不联网**。插件只跟本机 DSH 的 webServer 通信（同源）。
- **不收集任何数据**。`scan.json` 只写本机磁盘，且已列入 `.gitignore`。
- **不读凭据**。代码里没有任何读 `cred.db`、`.env`、环境变量的逻辑。
- **仓库不含运行期数据**。`state.json` / `scan.json` / `rules.json` 全部被 git 忽略。
- **提交前扫描**：本项目遵循「任何敏感信息不得上传仓库」的红线，每次提交前扫关键词与高熵串。

### 9.3 一个隐私提醒

`scan.json` 里会记录你输入框工具栏上**可见控件的文本**（例如技能名、按钮文案）。它不包含你聊天内容，但如果你的按钮文案本身含敏感信息（不太可能），它会被记录。**这个文件不会上传**，但如果你要把它贴到 Issue 里求助，先删掉敏感行。

---

## 十、目录结构、测试与开发

### 10.1 目录结构

```
dsh-composer-butler/
├── package.json              # 包声明：exports / dsh.bundle / dsh.client / peerDeps
├── cordis.patch.yml          # bundle 挂载声明（一行 insert）
├── lib/
│   ├── index.js              # host 半身：HTTP 路由 + 状态工具
│   └── client.js             # client 半身：按钮 + 面板 + DOM 显隐
├── README.md                 # 本文
├── LICENSE                   # BSD-3-Clause
├── .gitignore                # 排除运行期数据与凭据
├── .gitattributes            # 统一 LF
├── 软件升级迭代记录.md         # 逐版变更记录
└── version/
    └── 20261101-v1/          # 首个版本的归档快照
```

**运行期会出现（不在仓库里）**：

```
├── state.json                # 你的隐藏清单
├── scan.json                 # 界面侦察快照
└── rules.json                # 预留规则表
```

### 10.2 自检命令

```bat
:: 语法
node --check lib\index.js
node --check lib\client.js

:: DSH 插件规范（failCount 必须为 0）
npx --yes dsh-plugin-standard@2 . --json
```

### 10.3 手工核对（浏览器控制台）

`lib/client.js` 末尾有 `exports.__test = { scanControls, identityOf, applyHidden }`，这是**构建期与人工核对用的内部导出，不是稳定 API**，随时可能改，不要写进其他插件。

实际核对建议：打开面板 → 点「重新扫描」→ 打开数据目录里的 `scan.json`，逐条对照：

1. `slots[].slot` 是否覆盖你界面上看到的区域？
2. `children[].text` / `ariaLabel` / `title` 是否与界面按钮对得上？
3. `hidden: true` 的条目是否确实在界面上看不见？

三者一致，说明扫描与显隐都正常。

### 10.4 改代码的注意事项（踩过的坑）

1. **`inject` 必须同时含 `webServer` 与 `tools`** —— 漏 `tools` 会让 entry 变 `[no-fiber]`。
2. **状态必须单例** —— 别在组件里另建 `Set`（见 6.6）。
3. **`stableName` 的分隔符不含 `-`** —— 否则 `hold-to-dictate` 被截断造成误隐藏。
4. **数据目录别放 `lib/`** —— 代码与数据分离。
5. **「⋯」必须带 `data-composer-butler-self`** —— 否则会被自己扫进列表，用户误关就锁死。
6. **`MutationObserver` 必须节流** —— 不加 60ms，DOM 密集变化会拖死主线程。
7. **client 里只用 `h()`，不用 JSX** —— 零构建，没编译器。
8. **改完刷新页面才生效** —— 服务端模块表更新不推送已开页面。

---

## 十一、版本更新简介

| 版本 | 日期 | 一句话 |
|---|---|---|
| **v0.1.0** | 2026-11-01 | 首个可用版本：`⋯` 按钮 + 显隐面板 + 持久化 + 自愈 + 防自锁 + 重复标记 |

逐版详细变更见 [`软件升级迭代记录.md`](软件升级迭代记录.md)。

---

## 十二、贡献与许可

### 12.1 贡献

欢迎 Issue 与 PR。提之前请：

1. 先跑 10.2 的两条自检命令；
2. PR 里说明「改了什么、为什么、怎么验证的」；
3. **不要**在 Issue/PR 里贴 `state.json` 全文（含你的个人使用习惯），贴片段即可；
4. **不要**贴任何密钥、Cookie、token。

### 12.2 许可

BSD-3-Clause，见 [LICENSE](LICENSE)。Copyright (c) 2026, duma520。

---

## 附录 A：与同类方案对比

| 方案 | 能否隐藏按钮 | 是否需要改宿主 | 状态持久 | 代价 |
|---|---|---|---|---|
| **本插件** | ✅ 逐项 | ❌ 不需要 | ✅ 双写 | 依赖 DOM 结构 |
| 卸载不要的插件 | ✅ 彻底 | ❌ | — | 功能一起没了，重装麻烦 |
| 改宿主源码加可见性 | ✅ 最彻底 | ✅ 要改 | 看实现 | 升级被覆盖，风险高 |
| 插件市场管理 | ❌ 无此能力 | — | — | — |

## 附录 B：一分钟速查卡

```
装：  zip 解压 → node_modules\@lanbaolu\dsh-composer-butler
      → profile package.json 的 dependencies + bundles 各加一行 → 重启 → Ctrl+F5
用：  点「⋯」→ 取消勾选 = 隐藏；勾上 = 显示
救：  「全部恢复」= 一键全显示；搞崩了删 state.json
查：  GET  /@lanbaolu/dsh-composer-butler/api/info
      GET  /@lanbaolu/dsh-composer-butler/api/state
      GET  /@lanbaolu/dsh-composer-butler/api/scan
卸：  bundles 删条目 → 删包目录 → 重启 → （可选）删 state/scan/rules
坑：  ① 注入后必须刷新页面 ② 只隐藏不卸载 ③ 别手改 JSON 里的 key
```

---

<div align="center">

**输入框按键管家** · 让工具栏只留你真正在用的东西

[⬆ 回到顶部](#输入框按键管家--dsh-composer-butler)

</div>
