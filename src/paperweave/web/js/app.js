/* PaperWeave — application shell, views, and interactions */
(function () {
  const PW = window.PW;
  const U = PW.util;
  const S = PW.store;

  S.init();

  /* ------------------------------------------------------------------ *
   * icons
   * ------------------------------------------------------------------ */
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    graph: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.7" x2="15.4" y2="6.3"/><line x1="8.6" y1="13.3" x2="15.4" y2="17.7"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2V16h5v-1.2c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 2z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    left: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    right: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    down: '<polyline points="6 9 12 15 18 9"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    target: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    tag: '<path d="M20.59 13.41L13.41 20.59a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    columns: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>',
    progress: '<line x1="5" y1="20" x2="5" y2="14"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="19" y1="20" x2="19" y2="4"/><line x1="3" y1="20" x2="21" y2="20"/>',
    read: '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
  };

  function svgIcon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function ico(name, cls) {
    return `<span class="ico ${cls || ''}">${svgIcon(name)}</span>`;
  }

  /* ------------------------------------------------------------------ *
   * state + routes
   * ------------------------------------------------------------------ */
  const state = {
    view: 'grid',
    q: '',
    status: 'all',
    tag: 'all',
    graphCtrl: null,
    graphThreshold: 0.14,
    graphSel: null,
    graphBoard: 'all',
    ideaStrategy: 'mix',
    ideaScope: [],
    ideaCount: 3,
    generated: [],
    pendingConfirm: null,
    pendingImport: null,
  };

  const SUMMARY_SECTIONS = [
    { key: 'problem', label: '研究问题', color: '#B33A2B' },
    { key: 'method', label: '方法', color: '#35577D' },
    { key: 'contributions', label: '贡献', color: '#2F6B5F' },
    { key: 'results', label: '结果', color: '#A9762A' },
    { key: 'limitations', label: '局限', color: '#8f5b3c' },
    { key: 'future', label: '未来工作', color: '#6B4E8E' },
  ];

  const BOARD_PALETTE = ['#2F6B5F', '#35577D', '#A9762A', '#6B4E8E', '#B33A2B', '#4A7C59', '#8A5A44', '#3D6B8C'];

  function parseRoute() {
    const raw = String(location.hash || '').replace(/^#\/?/, '');
    const parts = raw.split('/');
    return { name: parts[0] || 'overview', id: decodeURIComponent(parts.slice(1).join('/') || '') };
  }

  function go(hash) {
    if (location.hash === hash) {
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      location.hash = hash;
    }
  }

  function paper(id) {
    return S.paper(id);
  }

  function statusPill(st) {
    const m = U.STATUS[st] || U.STATUS.unread;
    return `<span class="status ${m.cls}"><i></i>${m.label}</span>`;
  }

  function tagChip(t, asButton = true) {
    const c = U.tagColor(t);
    const style = `color:${c};background:${c}12;border-color:${c}33`;
    if (!asButton) return `<span class="tag" style="${style}">${U.esc(t)}</span>`;
    return `<button class="tag" data-act="filter-tag" data-tag="${U.esc(t)}" style="${style}">${U.esc(t)}</button>`;
  }

  function strategyBadge(id) {
    const m = PW.ideas.strategyMeta(id);
    return `<span class="badge" style="--sc:${m.color}">${m.code} · ${m.label}</span>`;
  }

  function stars(n) {
    return `<span class="stars">${U.stars(n)}</span>`;
  }

  function paperLabel(p) {
    return p.short || U.clip(p.title, 22);
  }

  function stageList() {
    return S.stages();
  }

  function stageForProgress(progress) {
    const list = stageList();
    let found = list[0];
    list.forEach((s) => {
      if ((Number(progress) || 0) >= s.percent) found = s;
    });
    return found;
  }

  function stageOf(p) {
    return S.stage(p.stage) || stageForProgress(p.progress);
  }

  function stageOptions(selected, withPercent = true) {
    return stageList()
      .map((s) => `<option value="${U.esc(s.id)}" ${s.id === selected ? 'selected' : ''}>${U.esc(s.label)}${withPercent ? ` · ${s.percent}%` : ''}</option>`)
      .join('');
  }

  function progressSummary() {
    const ps = S.data.papers;
    const total = ps.length;
    const avg = total ? Math.round(ps.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / total) : 0;
    const started = ps.filter((p) => (Number(p.progress) || 0) > 0).length;
    const done = ps.filter((p) => (Number(p.progress) || 0) >= 100).length;
    return { total, avg, started, done };
  }

  function boardList() {
    const counts = new Map();
    S.data.papers.forEach((p) => {
      const name = (p.board || '未分组').trim() || '未分组';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return [...counts.keys()]
      .sort((a, b) => a.localeCompare(b, 'zh'))
      .map((name, i) => ({ name, count: counts.get(name), color: BOARD_PALETTE[i % BOARD_PALETTE.length] }));
  }

  function boardColorMap() {
    const out = {};
    boardList().forEach((b) => { out[b.name] = b.color; });
    return out;
  }

  function emptyState(iconName, title, text, action) {
    return `<div class="empty">
      <span class="empty-ico">${ico(iconName)}</span>
      <h4>${U.esc(title)}</h4>
      <p>${U.esc(text)}</p>
      ${action || ''}
    </div>`;
  }

  function dateStamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }

  /* ------------------------------------------------------------------ *
   * chrome
   * ------------------------------------------------------------------ */
  const PAGE_META = {
    overview: { crumb: '工作台 / 总览', title: '总览' },
    library: { crumb: '工作台 / 论文库', title: '论文库' },
    progress: { crumb: '工作台 / 阅读进度', title: '阅读进度' },
    paper: { crumb: '论文库 / 论文详情', title: '论文详情' },
    graph: { crumb: '工作台 / 研究版图', title: '研究版图' },
    ideas: { crumb: '工作台 / 灵感工坊', title: '灵感工坊' },
    settings: { crumb: '工作台 / 设置', title: '设置' },
  };

  function updateStorageNote() {
    const el = document.getElementById('storageNote');
    if (!el) return;
    const info = S.storageInfo();
    let text = '未连接项目文件 · 修改不会保存';
    if (info.mode === 'file') text = '项目文件 · 自动保存到 <code>data/paperweave.json</code>';
    else if (info.mode === 'checking') text = '正在连接项目文件…';
    el.classList.toggle('is-file', info.mode === 'file');
    el.classList.toggle('is-offline', info.mode === 'offline');
    el.innerHTML = `<span class="dot"></span><p>${text}</p>`;
  }

  function refreshSide() {
    const d = S.data;
    const papers = d.papers.length;
    const ideas = d.ideas.length;
    const bp = document.getElementById('badgePapers');
    const bi = document.getElementById('badgeIdeas');
    if (bp) bp.textContent = papers;
    if (bi) bi.textContent = ideas;
    const name = d.profile.name || '我的研究档案';
    const field = d.profile.field || '——';
    const sn = document.getElementById('sideName');
    const sf = document.getElementById('sideField');
    const sa = document.getElementById('sideAvatar');
    if (sn) sn.textContent = name;
    if (sf) sf.textContent = field;
    if (sa) sa.textContent = U.initials(name);
    updateStorageNote();
  }

  function setChrome(route) {
    const meta = PAGE_META[route.name] || PAGE_META.overview;
    let title = meta.title;
    let crumb = meta.crumb;
    if (route.name === 'paper') {
      const p = paper(route.id);
      if (p) {
        title = p.short || '论文详情';
        crumb = `论文库 / ${U.clip(p.title, 42)}`;
      }
    }
    const crumbEl = document.getElementById('crumb');
    const titleEl = document.getElementById('pageTitle');
    if (crumbEl) crumbEl.textContent = crumb;
    if (titleEl) titleEl.textContent = title;
    document.title = `${title} · PaperWeave 脉络`;
  }

  function markNav(name) {
    const target = name === 'paper' ? 'library' : name;
    document.querySelectorAll('[data-nav]').forEach((el) => {
      el.classList.toggle('active', el.dataset.nav === target);
    });
  }

  /* ------------------------------------------------------------------ *
   * overview
   * ------------------------------------------------------------------ */
  function miniMap() {
    const ps = S.data.papers.slice(0, 6);
    if (!ps.length) {
      return `<div class="map-empty">
        <svg viewBox="0 0 300 200"><ellipse cx="150" cy="100" rx="100" ry="66" fill="none" stroke="rgba(233,182,168,.22)" stroke-dasharray="4 7"/><circle cx="150" cy="100" r="5" fill="rgba(233,182,168,.5)"/></svg>
        <p>录入第一篇论文，版图会从这里生长。</p>
      </div>`;
    }
    const n = ps.length;
    const pos = new Map();
    ps.forEach((p, i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / n;
      const rad = n === 1 ? 0 : 1;
      pos.set(p.id, { x: 160 + Math.cos(a) * 102 * rad, y: 114 + Math.sin(a) * 74 * rad });
    });
    const edges = S.data.links.filter((l) => pos.has(l.source) && pos.has(l.target));
    const edgeSvg = edges
      .map((l) => {
        const a = pos.get(l.source);
        const b = pos.get(l.target);
        const rel = U.RELATIONS[l.type] || U.RELATIONS.inspiration;
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${rel.color}" stroke-width="1.4" opacity=".55"/>`;
      })
      .join('');
    const nodeSvg = ps
      .map((p) => {
        const pt = pos.get(p.id);
        const c = U.tagColor((p.tags || [])[0] || '');
        const cnt = S.linksOf(p.id).length;
        const r = U.clamp(8 + cnt * 1.4, 8, 15);
        const label = U.clip(paperLabel(p), 11);
        return `<g data-act="open-paper" data-id="${U.esc(p.id)}" style="cursor:pointer">
          <circle cx="${pt.x}" cy="${pt.y}" r="${r + 5}" fill="${c}" opacity=".1"/>
          <circle cx="${pt.x}" cy="${pt.y}" r="${r}" fill="#FCFAF4" stroke="${c}" stroke-width="2"/>
          <text x="${pt.x}" y="${pt.y + r + 12}" text-anchor="middle" font-size="9" fill="#cfc7b4" font-family="sans-serif">${U.esc(label)}</text>
        </g>`;
      })
      .join('');
    return `<svg viewBox="0 0 320 232" role="img" aria-label="研究版图缩略">
      <ellipse cx="160" cy="114" rx="118" ry="84" fill="none" stroke="rgba(233,182,168,.16)" stroke-dasharray="3 7"/>
      <ellipse cx="160" cy="114" rx="78" ry="52" fill="none" stroke="rgba(233,182,168,.09)" stroke-dasharray="2 8"/>
      ${edgeSvg}${nodeSvg}
    </svg>`;
  }

  function renderOverview() {
    const d = S.data;
    const st = S.stats();
    const tags = S.tagStats();
    const recent = S.recent(4);
    const ideas = d.ideas
      .slice()
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 2);
    const maxTag = tags.length ? tags[0].count : 1;
    const topTag = tags.length ? tags[0].tag : '——';
    const exploring = d.ideas.filter((i) => i.status === 'exploring').length;

    const banner =
      d.meta.demo && !d.meta.demoDismissed
        ? `<div class="demo-banner">${ico('spark')}<p>这是一个可编辑的起步档案：四篇论文来自你桌面上的 PDF，摘要与批注可以随意修改；也可以在设置里清空，换成自己的论文。</p><button data-act="dismiss-demo">知道了</button></div>`
        : '';

    return `${banner}
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">${U.greeting()}，${U.esc(d.profile.name)}</p>
        <h2>把读过的论文，<br /><em>织成</em>下一步的研究。</h2>
        <p class="lede">每读完一篇，留下结构化的总结；PaperWeave 会把它放进你的研究版图，找出与旧论文的隐秘联系，并把缺口拼成可以动手的 idea。</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-act="new-paper">${ico('plus')}添加论文</button>
          <a class="btn btn-hero-ghost" href="#/graph">${ico('graph')}打开研究版图</a>
        </div>
        <div class="hero-meta">
          <span><b>${st.weekNew}</b> 篇本周新增</span>
          <span><b>${st.read}</b> 篇已读</span>
          <span><b>${exploring}</b> 条灵感在探索</span>
        </div>
      </div>
      <div class="hero-map">
        <div class="map-caption"><span>研究版图</span><span>LIVE</span></div>
        ${miniMap()}
        <div class="map-caption" style="margin-top:2px"><span>颜色 = 主题</span><span>大小 = 关联数</span></div>
      </div>
    </section>

    <div class="stats-grid">
      <article class="stat-card" style="--c:#2F6B5F">
        <div class="stat-top"><span>论文总数</span><span class="stat-ico">${ico('book')}</span></div>
        <div class="stat-value">${st.papers}<small>篇</small></div>
        <div class="stat-sub">已读 <b>${st.read}</b> · 在读 <b>${st.reading}</b> · 待读 <b>${st.unread}</b></div>
      </article>
      <article class="stat-card" style="--c:#35577D">
        <div class="stat-top"><span>论文关联</span><span class="stat-ico">${ico('link')}</span></div>
        <div class="stat-value">${st.links}<small>条</small></div>
        <div class="stat-sub">覆盖 <b>${st.papers}</b> 篇论文的阅读网络</div>
      </article>
      <article class="stat-card" style="--c:#A9762A">
        <div class="stat-top"><span>研究主题</span><span class="stat-ico">${ico('tag')}</span></div>
        <div class="stat-value">${st.tags}<small>个</small></div>
        <div class="stat-sub">最高频：<b>${U.esc(topTag)}</b></div>
      </article>
      <article class="stat-card" style="--c:#B33A2B">
        <div class="stat-top"><span>灵感卡片</span><span class="stat-ico">${ico('bulb')}</span></div>
        <div class="stat-value">${st.ideas}<small>条</small></div>
        <div class="stat-sub">其中 <b>${exploring}</b> 条正在探索</div>
      </article>
    </div>

    <div class="overview-grid" style="margin-top:18px">
      <section class="panel">
        <div class="panel-head">
          <h3>${ico('clock')}继续阅读</h3>
          <a class="link" href="#/library" style="font-size:11.5px">全部论文 →</a>
        </div>
        ${recent.length
          ? `<div class="recent-list">${recent
              .map(
                (p) => `<div class="recent-row" data-act="open-paper" data-id="${U.esc(p.id)}">
                  <span class="paper-initial" style="color:${U.tagColor((p.tags || [])[0] || '')}">${U.esc(U.initials(paperLabel(p)))}</span>
                  <div class="recent-main">
                    <b>${U.esc(p.title)}</b>
                    <small>${U.esc(p.venue || '未标注出处')} · ${p.year || '—'} · ${U.relTime(p.updatedAt)}更新</small>
                  </div>
                  ${statusPill(p.status)}
                  <span class="recent-arrow">${ico('right')}</span>
                </div>`
              )
              .join('')}</div>`
          : emptyState('book', '还没有论文', '从录入第一篇论文的总结开始，版图会慢慢长出来。', `<button class="btn btn-primary btn-sm" data-act="new-paper">${ico('plus')}录入第一篇</button>`)}
      </section>

      <div class="side-stack">
        <section class="panel">
          <div class="panel-head"><h3>${ico('tag')}主题分布</h3><span class="count">${tags.length}</span></div>
          ${tags.length
            ? `<div class="tag-bars">${tags
                .slice(0, 6)
                .map(
                  (t) => `<div class="tag-bar" data-act="filter-tag" data-tag="${U.esc(t.tag)}" style="--c:${t.color}">
                    <span>${U.esc(t.tag)}</span>
                    <i style="--w:${Math.max(8, (t.count / maxTag) * 100)}%"></i>
                    <em>${t.count}</em>
                  </div>`
                )
                .join('')}</div>`
            : `<div class="tag-bars"><p class="faint" style="font-size:11.5px">录入论文后，这里会出现你的主题分布。</p></div>`}
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>${ico('bulb')}灵感速览</h3>
            <a class="link" href="#/ideas" style="font-size:11.5px">工坊 →</a>
          </div>
          ${ideas.length
            ? ideas
                .map(
                  (i) => `<div class="idea-mini" data-act="open-idea" data-id="${U.esc(i.id)}">
                    ${strategyBadge(i.strategy)}
                    <h4>${U.esc(i.title)}</h4>
                    <p>${U.esc(U.clip(i.hypothesis, 84))}</p>
                    <div class="idea-src">${ico('link')}${i.sourceIds.map((id) => U.esc(paper(id) ? paperLabel(paper(id)) : '')).filter(Boolean).join(' × ')}</div>
                  </div>`
                )
                .join('')
            : `<div class="panel-pad"><p class="faint" style="font-size:11.5px;line-height:1.7">还没有灵感卡片。去灵感工坊，让已读的论文互相碰撞。</p></div>`}
        </section>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------------ *
   * library
   * ------------------------------------------------------------------ */
  function filteredPapers() {
    let list = S.data.papers.slice();
    if (state.status !== 'all') list = list.filter((p) => p.status === state.status);
    if (state.tag !== 'all') list = list.filter((p) => (p.tags || []).includes(state.tag));
    const q = state.q.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.short, p.authors, p.venue, p.board, (p.tags || []).join(' '), p.problem, p.method, p.contributions, p.results, p.limitations, p.future, p.notes]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  function paperCard(p) {
    const c = U.tagColor((p.tags || [])[0] || '');
    const links = S.linksOf(p.id).length;
    return `<article class="paper-card" data-act="open-paper" data-id="${U.esc(p.id)}" style="--c:${c}">
      <div class="pc-top">
        ${statusPill(p.status)}
        <span class="pc-rating">${stars(p.rating)}</span>
      </div>
      <h3>${U.esc(p.title)}</h3>
      <p class="pc-problem">${U.esc(U.clip(p.problem || p.method || p.notes || '还没有写摘要，点开补充。', 110))}</p>
      <div class="pc-tags">${(p.tags || []).slice(0, 3).map((t) => tagChip(t)).join('')}</div>
      <div class="pc-foot">
        <span>${U.esc(p.venue || '未标注出处')}${p.year ? ' · ' + p.year : ''}</span>
        <span>${ico('link')}${links} 条关联</span>
      </div>
    </article>`;
  }

  function paperRow(p) {
    return `<div class="paper-row" data-act="open-paper" data-id="${U.esc(p.id)}">
      <span class="paper-initial" style="color:${U.tagColor((p.tags || [])[0] || '')}">${U.esc(U.initials(paperLabel(p)))}</span>
      <div>
        <h3>${U.esc(p.title)}</h3>
        <div class="row-meta">
          ${statusPill(p.status)}
          <span>${U.esc(p.venue || '未标注出处')}${p.year ? ' · ' + p.year : ''}</span>
          <span>${(p.tags || []).slice(0, 3).join(' / ') || '未分类'}</span>
        </div>
      </div>
      <div class="row-right">
        ${stars(p.rating)}
        <span class="faint" style="font-size:10.5px;display:inline-flex;align-items:center;gap:4px">${ico('link')}${S.linksOf(p.id).length}</span>
      </div>
    </div>`;
  }

  function renderLibraryList() {
    const box = document.getElementById('libList');
    if (!box) return;
    const list = filteredPapers();
    const countEl = document.getElementById('libCount');
    if (countEl) countEl.innerHTML = `<span>共 <b style="color:var(--ink-2)">${list.length}</b> 篇${state.q ? ` · 搜索「${U.esc(state.q)}」` : ''}</span><span>按最近更新排序</span>`;
    if (!list.length) {
      box.className = '';
      box.innerHTML = emptyState(
        'search',
        '没有匹配的论文',
        '换个关键词，或者清空筛选条件再看看。',
        `<button class="btn btn-ghost btn-sm" data-act="clear-filters">${ico('close')}清空筛选</button>`
      );
      return;
    }
    box.className = state.view === 'list' ? 'paper-list' : 'paper-grid';
    box.innerHTML = list.map((p) => (state.view === 'list' ? paperRow(p) : paperCard(p))).join('');
  }

  function renderLibrary() {
    const tags = S.tagStats();
    const st = S.stats();
    return `<div class="lib-toolbar">
      <label class="search-box">${ico('search')}
        <input type="search" data-input="lib-search" value="${U.esc(state.q)}" placeholder="搜索标题、作者、标签、摘要…" />
      </label>
      <div class="segmented">
        <button class="seg-btn ${state.status === 'all' ? 'active' : ''}" data-act="filter-status" data-status="all">全部 <em>${st.papers}</em></button>
        <button class="seg-btn ${state.status === 'read' ? 'active' : ''}" data-act="filter-status" data-status="read">已读 <em>${st.read}</em></button>
        <button class="seg-btn ${state.status === 'reading' ? 'active' : ''}" data-act="filter-status" data-status="reading">在读 <em>${st.reading}</em></button>
        <button class="seg-btn ${state.status === 'unread' ? 'active' : ''}" data-act="filter-status" data-status="unread">待读 <em>${st.unread}</em></button>
      </div>
      <div class="view-toggle">
        <button class="icon-btn ${state.view === 'grid' ? 'active' : ''}" data-act="view-mode" data-view="grid" title="网格视图">${ico('grid')}</button>
        <button class="icon-btn ${state.view === 'list' ? 'active' : ''}" data-act="view-mode" data-view="list" title="列表视图">${ico('list')}</button>
      </div>
    </div>
    <div class="tag-filter">
      <span class="filter-label">主题</span>
      <button class="filter-chip ${state.tag === 'all' ? 'active' : ''}" data-act="filter-tag" data-tag="all">全部</button>
      ${tags.slice(0, 14).map((t) => `<button class="filter-chip ${state.tag === t.tag ? 'active' : ''}" data-act="filter-tag" data-tag="${U.esc(t.tag)}">${U.esc(t.tag)} <em>${t.count}</em></button>`).join('')}
    </div>
    <div id="libCount" class="lib-count"></div>
    <div id="libList"></div>`;
  }

  /* ------------------------------------------------------------------ *
   * reading progress
   * ------------------------------------------------------------------ */
  function renderProgress() {
    const d = S.data;
    const ps = d.papers.slice().sort((a, b) => (a.progress || 0) - (b.progress || 0) || new Date(b.updatedAt) - new Date(a.updatedAt));
    const sum = progressSummary();
    const stages = stageList();
    const stageCounts = stages.map((s) => ({ ...s, count: ps.filter((p) => stageOf(p).id === s.id).length }));
    const statusOrder = ['reading', 'unread', 'read'];

    if (!ps.length) {
      return `<div class="page-intro">
        <div><h2>阅读进度</h2><p>用一张表管理每篇论文读到哪了。阶段和百分比都由你定义。</p></div>
      </div>
      ${emptyState('progress', '还没有论文可以跟踪', '先把想读的论文加入论文库，进度会在这里自动出现。', `<button class="btn btn-primary btn-sm" data-act="new-paper">${ico('plus')}加入第一篇</button>`)}`;
    }

    const rows = ps
      .map((p) => {
        const stage = stageOf(p);
        return `<tr data-row="${U.esc(p.id)}">
          <td class="pt-paper">
            <a class="pt-title" href="#/paper/${encodeURIComponent(p.id)}">${U.esc(p.short || p.title)}</a>
            <div class="pt-meta">${statusPill(p.status)}<span>${U.esc(p.venue || '未填出处')}${p.year ? ` · ${p.year}` : ''}</span></div>
          </td>
          <td class="pt-stage">
            <select class="stage-select" data-change="paper-stage" data-id="${U.esc(p.id)}" aria-label="阶段">${stageOptions(stage.id, false)}</select>
          </td>
          <td class="pt-progress">
            <div class="pt-bar"><i style="width:${p.progress}%"></i></div>
            <div class="pt-slider">
              <input type="range" min="0" max="100" step="1" value="${p.progress}" data-input="paper-progress" data-id="${U.esc(p.id)}" aria-label="阅读进度" />
              <b class="pt-pct">${p.progress}%</b>
            </div>
          </td>
          <td class="pt-note">
            <input type="text" value="${U.esc(p.progressNote || '')}" data-change="paper-progress-note" data-id="${U.esc(p.id)}" placeholder="读到哪了？下一步做什么？" maxlength="80" aria-label="进度备注" />
          </td>
          <td class="pt-updated">${U.relTime(p.updatedAt || p.createdAt)}</td>
        </tr>`;
      })
      .join('');

    return `<div class="page-intro">
      <div>
        <h2>阅读进度</h2>
        <p>每篇论文读到哪、下一步做什么，都由你定义。拖动百分比，或直接选一个阶段。</p>
      </div>
      <button class="btn btn-ghost btn-sm" data-act="new-paper">${ico('plus')}加入论文</button>
    </div>

    <section class="progress-overview">
      <div class="progress-ring" style="--p:${sum.avg}">
        <div><b>${sum.avg}%</b><span>平均进度</span></div>
      </div>
      <div class="progress-kpis">
        <div><b>${sum.total}</b><span>论文总数</span></div>
        <div><b>${sum.started}</b><span>已经开始</span></div>
        <div><b>${sum.done}</b><span>已读完</span></div>
      </div>
      <div class="stage-legend">
        ${stageCounts
          .map(
            (s) => `<span class="stage-chip">
              <i style="--c:${U.tagColor(s.label)}"></i>${U.esc(s.label)}<b>${s.count}</b>
            </span>`
          )
          .join('')}
      </div>
    </section>

    <section class="panel progress-board">
      <div class="panel-head">
        <h3>${ico('progress')}进度表</h3>
        <span class="count">${ps.length} 篇 · 按进度从低到高</span>
      </div>
      <div class="progress-table-wrap">
        <table class="progress-table">
          <thead><tr>
            <th>论文</th>
            <th>阶段</th>
            <th>进度</th>
            <th>备注</th>
            <th>更新</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="progress-foot">
        <span>${ico('info')}阶段名称和百分比可以在 <a href="#/settings">设置</a> 里自定义。</span>
        <span class="faint">状态：${statusOrder.map((s) => `${U.STATUS[s].label} ${ps.filter((p) => p.status === s).length}`).join(' · ')}</span>
      </div>
    </section>`;
  }

  /* ------------------------------------------------------------------ *
   * paper detail
   * ------------------------------------------------------------------ */
  function renderPaper(id) {
    const p = paper(id);
    if (!p) {
      return emptyState('book', '找不到这篇论文', '它可能已经被删除，或者链接已经失效。', `<a class="btn btn-ghost btn-sm" href="#/library">${ico('left')}回到论文库</a>`);
    }
    const links = S.linksOf(p.id);
    const suggestions = PW.sim.suggestions(p, S.data.papers, links, 4);
    const ideas = S.ideasFor(p.id);
    const progress = SUMMARY_SECTIONS.filter((s) => (p[s.key] || '').trim()).length;
    const url = U.safeUrl(p.url);

    return `<a class="back-link" href="#/library">${ico('left')}论文库</a>
    <header class="detail-head">
      <div class="detail-actions">
        <button class="icon-btn" data-act="edit-paper" data-id="${U.esc(p.id)}" title="编辑">${ico('edit')}</button>
        <button class="icon-btn danger" data-act="delete-paper" data-id="${U.esc(p.id)}" title="删除">${ico('trash')}</button>
      </div>
      <div class="detail-kicker">
        ${statusPill(p.status)}
        <span class="detail-board"><span class="board-dot" style="--c:${boardColorMap()[p.board || '未分组'] || 'var(--muted)'}"></span>${U.esc(p.board || '未分组')}</span>
        ${(p.tags || []).slice(0, 4).map((t) => tagChip(t)).join('')}
      </div>
      <h2 class="detail-title">${U.esc(p.title)}</h2>
      <p class="detail-sub">${U.esc(p.authors || '作者未填写')}${p.venue ? ` · <b>${U.esc(p.venue)}</b>` : ''}${p.year ? ` · ${p.year}` : ''}</p>
      <div class="detail-strip">
        <span class="strip-item">${ico('clock')}录入于 ${U.fmtDate(p.createdAt, { year: true })}</span>
        <span class="strip-item">${ico('link')}关联 <b>${links.length}</b> 篇</span>
        <span class="strip-item">${ico('bulb')}灵感 <b>${ideas.length}</b> 条</span>
        <span class="strip-item">${ico('file')}摘要完成度 <b>${progress}/6</b></span>
        <span class="strip-item" style="margin-left:auto">
          <span class="status-select">
            ${['reading', 'read', 'unread'].map((s) => `<button data-act="set-status" data-id="${U.esc(p.id)}" data-status="${s}" class="${p.status === s ? 'active' : ''}">${U.STATUS[s].label}</button>`).join('')}
          </span>
        </span>
        <span class="strip-item">
          <span class="rating-input">
            ${[1, 2, 3, 4, 5].map((n) => `<button data-act="set-rating" data-id="${U.esc(p.id)}" data-value="${n}" class="${n <= p.rating ? 'on' : ''}" title="${n} 星">★</button>`).join('')}
          </span>
        </span>
        ${url ? `<a class="strip-item link" href="${U.esc(url)}" target="_blank" rel="noopener">${ico('external')}${U.esc(U.hostOf(url) || '论文链接')}</a>` : ''}
      </div>
    </header>

    <div class="detail-grid">
      <div class="detail-main">
        <section class="panel">
          <div class="panel-head">
            <h3>${ico('file')}结构化摘要</h3>
            <span class="count">${progress} / 6</span>
          </div>
          <div class="summary-body">
            ${SUMMARY_SECTIONS.map(
              (s) => `<div class="summary-section" style="--c:${s.color}">
                <div class="sum-label">${s.label}<em>${(p[s.key] || '').length ? '' : 'EMPTY'}</em></div>
                <div class="sum-body ${(p[s.key] || '').trim() ? '' : 'empty-text'}">${(p[s.key] || '').trim() ? U.esc(p[s.key]) : '尚未填写，点右上角编辑补充。'}</div>
              </div>`
            ).join('')}
          </div>
        </section>

        <section class="panel notes-panel">
          <div class="panel-head">
            <h3>${ico('edit')}我的批注</h3>
            <span class="count">${p.notes ? '有笔记' : '空'}</span>
          </div>
          <div class="notes-body">${p.notes ? U.esc(p.notes) : '在这里记下你的直觉、疑问和“如果是我会怎么做”。这些句子往往是灵感的种子。'}</div>
        </section>
      </div>

      <aside class="detail-side">
        <section class="panel detail-progress-panel">
          <div class="panel-head">
            <h3>${ico('progress')}阅读进度</h3>
            <span class="count">${U.esc((stageOf(p) || {}).label || '')}</span>
          </div>
          <div class="detail-progress">
            <div class="pt-bar"><i style="width:${p.progress}%"></i></div>
            <div class="detail-progress-row"><b>${p.progress}%</b><a href="#/progress">在进度表中调整</a></div>
            ${p.progressNote ? `<p class="detail-progress-note">${U.esc(p.progressNote)}</p>` : `<p class="detail-progress-note faint">还没有进度备注。可以在进度表里写下读到哪、下一步做什么。</p>`}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>${ico('link')}论文关联</h3>
            <button class="btn btn-quiet btn-sm" data-act="add-link" data-source="${U.esc(p.id)}">${ico('plus')}添加</button>
          </div>
          ${links.length
            ? `<div class="side-list">${links
                .map((l) => {
                  const otherId = l.source === p.id ? l.target : l.source;
                  const other = paper(otherId);
                  const rel = U.RELATIONS[l.type] || U.RELATIONS.inspiration;
                  const arrow = l.type === 'extends' || l.type === 'applies';
                  const dir = l.source === p.id ? '→' : '←';
                  return `<div class="side-item">
                    <span class="rel-dot" style="--rc:${rel.color}"></span>
                    <div class="side-item-main">
                      <div class="rel-label">${rel.label}${arrow ? ' ' + dir : ''}</div>
                      <span class="side-title" data-act="open-paper" data-id="${U.esc(otherId)}">${other ? U.esc(other.title) : '（已删除）'}</span>
                      ${l.note ? `<p>${U.esc(l.note)}</p>` : ''}
                    </div>
                    <button class="icon-btn danger" data-act="delete-link" data-id="${U.esc(l.id)}" title="移除关联">${ico('close')}</button>
                  </div>`;
                })
                .join('')}</div>`
            : `<div class="panel-pad"><p class="faint" style="font-size:11.5px;line-height:1.65">还没有人工关联。把这篇论文和旧论文接起来，未来的灵感会沿着这条线出现。</p></div>`}
        </section>

        <section class="panel">
          <div class="panel-head"><h3>${ico('spark')}系统推荐</h3><span class="count">${suggestions.length}</span></div>
          ${suggestions.length
            ? suggestions
                .map((s) => {
                  const rel = U.RELATIONS[s.relation] || U.RELATIONS.inspiration;
                  return `<div class="suggest-row">
                    <div class="suggest-top">
                      <span class="suggest-score" style="--p:${Math.round(s.score * 100)}"><b>${Math.round(s.score * 100)}</b></span>
                      <div class="suggest-info">
                        <b>${U.esc(s.paper.title)}</b>
                        <small>${U.esc(s.reasons.join(' · '))}</small>
                      </div>
                    </div>
                    <div class="suggest-actions">
                      <span class="rel" style="--rc:${rel.color}"><i></i>${rel.label}</span>
                      <button class="btn btn-ghost btn-sm" data-act="connect" data-source="${U.esc(p.id)}" data-target="${U.esc(s.paper.id)}">${ico('link')}建立关联</button>
                    </div>
                  </div>`;
                })
                .join('')
            : `<div class="panel-pad"><p class="faint" style="font-size:11.5px;line-height:1.65">${S.data.papers.length < 2 ? '至少需要两篇论文，系统才能给出推荐。' : '暂时没有高置信度的候选。你可以手动挑一篇论文建立关联，或者先补全这篇论文的摘要。'}</p><button class="btn btn-ghost btn-sm" style="margin-top:8px" data-act="add-link" data-source="${U.esc(p.id)}">${ico('plus')}手动建立关联</button></div>`}
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>${ico('bulb')}相关灵感</h3>
            <button class="btn btn-quiet btn-sm" data-act="open-idea-for" data-id="${U.esc(p.id)}">${ico('spark')}生成</button>
          </div>
          ${ideas.length
            ? ideas
                .slice(0, 3)
                .map(
                  (i) => `<div class="mini-idea" data-act="open-idea" data-id="${U.esc(i.id)}">
                    ${strategyBadge(i.strategy)}
                    <h5>${U.esc(i.title)}</h5>
                    <small>${(U.IDEA_STATUS[i.status] || U.IDEA_STATUS.seed).label} · ${U.relTime(i.updatedAt || i.createdAt)}</small>
                  </div>`
                )
                .join('')
            : `<div class="panel-pad"><p class="faint" style="font-size:11.5px;line-height:1.65">还没有从这篇论文长出的灵感。去工坊，把它和另一篇论文放在一起。</p><button class="btn btn-ghost btn-sm" style="margin-top:8px" data-act="open-idea-for" data-id="${U.esc(p.id)}">${ico('spark')}以这篇为锚点生成</button></div>`}
        </section>
      </aside>
    </div>`;
  }

  /* ------------------------------------------------------------------ *
   * graph
   * ------------------------------------------------------------------ */
  function renderGraphPage() {
    const papers = S.data.papers;
    const links = S.data.links;
    const boards = boardList();
    if (state.graphBoard !== 'all' && !boards.some((b) => b.name === state.graphBoard)) {
      state.graphBoard = 'all';
    }
    const activeBoard = state.graphBoard;
    const shownPapers = activeBoard === 'all' ? papers : papers.filter((p) => (p.board || '未分组') === activeBoard);
    const shownIds = new Set(shownPapers.map((p) => p.id));
    const shownLinks = links.filter((l) => shownIds.has(l.source) && shownIds.has(l.target));
    if (state.graphSel && !shownIds.has(state.graphSel)) state.graphSel = null;
    const counts = {};
    shownLinks.forEach((l) => {
      counts[l.type] = (counts[l.type] || 0) + 1;
    });
    const boardBar = boards.length > 1
      ? `<div class="graph-boards" role="group" aria-label="按研究板块筛选">
          <button class="board-chip ${activeBoard === 'all' ? 'active' : ''}" data-act="graph-board" data-board="all">
            <span class="board-dot" style="--c:var(--ink)"></span>全部 <b>${papers.length}</b>
          </button>
          ${boards.map((b) => `<button class="board-chip ${activeBoard === b.name ? 'active' : ''}" data-act="graph-board" data-board="${U.esc(b.name)}" style="--c:${b.color}">
            <span class="board-dot"></span>${U.esc(b.name)} <b>${b.count}</b>
          </button>`).join('')}
        </div>`
      : '';
    return `<div class="graph-view-head">
      <div>
        <h2>研究版图</h2>
        <p>${activeBoard === 'all' ? '按研究板块分组展示；每篇论文是一个节点，每条线是一次判断。' : `只看「${U.esc(activeBoard)}」板块；拖拽节点重新布局，滚轮缩放。`}</p>
      </div>
      <div class="segmented">
        <span class="seg-btn" style="cursor:default">${shownPapers.length} 节点</span>
        <span class="seg-btn" style="cursor:default">${shownLinks.length} 显式关联</span>
      </div>
    </div>
    ${boardBar}
    <div class="graph-shell">
      <div class="graph-panel">
        <canvas id="graphCanvas"></canvas>
        <div class="graph-tools">
          <button class="icon-btn" data-act="graph-fit" title="适应画布">${ico('target')}</button>
        </div>
        <div class="graph-hint">拖拽节点 · 滚轮缩放 · 双击复位</div>
      </div>
      <aside class="graph-side">
        <section class="panel graph-card">
          <h4>关联强度阈值 <span>虚线</span></h4>
          <div class="slider-row">
            <input type="range" min="5" max="60" step="1" value="${Math.round(state.graphThreshold * 100)}" data-input="graph-threshold" />
            <output id="thrOut">${Math.round(state.graphThreshold * 100)}%</output>
          </div>
          <p class="graph-note">系统根据文本与主题推断的潜在关联以虚线显示。阈值越高，只保留越强的推断连接；人工建立的实线始终显示。</p>
        </section>

        <section class="panel graph-card">
          <h4>关系图例 <span>${shownLinks.length}</span></h4>
          <div class="legend">
            ${Object.entries(U.RELATIONS)
              .map(
                ([k, r]) => `<div class="legend-item">
                  <span class="legend-line" style="--c:${r.color}"></span>${r.label}
                  <span class="legend-count">${counts[k] || 0}</span>
                </div>`
              )
              .join('')}
            <div class="legend-item"><span class="legend-line dashed"></span>推断关联<span class="legend-count">${Math.max(0, (shownPapers.length * (shownPapers.length - 1)) / 2 - shownLinks.length)}</span></div>
          </div>
        </section>

        <section class="panel graph-card">
          <h4>节点详情 <span>点击节点</span></h4>
          <div id="graphSel"></div>
        </section>
      </aside>
    </div>`;
  }

  function renderGraphSelection(id) {
    const box = document.getElementById('graphSel');
    if (!box) return;
    const p = paper(id);
    if (!p) {
      box.innerHTML = `<p class="graph-placeholder">点击任意节点，查看它的摘要、标签与关联。<br />空白处点击取消选择。</p>`;
      return;
    }
    const links = S.linksOf(p.id);
    box.innerHTML = `<div class="graph-selected">
      <div class="gs-meta">${U.esc(p.venue || '未标注出处')}${p.year ? ' · ' + p.year : ''} · ${links.length} 条关联</div>
      <div class="gs-title">${U.esc(p.title)}</div>
      <div class="gs-board"><span class="board-dot" style="--c:${boardColorMap()[p.board || '未分组'] || 'var(--muted)'}"></span>${U.esc(p.board || '未分组')}</div>
      <div class="gs-tags">${(p.tags || []).slice(0, 4).map((t) => tagChip(t)).join('')}</div>
      <p class="graph-note" style="margin-top:0">${U.esc(U.clip(p.problem || p.method || '还没有摘要。', 90))}</p>
      <div class="gs-actions">
        <button class="btn btn-ghost btn-sm" data-act="open-paper" data-id="${U.esc(p.id)}">打开论文</button>
        <button class="btn btn-quiet btn-sm" data-act="edit-paper" data-id="${U.esc(p.id)}">${ico('edit')}编辑</button>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------------ *
   * ideas
   * ------------------------------------------------------------------ */
  function renderGeneratedCard(idea, idx) {
    const m = PW.ideas.strategyMeta(idea.strategy);
    const sources = idea.sourceIds.map((id) => paper(id)).filter(Boolean);
    return `<article class="gen-result" style="--sc:${m.color}">
      <div class="gr-head">
        ${strategyBadge(idea.strategy)}
        <h3>${U.esc(idea.title)}</h3>
      </div>
      <div class="gr-body">
        <p class="gr-hyp">${U.esc(idea.hypothesis)}</p>
        <div class="gr-scores">
          ${Object.entries({ 新颖度: idea.scores.novelty, 可行性: idea.scores.feasibility, 影响力: idea.scores.impact })
            .map(
              ([label, v]) => `<span class="score-line">${label} <b>${v}</b><span class="bar"><i style="width:${v}%"></i></span></span>`
            )
            .join('')}
        </div>
        <div class="gr-sources">${sources.map((p) => `<span class="tag">${U.esc(paperLabel(p))}</span>`).join('')}</div>
        <details class="gr-evidence">
          <summary>证据链 · ${idea.evidence.length} 条</summary>
          <div class="evidence-list">
            ${idea.evidence
              .map((e) => {
                const p = paper(e.paperId);
                return `<div class="evidence-item">
                  <span class="ev-field">${U.esc(e.field)}</span>
                  <p>${U.esc(e.quote)}</p>
                  <small>${p ? U.esc(p.title) : '（论文已移除）'}</small>
                </div>`;
              })
              .join('')}
          </div>
        </details>
      </div>
      <div class="gr-foot">
        <button class="btn btn-primary btn-sm" data-act="save-generated" data-idx="${idx}">${ico('plus')}保存到灵感板</button>
        <button class="btn btn-ghost btn-sm" data-act="regen-one" data-idx="${idx}">换一条</button>
        <button class="btn btn-quiet btn-sm" data-act="copy-generated" data-idx="${idx}">${ico('copy')}复制</button>
        <span class="push"></span>
        <span class="faint" style="font-size:10.5px">来自你自己的总结，不是模型编造</span>
      </div>
    </article>`;
  }

  function renderIdeasBoard() {
    return `<div class="board">
      ${Object.entries(U.IDEA_STATUS)
        .map(([key, meta]) => {
          const list = S.data.ideas
            .filter((i) => i.status === key)
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
          const color = key === 'seed' ? '#A9762A' : key === 'exploring' ? '#35577D' : key === 'project' ? '#2F6B5F' : '#7c7668';
          return `<div class="board-col" data-status="${key}">
            <div class="board-head" style="--c:${color}">
              <span class="dot"></span><b>${meta.label}</b><em>${list.length}</em>
            </div>
            <div class="board-body">
              ${
                list.length
                  ? list
                      .map((i) => {
                        const m = PW.ideas.strategyMeta(i.strategy);
                        const total = Math.round((i.scores.novelty + i.scores.feasibility + i.scores.impact) / 3);
                        return `<article class="idea-card" draggable="true" data-id="${U.esc(i.id)}" data-act="open-idea" style="--sc:${m.color}">
                          ${strategyBadge(i.strategy)}
                          <h4>${U.esc(i.title)}</h4>
                          <p>${U.esc(U.clip(i.hypothesis, 62))}</p>
                          <div class="ic-foot">
                            <span>${i.sourceIds.length} 篇</span>
                            <span class="scores">${total}</span>
                          </div>
                        </article>`;
                      })
                      .join('')
                  : '<div class="board-empty">拖动卡片到这里</div>'
              }
            </div>
          </div>`;
        })
        .join('')}
    </div>`;
  }

  function renderIdeas() {
    const papers = S.data.papers;
    const generated = state.generated;
    return `<div class="ideas-head">
      <div>
        <h2>灵感工坊</h2>
        <p>把两篇或三篇论文放进同一个问题里。每条灵感都带着可追溯的证据链，你可以把它拖进灵感板继续养大。</p>
      </div>
      <div class="segmented"><span class="seg-btn" style="cursor:default">${S.data.ideas.length} 条已保存</span></div>
    </div>

    <div class="strategy-grid">
      ${PW.ideas.STRATEGIES.map(
        (s) => `<button class="strategy-card ${state.ideaStrategy === s.id ? 'active' : ''}" data-act="strategy" data-id="${s.id}" aria-pressed="${state.ideaStrategy === s.id}" style="--sc:${s.color}">
          <span class="sc-code">${s.code}</span>
          <span class="sc-label">${s.label}</span>
          <span class="sc-desc">${s.desc}</span>
        </button>`
      ).join('')}
    </div>

    <section class="panel gen-panel">
      <div class="gen-row">
        <span class="gen-label">起点</span>
        <div class="scope-chips">
          <button class="scope-chip ${state.ideaScope.length === 0 ? 'active' : ''}" data-act="scope-all" aria-pressed="${state.ideaScope.length === 0}">全库（${papers.length} 篇）</button>
          ${papers.map((p) => `<button class="scope-chip ${state.ideaScope.includes(p.id) ? 'active' : ''}" data-act="scope-paper" data-id="${U.esc(p.id)}" aria-pressed="${state.ideaScope.includes(p.id)}"><span class="dot" style="--tc:${U.tagColor((p.tags || [])[0] || '')}"></span>${U.esc(paperLabel(p))}</button>`).join('')}
        </div>
      </div>
      <div class="gen-row">
        <span class="gen-label">数量</span>
        <div class="count-select">
          ${[2, 3, 5].map((n) => `<button class="${state.ideaCount === n ? 'active' : ''}" data-act="idea-count" data-count="${n}" aria-pressed="${state.ideaCount === n}">${n} 条</button>`).join('')}
        </div>
        <span class="push" style="flex:1"></span>
        <span class="faint" style="font-size:10.5px">${state.ideaStrategy === 'mix' ? '混合模式会从多种策略里挑互补的组合' : '当前策略：' + PW.ideas.strategyMeta(state.ideaStrategy).label}</span>
        <button class="btn btn-primary" data-act="generate" ${papers.length < 2 ? 'disabled style="opacity:.5;cursor:not-allowed"' : ''}>${ico('spark')}生成灵感</button>
      </div>
    </section>

    ${generated.length
      ? `<div class="gen-results" id="genResults">${generated.map((i, idx) => renderGeneratedCard(i, idx)).join('')}</div>`
      : `<div class="panel" style="margin-top:16px">${emptyState(
          'spark',
          '还没生成新的灵感',
          papers.length < 2
            ? '至少录入两篇论文，工坊才有材料可以碰撞。'
            : '选一个策略，或者直接点「生成灵感」。每次都会给出不同的组合与切入点。',
          `<button class="btn btn-primary btn-sm" data-act="generate" ${papers.length < 2 ? 'disabled' : ''}>${ico('spark')}试一次</button>`
        )}</div>`}

    <div class="board-wrap">
      <div class="section-head" style="margin-top:30px">
        <div><h2>灵感板</h2><p>拖动卡片改变状态：萌芽 → 探索中 → 已立项，或者先放进暂存。</p></div>
        <span class="faint" style="font-size:11px">${S.data.ideas.length} 条</span>
      </div>
      ${renderIdeasBoard()}
    </div>`;
  }

  /* ------------------------------------------------------------------ *
   * settings
   * ------------------------------------------------------------------ */
  function stageRowHtml(s) {
    return `<div class="stage-row" data-stage-row>
      <input type="hidden" name="stageId" value="${U.esc(s.id)}" />
      <input class="stage-name" name="stageLabel" value="${U.esc(s.label)}" maxlength="20" placeholder="阶段名称" aria-label="阶段名称" />
      <label class="stage-percent"><input name="stagePercent" type="number" min="0" max="100" step="5" value="${s.percent}" aria-label="阶段百分比" /><span>%</span></label>
      <button class="icon-btn danger" type="button" data-act="remove-stage" title="删除这个阶段">${ico('close')}</button>
    </div>`;
  }

  function renderSettings() {
    const d = S.data;
    const st = S.stats();
    const kb = (S.bytes() / 1024).toFixed(1);
    const storage = S.storageInfo();
    const storageLabel =
      storage.mode === 'file' ? '项目文件' : storage.mode === 'checking' ? '确认中' : '未连接';
    const storageDesc =
      storage.mode === 'file'
        ? `论文、关联、灵感和阅读进度会自动写入项目文件夹的 <code>data/paperweave.json</code>；数据不再写入浏览器 localStorage。`
        : storage.mode === 'checking'
          ? '正在连接项目文件，请稍候。'
          : `没有连接到本地文件服务，当前修改只存在内存中，关闭页面就会丢失。请用桌面版或 <code>server.py</code> 启动。`;
    return `<div class="settings-grid">
      <div class="settings-stack">
        <section class="panel settings-card">
          <h3>研究档案</h3>
          <p class="card-desc">这些信息只用于界面称呼与导出文件的抬头，不做任何上传。</p>
          <form id="profileForm">
            <div class="form-grid">
              <div class="field">
                <label for="profName">档案名</label>
                <input id="profName" name="name" value="${U.esc(d.profile.name)}" maxlength="40" placeholder="例如：Robust Lab" />
              </div>
              <div class="field">
                <label for="profField">研究方向</label>
                <input id="profField" name="field" value="${U.esc(d.profile.field)}" maxlength="60" />
              </div>
            </div>
            <div class="button-row" style="margin-top:14px">
              <button class="btn btn-primary btn-sm" type="submit">${ico('check')}保存档案</button>
            </div>
          </form>
        </section>

        <section class="panel settings-card">
          <h3>阅读进度阶段</h3>
          <p class="card-desc">阶段和百分比都由你定义。删除一个阶段时，原先停在它上面的论文会自动落到最接近的阶段。</p>
          <form id="stagesForm">
            <div class="stage-rows" id="stageRows">${stageList().map(stageRowHtml).join('')}</div>
            <div class="button-row" style="margin-top:12px">
              <button class="btn btn-ghost btn-sm" type="button" data-act="add-stage">${ico('plus')}添加阶段</button>
              <button class="btn btn-primary btn-sm" type="submit">${ico('check')}保存阶段</button>
              <button class="btn btn-quiet btn-sm" type="button" data-act="reset-stages">恢复默认</button>
            </div>
          </form>
        </section>

        <section class="panel settings-card">
          <h3>数据概览</h3>
          <p class="card-desc">${storageDesc}</p>
          <div class="data-rows">
            <div class="data-row"><span>论文</span><b>${st.papers} 篇</b></div>
            <div class="data-row"><span>关联</span><b>${st.links} 条</b></div>
            <div class="data-row"><span>灵感</span><b>${st.ideas} 条</b></div>
            <div class="data-row"><span>主题</span><b>${st.tags} 个</b></div>
            <div class="data-row"><span>占用空间</span><b>${kb} KB</b></div>
            <div class="data-row"><span>存储方式</span><b class="${storage.mode === 'file' ? 'ok' : 'bad'}">${storageLabel}</b></div>
            <div class="data-row"><span>数据文件</span><b>${storage.mode === 'file' ? 'data/paperweave.json' : '未连接'}</b></div>
            <div class="data-row"><span>自动保存</span><b class="${storage.mode === 'file' ? 'ok' : 'bad'}">${storage.mode === 'file' ? '已开启' : '未连接'}</b></div>
          </div>
          <div class="button-row">
            ${storage.mode === 'file'
              ? `<button class="btn btn-ghost btn-sm" data-act="flush-file">${ico('check')}立即写入文件</button>`
              : `<button class="btn btn-ghost btn-sm" data-act="retry-file">${ico('upload')}重新连接项目文件</button>`}
            <button class="btn btn-ghost btn-sm" data-act="export-json">${ico('download')}导出 JSON</button>
            <button class="btn btn-ghost btn-sm" data-act="export-md">${ico('download')}导出 Markdown</button>
            <button class="btn btn-ghost btn-sm" data-act="import-json">${ico('upload')}导入 JSON</button>
            <input type="file" id="importFile" accept=".json,application/json" hidden />
          </div>
        </section>

        <section class="panel settings-card danger-zone">
          <h3>危险操作</h3>
          <p class="card-desc">这些操作会覆盖或删除当前数据，且没有云端副本可以恢复。建议先导出 JSON。</p>
          <div class="button-row">
            <button class="btn btn-danger btn-sm" data-act="clear-data">${ico('trash')}清空全部数据</button>
          </div>
        </section>
      </div>

      <div class="settings-stack">
        <section class="panel settings-card">
          <h3>快捷键</h3>
          <p class="card-desc">少用鼠标，多读论文。</p>
          <div class="kbd-list">
            <div><span>搜索论文 / 执行命令</span><kbd>Ctrl / ⌘ + K</kbd></div>
            <div><span>新建论文</span><kbd>Ctrl / ⌘ + N</kbd></div>
            <div><span>回到总览</span><kbd>Ctrl / ⌘ + O</kbd></div>
            <div><span>打开设置</span><kbd>Ctrl / ⌘ + ,</kbd></div>
            <div><span>关闭弹窗</span><kbd>Esc</kbd></div>
          </div>
        </section>

        <section class="panel settings-card">
          <h3>关于 PaperWeave</h3>
          <p class="card-desc">一个本地优先的论文阅读工作台；用 <code>server.py</code> 启动时，数据会写入项目文件夹。</p>
          <div class="about-list">
            <p><b>总结</b>：六段结构化摘要 + 自由批注，粘贴一段笔记也能自动拆成字段。</p>
            <p><b>联系</b>：人工建立五种关系，系统用 TF-IDF 与主题重合度给出推荐。</p>
            <p><b>灵感</b>：六种本地启发式策略，把“局限 / 方法 / 评测”重新组合，并附上原文证据。</p>
            <p><b>隐私</b>：没有账号、没有外部网络请求、没有模型调用；只与这台电脑上的 <code>server.py</code> 通信。</p>
          </div>
        </section>

        <section class="panel settings-card">
          <h3>使用建议</h3>
          <div class="about-list">
            <p>读完一篇论文后，先写“它没解决什么”，再写“它怎么做到的”。局限比贡献更容易长出 idea。</p>
            <p>每周打开一次研究版图，看看有没有两个节点之间还没有线——那条空白往往就是切入点。</p>
            <p>灵感板里的“已立项”不要超过三条；超过就说明需要做减法了。</p>
          </div>
        </section>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------------ *
   * modal helpers
   * ------------------------------------------------------------------ */
  function openModal(html, cls) {
    const root = document.getElementById('modalRoot');
    root.innerHTML = `<div class="modal-overlay ${cls || ''}" data-act="overlay">
      <div class="modal ${cls === 'palette' ? 'palette' : cls === 'wide' ? 'wide' : cls === 'narrow' ? 'narrow' : ''}">${html}</div>
    </div>`;
    const form = root.querySelector('#paperForm');
    if (form) {
      root.querySelector('.modal').dataset.paperMode = form.dataset.mode;
      switchPaperMode(form.dataset.mode);
    }
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const input = root.querySelector('input:not([type=hidden]):not([type=radio]):not([type=file]), textarea');
      if (input) {
        input.focus();
        if (input.select && input.type === 'text') input.select();
      }
    }, 40);
  }

  function closeModal() {
    const root = document.getElementById('modalRoot');
    if (!root.innerHTML) return;
    root.innerHTML = '';
    document.body.style.overflow = '';
    state.pendingConfirm = null;
  }

  function toast(message, kind) {
    const root = document.getElementById('toastRoot');
    const el = document.createElement('div');
    el.className = `toast ${kind || ''}`;
    el.innerHTML = `${ico(kind === 'error' ? 'info' : 'check')}<span>${U.esc(message)}</span>`;
    root.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 220);
    }, 2600);
  }

  function confirmDialog(opts) {
    state.pendingConfirm = opts.onOk;
    openModal(
      `<div class="modal-head">
        <div><h3>${U.esc(opts.title)}</h3></div>
        <button class="icon-btn" data-act="close-modal">${ico('close')}</button>
      </div>
      <div class="modal-body"><p class="confirm-body">${opts.message}</p></div>
      <div class="modal-foot">
        <button class="btn btn-ghost" data-act="close-modal">取消</button>
        <button class="btn ${opts.danger === false ? 'btn-primary' : 'btn-danger'}" data-act="confirm-ok">${U.esc(opts.ok || '确认')}</button>
      </div>`,
      'narrow'
    );
  }

  /* ------------------------------------------------------------------ *
   * paper form
   * ------------------------------------------------------------------ */
  function renderFormStars(value) {
    const box = document.getElementById('formStars');
    if (!box) return;
    const v = Number(value) || 0;
    const hidden = document.getElementById('ratingValue');
    if (hidden) hidden.value = v;
    box.querySelectorAll('button').forEach((b) => b.classList.toggle('on', Number(b.dataset.value) <= v));
    const label = document.getElementById('starVal');
    if (label) label.textContent = v ? `${v} / 5` : '未评分';
  }

  function paperModal(p) {
    const editing = !!p;
    const hasSummary = p && SUMMARY_SECTIONS.some((s) => (p[s.key] || '').trim());
    const mode = editing && hasSummary ? 'read' : 'new';
    const v = (k) => (p ? U.esc(p[k] || '') : '');
    const status = p ? p.status : mode === 'read' ? 'read' : 'unread';
    const stage = p ? stageOf(p).id : mode === 'read' ? stageList()[stageList().length - 1].id : stageList()[0].id;
    const progress = p ? p.progress : mode === 'read' ? 100 : 0;
    return `<div class="modal-head">
      <div>
        <h3 id="paperModalTitle">${editing ? '编辑论文' : '录入一篇论文'}</h3>
        <p id="paperModalSub">${editing ? '修改摘要、批注或阅读进度。' : '先选一种录入方式：还没读，先建档；读过了，直接留下总结。'}</p>
      </div>
      <button class="icon-btn" data-act="close-modal">${ico('close')}</button>
    </div>
    <div class="paper-modes">
      <button class="paper-mode ${mode === 'new' ? 'active' : ''}" type="button" data-act="paper-mode" data-mode="new">
        <span class="pm-ico">${ico('book')}</span>
        <span class="pm-text"><b>新论文 · 还没读</b><small>先加入待读清单，不填总结</small></span>
      </button>
      <button class="paper-mode ${mode === 'read' ? 'active' : ''}" type="button" data-act="paper-mode" data-mode="read">
        <span class="pm-ico">${ico('read')}</span>
        <span class="pm-text"><b>读过的论文 · 添加总结</b><small>录入六段结构化总结，生成联系与灵感</small></span>
      </button>
    </div>
    <div class="tabs paper-tabs" data-mode-only="read">
      <button class="tab active" type="button" data-act="paper-tab" data-tab="structured">结构化填写</button>
      <button class="tab" type="button" data-act="paper-tab" data-tab="paste">粘贴总结，自动解析</button>
    </div>
    <form id="paperForm" data-id="${U.esc(editing ? p.id : '')}" data-mode="${mode}">
      <div class="modal-body">
        <div class="tab-panel" data-panel="structured">
          <div class="form-section">
            <div class="form-section-title">基本信息</div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-title">论文标题<span class="req">*</span></label>
              <input id="f-title" name="title" value="${v('title')}" placeholder="例如：面向动态环境的鲁棒策略学习" maxlength="240" required />
            </div>
            <div class="form-grid">
              <div class="field">
                <label for="f-short">简称</label>
                <input id="f-short" name="short" value="${v('short')}" placeholder="例如：Robust Policy" maxlength="28" />
              </div>
              <div class="field">
                <label for="f-authors">作者</label>
                <input id="f-authors" name="authors" value="${v('authors')}" placeholder="用逗号分隔" />
              </div>
              <div class="field">
                <label for="f-year">年份</label>
                <input id="f-year" name="year" type="number" value="${p && p.year ? p.year : ''}" min="1900" max="2100" placeholder="2025" />
              </div>
              <div class="field">
                <label for="f-venue">出处 / 会议</label>
                <input id="f-venue" name="venue" value="${v('venue')}" placeholder="ICLR 2025" />
              </div>
              <div class="field">
                <label for="f-status">阅读状态 <span class="faint">由阶段决定</span></label>
                <select id="f-status" name="status" disabled title="由阅读阶段自动决定">
                  ${['reading', 'read', 'unread'].map((s) => `<option value="${s}" ${status === s ? 'selected' : ''}>${U.STATUS[s].label}</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <label for="f-tags">标签</label>
                <input id="f-tags" name="tags" value="${p ? U.esc((p.tags || []).join(', ')) : ''}" placeholder="强化学习, 鲁棒性, 优化" />
              </div>
              <div class="field full">
                <label for="f-board">研究板块 <span class="faint">用于研究版图分组</span></label>
                <input id="f-board" name="board" value="${v('board')}" list="boardOptions" placeholder="例如：鲁棒强化学习、机器人导航评测" maxlength="40" />
                <datalist id="boardOptions">${boardList().map((b) => `<option value="${U.esc(b.name)}"></option>`).join('')}</datalist>
              </div>
              <div class="field">
                <label for="f-stage">阅读阶段</label>
                <select id="f-stage" name="stage">${stageOptions(stage)}</select>
                <span class="hint">选择阶段会同步进度与状态。</span>
              </div>
              <div class="field">
                <label for="f-progress">阅读进度 <span class="field-value" id="formProgressVal">${progress}%</span></label>
                <input id="f-progress" name="progress" type="range" min="0" max="100" step="1" value="${progress}" data-input="form-progress" />
              </div>
              <div class="field full">
                <label for="f-url">链接</label>
                <input id="f-url" name="url" value="${v('url')}" placeholder="https://..." />
              </div>
              <div class="field full">
                <label>评分</label>
                <div class="star-input" id="formStars">
                  ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-act="form-rating" data-value="${n}" class="${p && n <= p.rating ? 'on' : ''}">★</button>`).join('')}
                  <span class="star-val" id="starVal">${p && p.rating ? p.rating + ' / 5' : '未评分'}</span>
                  <input type="hidden" name="rating" id="ratingValue" value="${p ? p.rating : 0}" />
                </div>
              </div>
              <div class="field full">
                <label for="f-notes">备注 / 我的批注</label>
                <textarea id="f-notes" name="notes" rows="2" placeholder="为什么想读、读到哪里、初步印象…">${v('notes')}</textarea>
              </div>
            </div>
          </div>

          <div class="paper-new-hint" data-mode-only="new">
            ${ico('info')}
            <div><b>先建档，读完再补总结</b><p>加入后会出现在阅读进度表里。读完后点「编辑论文」，切到「读过的论文」就能补上六段总结。</p></div>
          </div>

          <div class="form-section" data-mode-only="read">
            <div class="form-section-title">结构化总结</div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-problem">研究问题</label>
              <textarea id="f-problem" name="problem" rows="2" placeholder="它试图解决什么问题？为什么重要？">${v('problem')}</textarea>
            </div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-method">方法</label>
              <textarea id="f-method" name="method" rows="3" placeholder="核心机制是什么？关键假设是什么？">${v('method')}</textarea>
            </div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-contributions">贡献</label>
              <textarea id="f-contributions" name="contributions" rows="2" placeholder="它声称的新东西是什么？">${v('contributions')}</textarea>
            </div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-results">结果</label>
              <textarea id="f-results" name="results" rows="2" placeholder="在什么设置下，得到了什么结果？">${v('results')}</textarea>
            </div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-limitations">局限</label>
              <textarea id="f-limitations" name="limitations" rows="2" placeholder="它没有解决什么？哪些假设可能不成立？">${v('limitations')}</textarea>
            </div>
            <div class="field" style="margin-bottom:10px">
              <label for="f-future">未来工作</label>
              <textarea id="f-future" name="future" rows="2" placeholder="作者建议的下一步，或者你认为的下一步。">${v('future')}</textarea>
            </div>
          </div>
        </div>

        <div class="tab-panel" data-panel="paste" data-mode-only="read" hidden>
          <div class="paste-box">
            <p class="paste-hint">${ico('info')}<span>把整段读书笔记粘进来。系统会按「问题 / 方法 / 贡献 / 结果 / 局限 / 未来工作」等小标题切分；没有小标题时，会按句子线索粗略分类。解析后可回到左侧手动修正。</span></p>
            <textarea id="pasteText" placeholder="示例：&#10;研究问题：现有方法对动作噪声很敏感……&#10;方法：在参数空间定义平坦奖励……&#10;局限：只在仿真环境验证……"></textarea>
            <div class="parse-note" id="parseNote">${ico('check')}<span></span></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <button class="btn btn-ghost btn-sm" type="button" data-act="parse-summary">${ico('spark')}解析并填入</button>
              <button class="btn btn-ghost btn-sm" type="button" data-act="load-summary-file">${ico('upload')}导入 .md / .txt</button>
              <input type="file" id="pasteFile" accept=".md,.markdown,.txt,text/plain,text/markdown" hidden />
              <span class="faint" style="font-size:10.5px;align-self:center">只会填入空字段，已有内容不会被覆盖。</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <span class="push"></span>
        <button class="btn btn-ghost" type="button" data-act="close-modal">取消</button>
        <button class="btn btn-primary" type="submit" id="paperSubmitBtn">${editing ? '保存修改' : mode === 'read' ? '保存并打开' : '加入待读'}</button>
      </div>
    </form>`;
  }

  function switchPaperMode(mode) {
    const modal = document.querySelector('.modal');
    const form = document.getElementById('paperForm');
    if (!modal || !form) return;
    modal.dataset.paperMode = mode;
    form.dataset.mode = mode;
    modal.querySelectorAll('[data-mode-only]').forEach((el) => {
      el.hidden = el.dataset.modeOnly !== mode;
    });
    modal.querySelectorAll('.paper-mode').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));

    const editing = !!form.dataset.id;
    const title = document.getElementById('paperModalTitle');
    const sub = document.getElementById('paperModalSub');
    if (title) title.textContent = editing ? '编辑论文' : mode === 'read' ? '录入读过的论文' : '加入一篇待读论文';
    if (sub) {
      sub.textContent = editing
        ? mode === 'read'
          ? '补全结构化总结，或修正阅读进度。'
          : '只维护基本信息，总结可以以后再补。'
        : mode === 'read'
          ? '留下六段总结，系统会用它找联系、生灵感。'
          : '还不需要写总结，先放进阅读进度表。';
    }

    const stages = stageList();
    const status = document.getElementById('f-status');
    const stage = document.getElementById('f-stage');
    const progress = document.getElementById('f-progress');
    const progressLabel = document.getElementById('formProgressVal');
    const submit = document.getElementById('paperSubmitBtn');
    const nextStage = mode === 'read' ? stages[stages.length - 1] : stages[0];
    const nextProgress = nextStage ? nextStage.percent : mode === 'read' ? 100 : 0;
    // 编辑已有论文时切换模式只改表单展示，不覆盖已经记录的状态与进度。
    if (!editing) {
      if (status) status.value = mode === 'read' ? 'read' : 'unread';
      if (stage && nextStage) stage.value = nextStage.id;
      if (progress) progress.value = nextProgress;
      if (progressLabel) progressLabel.textContent = `${nextProgress}%`;
    }
    if (submit) submit.textContent = editing ? '保存修改' : mode === 'read' ? '保存并打开' : '加入待读';
    if (mode === 'new') switchPaperTab('structured');
  }

  function switchPaperTab(tab) {
    document.querySelectorAll('.tab[data-act="paper-tab"]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-panel[data-panel]').forEach((p) => {
      p.hidden = p.dataset.panel !== tab;
    });
    if (tab === 'paste') {
      const t = document.getElementById('pasteText');
      if (t) t.focus();
    }
  }

  function parsePaste() {
    const ta = document.getElementById('pasteText');
    if (!ta || !ta.value.trim()) {
      toast('先把笔记粘贴进来', 'error');
      return;
    }
    const parsed = U.parseSummary(ta.value);
    let filled = 0;
    Object.entries(parsed.fields).forEach(([k, v]) => {
      if (!v) return;
      const el = document.querySelector(`#paperForm [name="${k}"]`);
      if (el && !el.value.trim()) {
        el.value = v;
        filled++;
      }
    });
    const titleEl = document.querySelector('#paperForm [name="title"]');
    if (titleEl && !titleEl.value.trim() && parsed.title) titleEl.value = parsed.title;
    const tagsEl = document.querySelector('#paperForm [name="tags"]');
    if (tagsEl && parsed.tags.length) {
      const existing = U.parseTags(tagsEl.value);
      tagsEl.value = U.parseTags([...existing, ...parsed.tags]).join(', ');
    }
    const note = document.getElementById('parseNote');
    if (note) {
      note.classList.add('show');
      note.querySelector('span').textContent = filled
        ? `已解析 ${filled} 个段落${parsed.title ? '，并识别到标题' : ''}；标签：${parsed.tags.slice(0, 6).join('、') || '无'}。请检查后再保存。`
        : '没有识别到可分类的内容。可以手动填写，或者检查笔记里是否包含“方法 / 局限”等关键词。';
    }
    switchPaperTab('structured');
    toast(filled ? `已填入 ${filled} 个字段` : '没有识别到结构，请手动填写');
  }

  /* ------------------------------------------------------------------ *
   * link modal
   * ------------------------------------------------------------------ */
  function linkModal(sourceId, targetId) {
    const source = paper(sourceId);
    if (!source) return;
    const others = S.data.papers.filter((p) => p.id !== sourceId);
    if (!others.length) {
      toast('至少需要两篇论文才能建立关联', 'error');
      return;
    }
    const target = targetId && others.find((p) => p.id === targetId);
    const guessed = target ? PW.sim.guessRelation(source, target, PW.sim.buildIndex(S.data.papers)) : 'inspiration';
    const options = Object.entries(U.RELATIONS)
      .map(
        ([k, r]) => `<label class="radio-card" style="--rc:${r.color}">
          <input type="radio" name="relation" value="${k}" ${k === guessed ? 'checked' : ''} />
          <span class="rc-body"><b><i></i>${r.label}</b><small>${r.hint}</small></span>
        </label>`
      )
      .join('');
    openModal(`<div class="modal-head">
      <div><h3>建立论文关联</h3><p>从《${U.esc(paperLabel(source))}》出发</p></div>
      <button class="icon-btn" data-act="close-modal">${ico('close')}</button>
    </div>
    <form id="linkForm" data-source="${sourceId}">
      <div class="modal-body">
        <div class="field" style="margin-bottom:14px">
          <label for="l-target">连接到</label>
          ${target
            ? `<input id="l-target" value="${U.esc(target.title)}" disabled /><input type="hidden" name="target" value="${U.esc(target.id)}" />`
            : `<select id="l-target" name="target">${others.map((p) => `<option value="${U.esc(p.id)}">${U.esc(p.title)}</option>`).join('')}</select>`}
        </div>
        <div class="field" style="margin-bottom:12px">
          <label>关系类型</label>
          <div class="radio-cards">${options}</div>
        </div>
        <div class="field">
          <label for="l-note">为什么有关联？（可选）</label>
          <textarea id="l-note" name="note" rows="2" placeholder="一句话写下你的判断，未来回看时很有用。"></textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" type="button" data-act="close-modal">取消</button>
        <button class="btn btn-primary" type="submit">${ico('link')}建立关联</button>
      </div>
    </form>`);
  }

  /* ------------------------------------------------------------------ *
   * idea modal
   * ------------------------------------------------------------------ */
  function ideaModal(id) {
    const idea = S.data.ideas.find((i) => i.id === id);
    if (!idea) return;
    const m = PW.ideas.strategyMeta(idea.strategy);
    const sources = idea.sourceIds.map((sid) => paper(sid)).filter(Boolean);
    openModal(`<div class="modal-head">
      <div>
        ${strategyBadge(idea.strategy)}
        <h3 style="margin-top:7px">${U.esc(idea.title)}</h3>
        <p>${sources.map((p) => U.esc(paperLabel(p))).join(' × ')}</p>
      </div>
      <button class="icon-btn" data-act="close-modal">${ico('close')}</button>
    </div>
    <div class="modal-body">
      <div class="gr-scores" style="--sc:${m.color};margin:0 0 14px">
        ${Object.entries({ 新颖度: idea.scores.novelty, 可行性: idea.scores.feasibility, 影响力: idea.scores.impact })
          .map(([label, v]) => `<span class="score-line">${label} <b>${v}</b><span class="bar"><i style="width:${v}%"></i></span></span>`)
          .join('')}
      </div>
      <p class="gr-hyp" style="--sc:${m.color}">${U.esc(idea.hypothesis)}</p>
      <div class="form-section" style="margin-top:16px">
        <div class="form-section-title">研究问题</div>
        <p class="sum-body" style="font-size:12.5px">${U.esc(idea.problem)}</p>
      </div>
      <div class="form-section">
        <div class="form-section-title">研究路径</div>
        <ol class="approach-list">${(idea.approach || []).map((s) => `<li>${U.esc(s)}</li>`).join('')}</ol>
      </div>
      <div class="form-section">
        <div class="form-section-title">证据链 · ${idea.evidence.length}</div>
        <div class="evidence-list">
          ${idea.evidence
            .map((e) => {
              const p = paper(e.paperId);
              return `<div class="evidence-item">
                <span class="ev-field">${U.esc(e.field)}</span>
                <p>${U.esc(e.quote)}</p>
                <small>${p ? `<a data-act="open-paper" data-id="${U.esc(p.id)}" style="cursor:pointer;text-decoration:underline">${U.esc(p.title)}</a>` : '（论文已移除）'}</small>
              </div>`;
            })
            .join('')}
        </div>
      </div>
      <div class="form-section">
        <div class="form-section-title">我的笔记</div>
        <textarea id="ideaNotes" class="idea-notes" rows="3" placeholder="实验设计、风险、下一步…">${U.esc(idea.notes || '')}</textarea>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-quiet btn-sm" data-act="delete-idea" data-id="${U.esc(idea.id)}">${ico('trash')}删除</button>
      <button class="btn btn-ghost btn-sm" data-act="copy-idea" data-id="${U.esc(idea.id)}">${ico('copy')}复制 Markdown</button>
      <span class="push"></span>
      <select class="status-select" data-change="idea-status" data-id="${U.esc(idea.id)}" style="height:30px;padding:0 6px;border:1px solid var(--line);background:var(--panel);border-radius:6px;font-size:11.5px">
        ${Object.entries(U.IDEA_STATUS).map(([k, v]) => `<option value="${k}" ${idea.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-sm" data-act="save-idea-notes" data-id="${U.esc(idea.id)}">${ico('check')}保存笔记</button>
    </div>`);
  }

  /* ------------------------------------------------------------------ *
   * command palette
   * ------------------------------------------------------------------ */
  function paletteItems(q) {
    const query = q.trim().toLowerCase();
    const items = [];
    const papers = S.data.papers.filter((p) =>
      !query ||
      [p.title, p.short, p.authors, (p.tags || []).join(' ')].join(' ').toLowerCase().includes(query)
    );
    papers.slice(0, 5).forEach((p) =>
      items.push({
        group: '论文',
        id: p.id,
        kind: 'paper',
        title: p.title,
        sub: `${p.venue || '未标注出处'} · ${(p.tags || []).slice(0, 3).join(' / ') || '未分类'}`,
        icon: 'book',
      })
    );
    const commands = [
      { id: 'new', title: '添加一篇论文', sub: '新论文，或直接录入读过的总结', icon: 'plus', key: 'N' },
      { id: 'progress', title: '查看阅读进度', sub: '每篇论文读到哪、下一步做什么', icon: 'progress' },
      { id: 'graph', title: '打开研究版图', sub: '查看论文之间的连接', icon: 'graph' },
      { id: 'ideas', title: '去灵感工坊', sub: '从已有论文生成新问题', icon: 'bulb' },
      { id: 'export', title: '导出 JSON 备份', sub: '把全部数据保存到本地文件', icon: 'download' },
      { id: 'settings', title: '打开设置', sub: '档案、数据与快捷键', icon: 'gear' },
    ].filter((c) => !query || (c.title + ' ' + c.sub).toLowerCase().includes(query));
    commands.forEach((c) => items.push({ ...c, kind: 'command', group: '命令' }));
    return items;
  }

  function paletteListHtml(q) {
    const items = paletteItems(q);
    if (!items.length) return `<div class="palette-empty">没有找到与「${U.esc(q)}」相关的内容</div>`;
    let html = '';
    let group = '';
    items.forEach((it) => {
      if (it.group !== group) {
        group = it.group;
        html += `<div class="palette-group">${group}</div>`;
      }
      html += `<button class="palette-item" data-act="palette-go" data-kind="${it.kind}" data-id="${U.esc(it.id)}">
        <span class="pi-ico">${ico(it.icon)}</span>
        <span class="pi-main"><b>${U.esc(it.title)}</b><small>${U.esc(it.sub)}</small></span>
        ${it.key ? `<span class="pi-key">${it.key}</span>` : ''}
      </button>`;
    });
    return html;
  }

  function openPalette() {
    openModal(
      `<div class="palette-search">${ico('search')}<input type="text" data-input="palette" placeholder="搜索论文，或输入命令…" autocomplete="off" /></div>
      <div class="palette-list" id="paletteList">${paletteListHtml('')}</div>
      <div style="display:flex;justify-content:space-between;padding:8px 14px 10px;border-top:1px solid var(--line);font-size:10px;color:var(--faint)">
        <span>Enter 打开第一项 · Esc 关闭</span><span>${S.data.papers.length} 篇 · ${S.data.ideas.length} 条灵感</span>
      </div>`,
      'palette'
    );
  }

  /* ------------------------------------------------------------------ *
   * render + after render
   * ------------------------------------------------------------------ */
  function render() {
    if (state.graphCtrl) {
      state.graphCtrl.destroy();
      state.graphCtrl = null;
    }
    const route = parseRoute();
    refreshSide();
    setChrome(route);
    markNav(route.name);

    const view = document.getElementById('view');
    let html = '';
    switch (route.name) {
      case 'library':
        html = renderLibrary();
        break;
      case 'progress':
        html = renderProgress();
        break;
      case 'paper':
        html = renderPaper(route.id);
        break;
      case 'graph':
        html = renderGraphPage();
        break;
      case 'ideas':
        html = renderIdeas();
        break;
      case 'settings':
        html = renderSettings();
        break;
      default:
        html = renderOverview();
    }
    view.innerHTML = html;

    if (route.name === 'library') renderLibraryList();
    if (route.name === 'graph') {
      renderGraphSelection(state.graphSel);
      const canvas = document.getElementById('graphCanvas');
      if (canvas) {
        const graphPapers = state.graphBoard === 'all'
          ? S.data.papers
          : S.data.papers.filter((p) => (p.board || '未分组') === state.graphBoard);
        const graphIds = new Set(graphPapers.map((p) => p.id));
        const graphLinks = S.data.links.filter((l) => graphIds.has(l.source) && graphIds.has(l.target));
        state.graphCtrl = PW.graph.mount(canvas, {
          papers: graphPapers,
          links: graphLinks,
          threshold: state.graphThreshold,
          selectedId: state.graphSel,
          boardColors: boardColorMap(),
          grouped: state.graphBoard === 'all' && boardList().length > 1,
          onSelect(id) {
            state.graphSel = id;
            renderGraphSelection(id);
          },
        });
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * actions
   * ------------------------------------------------------------------ */
  function generateIdeas() {
    if (S.data.papers.length < 2) {
      toast('至少需要两篇论文才能生成灵感', 'error');
      return;
    }
    const generated = PW.ideas.generate({
      papers: S.data.papers,
      links: S.data.links,
      strategy: state.ideaStrategy,
      scopeIds: state.ideaScope,
      count: state.ideaCount,
      seed: Date.now(),
    });
    state.generated = generated;
    render();
    if (generated.length) {
      setTimeout(() => {
        const el = document.getElementById('genResults');
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 82;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 80);
      toast(`生成了 ${generated.length} 条灵感`);
    } else {
      toast('这个组合没有产出，换个策略或起点试试', 'error');
    }
  }

  function handlePaperSubmit(form) {
    const fd = new FormData(form);
    const id = form.dataset.id;
    const mode = form.dataset.mode || 'new';
    const title = String(fd.get('title') || '').trim();
    if (!title) {
      toast('标题不能为空', 'error');
      return;
    }
    const stageId = String(fd.get('stage') || '');
    const progress = U.clamp(Number(fd.get('progress')) || 0, 0, 100);
    const tags = U.parseTags(fd.get('tags') || '');
    const board = String(fd.get('board') || '').trim();
    const fields = {
      title,
      short: String(fd.get('short') || '').trim() || U.clip(title, 18),
      authors: String(fd.get('authors') || '').trim(),
      year: Number(fd.get('year')) || 0,
      venue: String(fd.get('venue') || '').trim(),
      status: S.statusForStage(S.stage(stageId), S.stages(), progress),
      rating: Number(fd.get('rating')) || 0,
      tags,
      board,
      url: String(fd.get('url') || '').trim(),
      problem: String(fd.get('problem') || '').trim(),
      method: String(fd.get('method') || '').trim(),
      contributions: String(fd.get('contributions') || '').trim(),
      results: String(fd.get('results') || '').trim(),
      limitations: String(fd.get('limitations') || '').trim(),
      future: String(fd.get('future') || '').trim(),
      notes: String(fd.get('notes') || '').trim(),
      progress,
      stage: stageId,
    };
    if (id) {
      S.updatePaper(id, fields);
      closeModal();
      toast('已保存修改');
      if (parseRoute().name === 'paper' && parseRoute().id === id) render();
      else go(`#/paper/${id}`);
    } else {
      const p = S.addPaper(fields);
      closeModal();
      toast(mode === 'new' ? '已加入待读清单' : '论文与总结已录入');
      go(`#/paper/${p.id}`);
    }
  }

  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      let preview;
      try {
        preview = JSON.parse(text);
      } catch (e) {
        toast('这个文件不是有效的 JSON', 'error');
        return;
      }
      const n = Array.isArray(preview.papers) ? preview.papers.length : 0;
      if (!n) {
        toast('文件里没有论文数据', 'error');
        return;
      }
      confirmDialog({
        title: '导入会覆盖当前数据',
        message: `即将用 <b>${U.esc(file.name)}</b> 中的 <b>${n}</b> 篇论文替换当前档案（现有 ${S.data.papers.length} 篇）。建议先导出一份备份。`,
        ok: '覆盖并导入',
        danger: true,
        onOk() {
          try {
            S.importJSON(text);
            closeModal();
            toast(`已导入 ${S.data.papers.length} 篇论文`);
            go('#/library');
            render();
          } catch (e) {
            toast(e.message || '导入失败', 'error');
          }
        },
      });
    };
    reader.readAsText(file, 'utf-8');
  }

  /* ------------------------------------------------------------------ *
   * events
   * ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'overlay') {
      if (e.target === el) closeModal();
      return;
    }
    if (act === 'close-modal') {
      closeModal();
      return;
    }
    if (act === 'palette') {
      openPalette();
      return;
    }
    if (act === 'new-paper') {
      openModal(paperModal(null), 'wide');
      return;
    }
    if (act === 'edit-paper') {
      const id = el.dataset.id || parseRoute().id;
      const p = paper(id);
      if (p) openModal(paperModal(p), 'wide');
      return;
    }
    if (act === 'delete-paper') {
      const id = el.dataset.id;
      const p = paper(id);
      if (!p) return;
      confirmDialog({
        title: '删除这篇论文？',
        message: `《${U.esc(p.title)}》的摘要、批注、${S.linksOf(id).length} 条关联都会一起删除，相关灵感里的证据也会被移除。这个操作无法撤销。`,
        ok: '删除论文',
        danger: true,
        onOk() {
          S.deletePaper(id);
          closeModal();
          toast('论文已删除');
          go('#/library');
        },
      });
      return;
    }
    if (act === 'open-paper') {
      const id = el.dataset.id;
      closeModal();
      go(`#/paper/${id}`);
      return;
    }
    if (act === 'open-idea') {
      const id = el.dataset.id;
      ideaModal(id);
      return;
    }
    if (act === 'open-idea-for') {
      const id = el.dataset.id;
      state.ideaScope = [id];
      go('#/ideas');
      setTimeout(generateIdeas, 80);
      return;
    }
    if (act === 'set-status') {
      const p = S.paper(el.dataset.id);
      if (!p) return;
      const target = el.dataset.status;
      const stages = S.stages();
      let stage;
      let progress;
      if (target === 'unread') {
        stage = stages[0];
        progress = stage.percent;
      } else if (target === 'read') {
        stage = stages[stages.length - 1];
        progress = stage.percent;
      } else {
        const middle = stages.slice(1, -1);
        if (!middle.length) {
          toast('至少需要三个阅读阶段，才能标记为“在读”', 'error');
          return;
        }
        const current = S.stage(p.stage);
        stage = middle.find((s) => current && s.id === current.id);
        if (!stage) {
          stage = middle.reduce((best, s) => (Math.abs(s.percent - 50) < Math.abs(best.percent - 50) ? s : best), middle[0]);
        }
        progress = stage ? stage.percent : 50;
      }
      S.updatePaper(p.id, { stage: stage ? stage.id : p.stage, progress });
      toast(`已标记为「${U.STATUS[target].label}」`);
      render();
      return;
    }
    if (act === 'set-rating') {
      S.updatePaper(el.dataset.id, { rating: Number(el.dataset.value) });
      render();
      return;
    }
    if (act === 'filter-status') {
      state.status = el.dataset.status;
      document.querySelectorAll('[data-act="filter-status"]').forEach((b) => b.classList.toggle('active', b.dataset.status === state.status));
      renderLibraryList();
      return;
    }
    if (act === 'filter-tag') {
      const tag = el.dataset.tag;
      state.tag = tag || 'all';
      state.status = 'all';
      if (parseRoute().name === 'library') {
        render();
      } else {
        go('#/library');
      }
      return;
    }
    if (act === 'clear-filters') {
      state.q = '';
      state.status = 'all';
      state.tag = 'all';
      render();
      return;
    }
    if (act === 'view-mode') {
      state.view = el.dataset.view;
      render();
      return;
    }
    if (act === 'paper-tab') {
      switchPaperTab(el.dataset.tab);
      return;
    }
    if (act === 'paper-mode') {
      switchPaperMode(el.dataset.mode);
      return;
    }
    if (act === 'parse-summary') {
      parsePaste();
      return;
    }
    if (act === 'load-summary-file') {
      const input = document.getElementById('pasteFile');
      if (input) input.click();
      return;
    }
    if (act === 'form-rating') {
      renderFormStars(el.dataset.value);
      return;
    }
    if (act === 'add-link') {
      linkModal(el.dataset.source);
      return;
    }
    if (act === 'connect') {
      linkModal(el.dataset.source, el.dataset.target);
      return;
    }
    if (act === 'delete-link') {
      S.deleteLink(el.dataset.id);
      toast('关联已移除');
      render();
      return;
    }
    if (act === 'strategy') {
      state.ideaStrategy = el.dataset.id;
      render();
      return;
    }
    if (act === 'scope-all') {
      state.ideaScope = [];
      render();
      return;
    }
    if (act === 'scope-paper') {
      const id = el.dataset.id;
      state.ideaScope = state.ideaScope.includes(id) ? state.ideaScope.filter((x) => x !== id) : [...state.ideaScope, id];
      render();
      return;
    }
    if (act === 'idea-count') {
      state.ideaCount = Number(el.dataset.count) || 3;
      render();
      return;
    }
    if (act === 'generate') {
      generateIdeas();
      return;
    }
    if (act === 'save-generated') {
      const idea = state.generated[Number(el.dataset.idx)];
      if (!idea) return;
      const saved = S.addIdea(idea);
      state.generated.splice(Number(el.dataset.idx), 1);
      toast('已保存到灵感板');
      render();
      setTimeout(() => ideaModal(saved.id), 80);
      return;
    }
    if (act === 'regen-one') {
      const idx = Number(el.dataset.idx);
      const old = state.generated[idx];
      if (!old) return;
      const [next] = PW.ideas.generate({
        papers: S.data.papers,
        links: S.data.links,
        strategy: old.strategy,
        scopeIds: state.ideaScope,
        count: 1,
        seed: Date.now() + idx * 31,
      });
      if (next) {
        state.generated[idx] = next;
        render();
      } else {
        toast('没有更多组合了', 'error');
      }
      return;
    }
    if (act === 'copy-generated') {
      const idea = state.generated[Number(el.dataset.idx)];
      if (idea) {
        U.copyText(S.ideaMarkdown(idea)).then((ok) => toast(ok ? '已复制到剪贴板' : '复制失败', ok ? '' : 'error'));
      }
      return;
    }
    if (act === 'copy-idea') {
      const idea = S.data.ideas.find((i) => i.id === el.dataset.id);
      if (idea) U.copyText(S.ideaMarkdown(idea)).then((ok) => toast(ok ? '已复制到剪贴板' : '复制失败', ok ? '' : 'error'));
      return;
    }
    if (act === 'save-idea-notes') {
      const notes = document.getElementById('ideaNotes');
      S.updateIdea(el.dataset.id, { notes: notes ? notes.value : '' });
      toast('笔记已保存');
      render();
      return;
    }
    if (act === 'delete-idea') {
      const id = el.dataset.id;
      confirmDialog({
        title: '删除这条灵感？',
        message: '删除后不会影响论文本身，但这条灵感与它的笔记会消失。',
        ok: '删除灵感',
        danger: true,
        onOk() {
          S.deleteIdea(id);
          closeModal();
          toast('灵感已删除');
          render();
        },
      });
      return;
    }
    if (act === 'confirm-ok') {
      const fn = state.pendingConfirm;
      state.pendingConfirm = null;
      if (typeof fn === 'function') fn();
      return;
    }
    if (act === 'dismiss-demo') {
      S.data.meta.demoDismissed = true;
      S.save();
      render();
      return;
    }
    if (act === 'graph-board') {
      const board = String(el.dataset.board || 'all');
      if (board !== state.graphBoard) {
        state.graphBoard = board;
        state.graphSel = null;
        render();
      }
      return;
    }
    if (act === 'graph-fit') {
      if (state.graphCtrl) state.graphCtrl.fit();
      return;
    }
    if (act === 'add-stage') {
      const rows = document.getElementById('stageRows');
      if (!rows) return;
      rows.insertAdjacentHTML('beforeend', stageRowHtml({ id: U.uid('st'), label: '新阶段', percent: 50 }));
      const last = rows.lastElementChild;
      if (last) last.querySelector('.stage-name').focus();
      return;
    }
    if (act === 'remove-stage') {
      const row = el.closest('.stage-row');
      const rows = document.getElementById('stageRows');
      if (!row || !rows) return;
      if (rows.querySelectorAll('.stage-row').length <= 2) {
        toast('至少保留两个阶段', 'error');
        return;
      }
      row.remove();
      return;
    }
    if (act === 'reset-stages') {
      confirmDialog({
        title: '恢复默认阶段？',
        message: '当前阶段会被“未开始 / 泛读 / 精读 / 已复现 / 已总结”替换，论文的进度百分比会保留，阶段按最接近的百分比重新对应。',
        ok: '恢复默认',
        onOk() {
          S.saveStages(S.DEFAULT_STAGES.map((s) => ({ ...s })));
          closeModal();
          toast('已恢复默认阶段');
          render();
        },
      });
      return;
    }
    if (act === 'flush-file') {
      S.flushFile().then((ok) => {
        toast(ok ? '已写入 data/paperweave.json' : '写入失败，请检查项目文件夹的写权限', ok ? '' : 'error');
        render();
      });
      return;
    }
    if (act === 'retry-file') {
      S.reconnect().then((mode) => {
        if (mode === 'file') toast('已连接项目文件存储');
        else toast('没有找到本地文件服务，请用 server.py 启动', 'error');
        render();
      });
      return;
    }
    if (act === 'export-json') {
      U.download(`paperweave-${dateStamp()}.json`, S.exportJSON(), 'application/json;charset=utf-8');
      toast('JSON 已导出');
      return;
    }
    if (act === 'export-md') {
      U.download(`paperweave-${dateStamp()}.md`, S.markdown(), 'text/markdown;charset=utf-8');
      toast('Markdown 已导出');
      return;
    }
    if (act === 'import-json') {
      const input = document.getElementById('importFile');
      if (input) input.click();
      return;
    }
    if (act === 'load-demo') {
      confirmDialog({
        title: '载入示例档案？',
        message: '当前档案会被四篇示例论文与示例灵感替换。如果你已经录入过内容，请先导出 JSON。',
        ok: '载入示例',
        danger: true,
        onOk() {
          S.loadDemo();
          closeModal();
          toast('示例档案已载入');
          go('#/overview');
        },
      });
      return;
    }
    if (act === 'clear-data') {
      confirmDialog({
        title: '清空全部数据？',
        message: `这会删除 <b>${S.data.papers.length}</b> 篇论文、<b>${S.data.links.length}</b> 条关联和 <b>${S.data.ideas.length}</b> 条灵感。没有云端备份，无法恢复。`,
        ok: '全部清空',
        danger: true,
        onOk() {
          S.clear();
          closeModal();
          toast('已清空');
          go('#/overview');
        },
      });
      return;
    }
    if (act === 'palette-go') {
      const kind = el.dataset.kind;
      const id = el.dataset.id;
      closeModal();
      if (kind === 'paper') {
        go(`#/paper/${id}`);
      } else if (id === 'new') {
        openModal(paperModal(null), 'wide');
      } else if (id === 'graph') {
        go('#/graph');
      } else if (id === 'progress') {
        go('#/progress');
      } else if (id === 'ideas') {
        go('#/ideas');
      } else if (id === 'settings') {
        go('#/settings');
      } else if (id === 'export') {
        U.download(`paperweave-${dateStamp()}.json`, S.exportJSON(), 'application/json;charset=utf-8');
        toast('JSON 已导出');
      }
      return;
    }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.input === 'lib-search') {
      state.q = el.value;
      renderLibraryList();
      return;
    }
    if (el.dataset.input === 'form-progress') {
      const out = document.getElementById('formProgressVal');
      const value = U.clamp(Number(el.value) || 0, 0, 100);
      if (out) out.textContent = `${value}%`;
      return;
    }
    if (el.dataset.input === 'paper-progress') {
      const p = S.paper(el.dataset.id);
      if (!p) return;
      const value = U.clamp(Number(el.value) || 0, 0, 100);
      p.progress = value;
      p.updatedAt = new Date().toISOString();
      S.save();
      const row = el.closest('tr');
      if (row) {
        const bar = row.querySelector('.pt-bar i');
        const pct = row.querySelector('.pt-pct');
        if (bar) bar.style.width = `${value}%`;
        if (pct) pct.textContent = `${value}%`;
      }
      return;
    }
    if (el.dataset.input === 'graph-threshold') {
      state.graphThreshold = Number(el.value) / 100;
      const out = document.getElementById('thrOut');
      if (out) out.textContent = `${el.value}%`;
      if (state.graphCtrl) state.graphCtrl.setThreshold(state.graphThreshold);
      return;
    }
    if (el.dataset.input === 'palette') {
      const list = document.getElementById('paletteList');
      if (list) list.innerHTML = paletteListHtml(el.value);
      return;
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.id === 'f-stage') {
      const stage = S.stage(el.value);
      if (!stage) return;
      const progress = document.getElementById('f-progress');
      if (progress) progress.value = stage.percent;
      const out = document.getElementById('formProgressVal');
      if (out) out.textContent = `${stage.percent}%`;
      const status = document.getElementById('f-status');
      if (status) status.value = S.statusForStage(stage, S.stages(), stage.percent);
      return;
    }
    if (el.dataset.change === 'paper-stage') {
      const stage = S.stage(el.value);
      if (!stage) return;
      S.updatePaper(el.dataset.id, { stage: stage.id, progress: stage.percent });
      toast(`阶段更新为「${stage.label}」`);
      render();
      return;
    }
    if (el.dataset.change === 'paper-progress-note') {
      S.updatePaper(el.dataset.id, { progressNote: el.value.trim() });
      return;
    }
    if (el.dataset.change === 'idea-status') {
      S.updateIdea(el.dataset.id, { status: el.value });
      toast(`已移动到「${(U.IDEA_STATUS[el.value] || {}).label || el.value}」`);
      render();
      return;
    }
    if (el.id === 'pasteFile') {
      const file = el.files && el.files[0];
      el.value = '';
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        toast('文件太大了，请导入 2 MB 以内的 Markdown 或文本', 'error');
        return;
      }
      file
        .text()
        .then((text) => {
          const ta = document.getElementById('pasteText');
          if (!ta) return;
          ta.value = text.trim();
          ta.focus();
          parsePaste();
        })
        .catch(() => toast('读取文件失败，请换一个文件试试', 'error'));
      return;
    }
    if (el.id === 'importFile') {
      const file = el.files && el.files[0];
      el.value = '';
      importFile(file);
      return;
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'stagesForm') {
      e.preventDefault();
      const rows = Array.from(e.target.querySelectorAll('[data-stage-row]'));
      const stages = rows
        .map((row, i) => {
          const label = row.querySelector('[name=stageLabel]').value.trim();
          const percent = U.clamp(Number(row.querySelector('[name=stagePercent]').value) || 0, 0, 100);
          return {
            id: row.querySelector('[name=stageId]').value || U.uid('st'),
            label,
            percent,
            order: i,
          };
        })
        .filter((s) => s.label);
      if (stages.length < 2) {
        toast('至少需要两个有名称的阶段', 'error');
        return;
      }
      S.saveStages(stages);
      render();
      toast('阅读阶段已保存');
      return;
    }
    if (e.target.id === 'paperForm') {
      e.preventDefault();
      handlePaperSubmit(e.target);
      return;
    }
    if (e.target.id === 'linkForm') {
      e.preventDefault();
      const form = e.target;
      const fd = new FormData(form);
      const source = form.dataset.source;
      const target = String(fd.get('target') || '');
      const type = String(fd.get('relation') || 'inspiration');
      const note = String(fd.get('note') || '').trim();
      if (!target) {
        toast('请选择要连接的论文', 'error');
        return;
      }
      if (S.linkBetween(source, target)) {
        toast('这两篇论文已经有关联了', 'error');
        return;
      }
      const link = S.addLink(source, target, type, note);
      if (!link) {
        toast('建立关联失败', 'error');
        return;
      }
      closeModal();
      toast(`已建立「${(U.RELATIONS[type] || {}).label || ''}」关联`);
      render();
      return;
    }
    if (e.target.id === 'profileForm') {
      e.preventDefault();
      const fd = new FormData(e.target);
      S.data.profile.name = String(fd.get('name') || '').trim() || '我的研究档案';
      S.data.profile.field = String(fd.get('field') || '').trim() || '——';
      S.save();
      refreshSide();
      toast('档案已更新');
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    const key = (e.key || '').toLowerCase();
    if (mod && !e.altKey) {
      if (key === 'k') {
        e.preventDefault();
        openPalette();
        return;
      }
      const hasModal = !!document.getElementById('modalRoot').innerHTML;
      if (key === 'n' && !hasModal) {
        e.preventDefault();
        openModal(paperModal(null), 'wide');
        return;
      }
      if (key === 'o' && !hasModal) {
        e.preventDefault();
        go('#/overview');
        return;
      }
      if ((key === ',' || e.code === 'Comma') && !hasModal) {
        e.preventDefault();
        go('#/settings');
        return;
      }
    }
    if (e.key === 'Escape') {
      const root = document.getElementById('modalRoot');
      if (root.innerHTML) {
        e.preventDefault();
        closeModal();
      }
      return;
    }
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.input === 'palette') {
      const first = document.querySelector('.palette-item');
      if (first) {
        e.preventDefault();
        first.click();
      }
      return;
    }
  });

  /* drag & drop for the idea board */
  let dragIdeaId = null;
  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.idea-card');
    if (!card) return;
    dragIdeaId = card.dataset.id;
    card.classList.add('dragging');
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragIdeaId);
    }
  });
  document.addEventListener('dragend', (e) => {
    const card = e.target.closest('.idea-card');
    if (card) card.classList.remove('dragging');
    document.querySelectorAll('.board-col').forEach((c) => c.classList.remove('drag-over'));
    dragIdeaId = null;
  });
  document.addEventListener('dragover', (e) => {
    const col = e.target.closest('.board-col');
    if (!col || !dragIdeaId) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.board-col').forEach((c) => c.classList.toggle('drag-over', c === col));
  });
  document.addEventListener('drop', (e) => {
    const col = e.target.closest('.board-col');
    if (!col || !dragIdeaId) return;
    e.preventDefault();
    const id = dragIdeaId;
    const status = col.dataset.status;
    S.updateIdea(id, { status });
    dragIdeaId = null;
    toast(`已移动到「${(U.IDEA_STATUS[status] || {}).label || status}」`);
    render();
  });

  window.addEventListener('hashchange', () => {
    closeModal();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

  /* ------------------------------------------------------------------ *
   * boot
   * ------------------------------------------------------------------ */
  document.querySelectorAll('[data-ico]').forEach((el) => {
    el.innerHTML = svgIcon(el.dataset.ico);
  });

  if (!location.hash) {
    history.replaceState(null, '', '#/overview');
  }
  render();
  renderFormStars(0);

  window.addEventListener('pw-storage', updateStorageNote);
  window.addEventListener('pagehide', () => {
    if (S.storage === 'file') S.flushFile();
  });

  S.initFile().then(() => {
    updateStorageNote();
    refreshSide();
    render();
  });
})();
