/**
 * dsh-composer-butler — 浏览器半身。
 *
 * 手写 ModuleLoader bundle：零构建、只依赖 shell 已提供的 `react`。
 * 同一条路线在 dsh-our-free-model 上已跑通（本机无 tsc / 无 DSH checkout）。
 *
 * 设计要点（都已对照官方 renderer 源码核实）：
 *  - 官方 SlotOutlet 渲染 `<div data-slot={slotKey} style="display:contents">`，
 *    每个 entry 的 SlotErrorBoundary 不额外包 DOM，因此**锚点的直接子元素就是
 *    各插件自己的根节点** —— 这就是天然的分组边界，隐藏一个子元素 = 隐藏一个插件控件。
 *  - 官方没有 entry 级可见性属性，所以隐藏用 CSS：给目标元素打 data 属性 +
 *    注入一条 `[data-composer-butler-hidden]{display:none!important}`。
 *  - 不硬编码任何中文文案做匹配：控件身份由「运行时指纹」生成
 *    （slot 名 + aria-label/title/文本/svg path/索引），因此 DSH 改版后
 *    仍能自动发现新控件，不会因为写死的文案变了就失效。
 *  - 状态落 localStorage（即时）+ 上报 host 落 state.json（重启不丢）。
 *
 * @module client.js
 */

window.__ModuleLoader__.load({
  id: '@lanbaolu/dsh-composer-butler',
  factory: require => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const { createElement: h, useState, useEffect, useCallback, useRef } = React

    /** 浏览器半身读取的 API 前缀（与 host 半身一致）。 */
    const API_BASE = '/@lanbaolu/dsh-composer-butler/api'
    /** localStorage 键：即时持久化。 */
    const STORAGE_KEY = 'composer-butler.hidden.v1'
    /** 隐藏属性名。 */
    const HIDDEN_ATTR = 'data-composer-butler-hidden'
    /** 管家自身标记属性：自己扫描自己时排除，且拒绝被隐藏（防自锁）。 */
    const SELF_ATTR = 'data-composer-butler-self'
    /** 只看输入框相关 slot；把它们全列出来便于以后扩展。 */
    const SLOT_PREFIX = 'conversation.input.'
    /** 注入一次即可的样式表 id。 */
    const STYLE_ID = 'composer-butler-style'

    const inject = ['slots']

    // ── 样式 ────────────────────────────────────────────────────────────────
    /** 注入隐藏规则与面板外观。重复调用是幂等的。 */
    function ensureStyle() {
      if (document.getElementById(STYLE_ID) !== null) return
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = [
        `[${HIDDEN_ATTR}]{display:none!important}`,
        '.cb-panel{position:fixed;z-index:99999;min-width:320px;max-width:min(92vw,460px);',
        'max-height:min(70vh,520px);overflow:auto;background:var(--dsh-surface,#fff);',
        'color:var(--dsh-text,#1f1f1f);border:1px solid var(--dsh-border,#d9d9d9);',
        'border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.18);padding:10px;',
        'font-size:13px;line-height:1.5}',
        '.cb-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}',
        '.cb-title{font-weight:600}',
        '.cb-actions{display:flex;gap:6px;flex-wrap:wrap}',
        '.cb-btn{background:transparent;border:1px solid var(--dsh-border,#d9d9d9);border-radius:6px;',
        'cursor:pointer;padding:2px 8px;font-size:12px;color:inherit}',
        '.cb-btn:hover{background:var(--dsh-hover,rgba(0,0,0,.05))}',
        '.cb-row{display:flex;align-items:center;gap:8px;padding:4px 2px;border-radius:6px}',
        '.cb-row:hover{background:var(--dsh-hover,rgba(0,0,0,.05))}',
        '.cb-row label{display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;min-width:0}',
        '.cb-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.cb-slot{font-size:11px;opacity:.6;font-family:monospace}',
        '.cb-dup{font-size:11px;color:#c87b22;border:1px solid currentColor;border-radius:4px;padding:0 4px}',
        '.cb-empty{opacity:.65;padding:8px 2px}',
        '.cb-section{margin-top:8px;padding-top:8px;border-top:1px solid var(--dsh-border,#eee)}',
      ].join('')
      document.head.appendChild(style)
    }

    // ── 指纹与控制项目录 ──────────────────────────────────────────────────────
    /** 取元素最显著的文本标识（截断，去空白）。 */
    function primaryText(el) {
      return (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 18)
    }

    /** 取 svg 图标的路径前缀，用于图标型按钮的身份。 */
    function svgSignature(el) {
      const p = el.querySelector('svg path')
      const d = p?.getAttribute('d') ?? ''
      return d.replace(/\s+/g, '').slice(0, 24)
    }

    /**
     * 把会随状态漂移的文案压成稳定名。
     * 实测教训：PUA 按钮的 aria-label 是「PUA（当前会话已关闭）」↔「PUA（当前会话已开启）」，
     * 状态一切换整串就变 → 身份必须取括号/冒号/破折号前的前缀。
     */
    function stableName(text) {
      // 刻意不切 ASCII 连字符：否则 "hold-to-dictate" 会被压成 "hold" 造成误碰撞。
      return text.split(/[，,、（(：:—–]/)[0].trim().slice(0, 24)
    }

    /**
     * 为一个控件生成稳定身份。
     * 优先级：aria-label → title → 文本 → svg 路径 → 同 slot 内序号兜底。
     * 这样身份跟随「控件语义」，而不是脆弱的 DOM 位置。
     */
    function identityOf(el, slot, fallbackIndex) {
      const aria = (el.getAttribute('aria-label') ?? '').trim()
      if (aria !== '') return `${slot}::aria::${stableName(aria)}`
      const title = (el.getAttribute('title') ?? '').trim()
      if (title !== '') return `${slot}::title::${stableName(title)}`
      const text = primaryText(el)
      if (text !== '') return `${slot}::text::${text}`
      const svg = svgSignature(el)
      if (svg !== '') return `${slot}::svg::${svg}`
      return `${slot}::index::${fallbackIndex}`
    }

    /** 人类可读的控件名（面板展示用）。 */
    function labelOf(el, index) {
      const aria = (el.getAttribute('aria-label') ?? '').trim()
      if (aria !== '') return aria
      const title = (el.getAttribute('title') ?? '').trim()
      if (title !== '') return title
      const text = primaryText(el)
      if (text !== '') return text
      return `未命名控件 #${index + 1}`
    }

    /**
     * 扫描所有输入框 slot，返回控件清单。
     * 隐藏单位 = slot 锚点的直接子元素（= 一个插件贡献的一个控件）。
     */
    function scanControls() {
      const found = []
      const anchors = Array.from(document.querySelectorAll(`[data-slot^="${SLOT_PREFIX}"]`))
      for (const anchor of anchors) {
        const slot = anchor.getAttribute('data-slot') ?? ''
        let index = 0
        for (const child of Array.from(anchor.children)) {
          // 管家自己的按钮不参与扫描：用户误关它就再也打不开面板了。
          if (child.closest(`[${SELF_ATTR}]`) !== null) {
            continue
          }
          const key = identityOf(child, slot, index)
          found.push({ key, slot, label: labelOf(child, index), element: child })
          index += 1
        }
      }
      return found
    }

    // ── 状态持久化 ───────────────────────────────────────────────────────────
    /**
     * 隐藏清单的模块级单例。
     * 实测教训（2026-11-01）：此前 apply 闭包与面板各自持有不同 Set，
     * 面板勾选只更新自己那份，observer 仍拿旧份 → 新建会话 DOM 重建时
     * 用旧状态重套用，刚隐藏的按钮又冒出来（用户报"没同步，要再点一次"）。
     * 所有读写必须经过 getHidden()，保证全局唯一一份。
     */
    let hiddenSet = null
    function getHidden() {
      if (hiddenSet === null) hiddenSet = new Set(readLocal())
      return hiddenSet
    }

    function readLocal() {
      try {
        const raw = window.localStorage?.getItem(STORAGE_KEY) ?? ''
        if (raw === '') return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
      } catch {
        return []
      }
    }

    function writeLocal(hidden) {
      try {
        window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(hidden))
      } catch {
        /* 隐私模式/配额满：不阻断功能 */
      }
    }

    /** 上报 host 落 state.json（失败不影响本地功能）。 */
    function pushHost(hidden) {
      void fetch(`${API_BASE}/state`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hidden, updatedAt: new Date().toISOString() }),
      }).catch(() => {})
    }

    /**
     * 采集当前工具栏快照并上报 host 落 scan.json。
     * 这是排查「控件身份漂移」的唯一眼睛：不靠猜 DOM，直接看真实结构。
     * 上报时机：页面加载后一次 + 每次打开面板一次（面板打开正是需要事实的时候）。
     */
    function reportScan() {
      try {
        const slots = []
        const anchors = Array.from(document.querySelectorAll(`[data-slot^="${SLOT_PREFIX}"]`))
        for (const anchor of anchors) {
          const slot = anchor.getAttribute('data-slot') ?? ''
          let index = 0
          const children = []
          for (const child of Array.from(anchor.children)) {
            if (child.closest(`[${SELF_ATTR}]`) !== null) continue
            children.push({
              key: identityOf(child, slot, index),
              tag: child.tagName.toLowerCase(),
              className: typeof child.className === 'string' ? child.className.slice(0, 60) : '',
              ariaLabel: child.getAttribute('aria-label') ?? '',
              title: child.getAttribute('title') ?? '',
              text: (child.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 30),
              hidden: child.hasAttribute(HIDDEN_ATTR),
            })
            index += 1
          }
          slots.push({ slot, children })
        }
        void fetch(`${API_BASE}/scan`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            capturedAt: new Date().toISOString(),
            hidden: Array.from(getHidden()),
            slots,
          }),
        }).catch(() => {})
      } catch {
        /* 侦察失败不影响主功能 */
      }
    }

    // ── 应用隐藏 ─────────────────────────────────────────────────────────────
    /** 把 hidden 集合套用到当前 DOM；返回本次实际命中的控件数。 */
    function applyHidden(hidden) {
      const set = new Set(hidden)
      let hit = 0
      for (const control of scanControls()) {
        const shouldHide = set.has(control.key)
        if (shouldHide) {
          control.element.setAttribute(HIDDEN_ATTR, '1')
          hit += 1
        } else {
          control.element.removeAttribute(HIDDEN_ATTR)
        }
      }
      return hit
    }

    // ── 面板（原生 DOM，避开 portal 与样式继承问题） ─────────────────────────
    let panelEl = null
    let panelCleanup = null

    /** 关闭面板并清理监听。 */
    function closePanel() {
      if (panelCleanup !== null) {
        panelCleanup()
        panelCleanup = null
      }
      if (panelEl !== null) {
        panelEl.remove()
        panelEl = null
      }
    }

    /** 重新渲染面板列表。 */
    function renderRows(listEl, hidden, onChange) {
      listEl.textContent = ''
      const controls = scanControls()
      if (controls.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'cb-empty'
        empty.textContent = '未在输入框工具栏发现控件。请先打开一个会话。'
        listEl.appendChild(empty)
        return
      }

      // 统计重复名，用于标注「重复」
      const nameCount = new Map()
      for (const c of controls) nameCount.set(c.label, (nameCount.get(c.label) ?? 0) + 1)

      for (const control of controls) {
        const row = document.createElement('div')
        row.className = 'cb-row'

        const label = document.createElement('label')
        const box = document.createElement('input')
        box.type = 'checkbox'
        box.checked = hidden.has(control.key)
        box.addEventListener('change', () => {
          if (box.checked) hidden.add(control.key)
          else hidden.delete(control.key)
          onChange()
        })

        const name = document.createElement('span')
        name.className = 'cb-name'
        name.textContent = control.label
        name.title = control.key

        label.appendChild(box)
        label.appendChild(name)

        if ((nameCount.get(control.label) ?? 0) > 1) {
          const dup = document.createElement('span')
          dup.className = 'cb-dup'
          dup.textContent = '重复'
          dup.title = '同一工具栏里出现了多个同名控件（多半来自两个功能相近的插件）'
          label.appendChild(dup)
        }

        const slotTag = document.createElement('span')
        slotTag.className = 'cb-slot'
        slotTag.textContent = control.slot.replace(SLOT_PREFIX, '')

        row.appendChild(label)
        row.appendChild(slotTag)
        listEl.appendChild(row)
      }
    }

    /** 打开面板：列出控件 + 开关 + 全部恢复 + 重新扫描。 */
    function openPanel(anchorBtn, hidden) {
      closePanel()

      const panel = document.createElement('div')
      panel.className = 'cb-panel'

      const head = document.createElement('div')
      head.className = 'cb-head'
      const title = document.createElement('span')
      title.className = 'cb-title'
      title.textContent = '输入框按钮管家'
      head.appendChild(title)

      const actions = document.createElement('div')
      actions.className = 'cb-actions'

      const listEl = document.createElement('div')

      /** 统一提交：本地即时落盘 + 应用 DOM + 上报 host + 刷新侦察快照。 */
      const commit = useCallbackLike(() => {
        const arr = Array.from(hidden)
        writeLocal(arr)
        pushHost(arr)
        applyHidden(arr)
        renderRows(listEl, hidden, commit)
        reportScan()
      })

      const rescan = document.createElement('button')
      rescan.type = 'button'
      rescan.className = 'cb-btn'
      rescan.textContent = '重新扫描'
      rescan.addEventListener('click', () => renderRows(listEl, hidden, commit))

      const restore = document.createElement('button')
      restore.type = 'button'
      restore.className = 'cb-btn'
      restore.textContent = '全部恢复'
      restore.addEventListener('click', () => {
        hidden.clear()
        commit()
      })

      const close = document.createElement('button')
      close.type = 'button'
      close.className = 'cb-btn'
      close.textContent = '关闭'
      close.addEventListener('click', () => closePanel())

      actions.appendChild(rescan)
      actions.appendChild(restore)
      actions.appendChild(close)
      head.appendChild(actions)

      const hint = document.createElement('div')
      hint.className = 'cb-section'
      hint.style.fontSize = '11px'
      hint.style.opacity = '.7'
      hint.textContent = '只隐藏界面，不卸载插件——被隐藏的插件仍在后台运行。要彻底停用请用侧栏「插件」页的开关。'

      panel.appendChild(head)
      panel.appendChild(listEl)
      panel.appendChild(hint)

      renderRows(listEl, hidden, commit)
      // 面板打开即上报快照：这是最需要真实 DOM 事实的时刻。
      reportScan()

      // 定位：贴着按钮下方；空间不足则上翻。全部用视口坐标（panel 是 fixed）。
      document.body.appendChild(panel)
      const rect = anchorBtn.getBoundingClientRect()
      const pw = panel.offsetWidth
      const ph = panel.offsetHeight
      const left = Math.min(Math.max(8, rect.left + rect.width / 2 - pw / 2), window.innerWidth - pw - 8)
      const top = rect.top - ph - 8 >= 8 ? rect.top - ph - 8 : rect.bottom + 8
      panel.style.left = `${Math.round(left)}px`
      panel.style.top = `${Math.round(Math.min(top, window.innerHeight - ph - 8))}px`

      panelEl = panel

      // 点外部关闭；Escape 关闭。
      const onDocDown = (event) => {
        if (panel.contains(event.target)) return
        if (anchorBtn.contains(event.target)) return
        closePanel()
      }
      const onKey = (event) => {
        if (event.key === 'Escape') closePanel()
      }
      document.addEventListener('mousedown', onDocDown, true)
      document.addEventListener('keydown', onKey, true)
      panelCleanup = () => {
        document.removeEventListener('mousedown', onDocDown, true)
        document.removeEventListener('keydown', onKey, true)
      }
    }

    /** 无 hook 场景下的稳定回调包装（面板用原生 DOM，不需要 React 依赖）。 */
    function useCallbackLike(fn) {
      return fn
    }

    // ── 组件 ────────────────────────────────────────────────────────────────
    /**
     * 「⋯」按钮。点击打开管家面板。
     * 状态从 localStorage 读一次，之后由面板内部维护。
     */
    function ButlerButton() {
      const ref = useRef(null)
      const onClick = useCallback(() => {
        if (panelEl !== null) {
          closePanel()
          return
        }
        if (ref.current !== null) openPanel(ref.current, getHidden())
      }, [])

      return h('button', {
        ref,
        type: 'button',
        title: '输入框按钮管家：自定义显示哪些控件',
        'aria-label': '输入框按钮管家',
        [SELF_ATTR]: '1',
        onClick,
        style: {
          background: 'transparent',
          border: '1px solid var(--dsh-border, #d9d9d9)',
          borderRadius: '6px',
          cursor: 'pointer',
          padding: '2px 8px',
          lineHeight: 1.4,
          fontSize: '14px',
          color: 'inherit',
        },
      }, '⋯')
    }

    // ── 应用 ────────────────────────────────────────────────────────────────
    /**
     * 挂载：注入样式 → 恢复已保存的隐藏状态 → 用 MutationObserver 让新渲染的
     * 控件自动继承状态（DSH 切换会话/新插件热装配时 DOM 会重建）。
     */
    function apply(ctx) {
      ensureStyle()

      const hidden = getHidden()
      applyHidden(Array.from(hidden))

      // host 上的 state.json 是权威副本：本地为空时用它补一次（换浏览器/清缓存场景）。
      if (hidden.size === 0) {
        void fetch(`${API_BASE}/state`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            const remote = Array.isArray(data?.hidden) ? data.hidden : []
            if (remote.length === 0) return
            // 原地改单例（不能重新赋值，否则 observer 与面板还持旧引用）。
            hidden.clear()
            for (const key of remote) hidden.add(key)
            writeLocal(remote)
            applyHidden(remote)
          })
          .catch(() => {})
      }

      // DOM 变动后重新套用（节流：合并 60ms 内的连续变动）。
      let pending = 0
      const observer = new MutationObserver(() => {
        if (pending !== 0) return
        pending = window.setTimeout(() => {
          pending = 0
          if (hidden.size > 0) applyHidden(Array.from(hidden))
        }, 60)
      })
      observer.observe(document.body, { childList: true, subtree: true })

      ctx.effect(() => () => {
        if (pending !== 0) window.clearTimeout(pending)
        observer.disconnect()
        closePanel()
      }, 'composer-butler: observer')

      // 页面加载后自动上报一次快照（composer 渲染晚于模块加载，延迟 2s）。
      // 不打开面板也有事实可查，用于排查控件身份漂移。
      const bootScanTimer = window.setTimeout(reportScan, 2000)
      ctx.effect(() => () => window.clearTimeout(bootScanTimer), 'composer-butler: boot scan')

      ctx.effect(() => ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'composer-butler',
        order: 900,
        label: () => '输入框按钮管家',
      }, () => h(ButlerButton, null))), 'composer-butler: composer 按钮')
    }

    exports.apply = apply
    exports.inject = inject
    exports.name = '@lanbaolu/dsh-composer-butler'
    // 便于在浏览器控制台手工核对（不作为公开 API）。
    exports.__test = { scanControls, identityOf, applyHidden }
    return module.exports
  },
})
