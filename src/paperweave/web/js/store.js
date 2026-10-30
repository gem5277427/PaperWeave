/* PaperWeave — local-first data store */
(function () {
  const PW = (window.PW = window.PW || {});
  const U = PW.util;
  const KEY = 'paperweave.v1';

  const STATUSES = ['read', 'reading', 'unread'];

  const DEFAULT_STAGES = [
    { id: 'todo', label: '未开始', percent: 0 },
    { id: 'skim', label: '泛读', percent: 20 },
    { id: 'deep', label: '精读', percent: 50 },
    { id: 'repro', label: '已复现', percent: 80 },
    { id: 'done', label: '已总结', percent: 100 },
  ];

  function freshStages() {
    return DEFAULT_STAGES.map((s) => ({ ...s }));
  }

  // Imported IDs end up in DOM attributes; keep them to a safe, stable alphabet.
  function cleanId(value, fallback) {
    const id = String(value == null ? '' : value)
      .trim()
      .replace(/[^A-Za-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return id || fallback;
  }

  function uniqueId(base, used) {
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  }

  function sanitizeStage(raw, idx) {
    const s = raw && typeof raw === 'object' ? raw : {};
    return {
      id: cleanId(s.id, `st-${idx}-${Date.now().toString(36)}`),
      label: String(s.label || '').trim().slice(0, 20) || `阶段 ${idx + 1}`,
      percent: U.clamp(Number(s.percent) || 0, 0, 100),
    };
  }

  function normalizeStages(list) {
    if (!Array.isArray(list) || !list.length) return freshStages();
    const seen = new Set();
    const out = list.map(sanitizeStage).map((s, i) => {
      let id = s.id;
      while (seen.has(id)) id = `${s.id}-${i}`;
      seen.add(id);
      return { ...s, id };
    });
    out.sort((a, b) => a.percent - b.percent);
    return out.length ? out : freshStages();
  }

  function stageForProgress(progress, stages) {
    const list = stages && stages.length ? stages : DEFAULT_STAGES;
    const sorted = list.slice().sort((a, b) => a.percent - b.percent);
    let found = sorted[0];
    sorted.forEach((s) => {
      if (progress >= s.percent) found = s;
    });
    return found;
  }

  function statusForProgress(progress) {
    const pct = U.clamp(Number(progress) || 0, 0, 100);
    if (pct <= 0) return 'unread';
    if (pct >= 100) return 'read';
    return 'reading';
  }

  function statusForStage(stage, stages, progress) {
    const list = (stages && stages.length ? stages : DEFAULT_STAGES).slice().sort((a, b) => a.percent - b.percent);
    if (stage && stage.id) {
      const idx = list.findIndex((s) => s.id === stage.id);
      if (idx === 0) return 'unread';
      if (idx === list.length - 1) return 'read';
      return 'reading';
    }
    return statusForProgress(progress);
  }

  function emptyData() {
    return {
      version: 1,
      meta: { demo: false, demoDismissed: false, createdAt: new Date().toISOString() },
      profile: { name: '我的研究档案', field: '——', progressStages: freshStages() },
      papers: [],
      links: [],
      ideas: [],
    };
  }

  function defaultBoard(tags) {
    const set = new Set(tags || []);
    if (set.has('机器人导航') || set.has('基准测试') || set.has('评测')) return '机器人导航评测';
    if (set.has('强化学习') || set.has('可塑性') || set.has('平坦极小值') || set.has('鲁棒性')) return '鲁棒强化学习';
    return '未分组';
  }

  function sanitizePaper(raw, idx) {
    const p = raw && typeof raw === 'object' ? raw : {};
    const tags = U.parseTags(p.tags || []);
    const status = STATUSES.includes(p.status) ? p.status : 'unread';
    const hasProgress = p.progress !== undefined && p.progress !== null && p.progress !== '';
    const progress = hasProgress
      ? U.clamp(Number(p.progress) || 0, 0, 100)
      : status === 'read'
        ? 100
        : status === 'reading'
          ? 40
          : 0;
    return {
      id: cleanId(p.id, `p-import-${Date.now().toString(36)}-${idx}`),
      title: String(p.title || '').trim() || '未命名论文',
      short: String(p.short || p.title || '').slice(0, 18),
      authors: String(p.authors || '').trim(),
      year: Number(p.year) || 0,
      venue: String(p.venue || '').trim(),
      status: statusForProgress(progress),
      rating: U.clamp(Number(p.rating) || 0, 0, 5),
      tags,
      board: String(p.board || '').trim() || defaultBoard(tags),
      problem: String(p.problem || ''),
      method: String(p.method || ''),
      contributions: String(p.contributions || ''),
      results: String(p.results || ''),
      limitations: String(p.limitations || ''),
      future: String(p.future || ''),
      notes: String(p.notes || ''),
      progress,
      stage: String(p.stage || ''),
      progressNote: String(p.progressNote || ''),
      url: U.safeUrl(p.url),
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    };
  }

  function sanitizeIdea(raw, idx) {
    const i = raw && typeof raw === 'object' ? raw : {};
    const scores = i.scores || {};
    return {
      id: cleanId(i.id, `i-import-${Date.now().toString(36)}-${idx}`),
      strategy: String(i.strategy || 'gap'),
      title: String(i.title || '未命名灵感'),
      hypothesis: String(i.hypothesis || ''),
      problem: String(i.problem || ''),
      approach: Array.isArray(i.approach) ? i.approach.map(String) : [],
      evidence: Array.isArray(i.evidence) ? i.evidence.map((e) => ({
        paperId: String(e.paperId || ''),
        field: String(e.field || ''),
        quote: String(e.quote || ''),
      })) : [],
      scores: {
        novelty: U.clamp(Number(scores.novelty) || 60, 0, 100),
        feasibility: U.clamp(Number(scores.feasibility) || 60, 0, 100),
        impact: U.clamp(Number(scores.impact) || 60, 0, 100),
      },
      sourceIds: Array.isArray(i.sourceIds) ? i.sourceIds.map(String) : [],
      status: ['seed', 'exploring', 'project', 'parked'].includes(i.status) ? i.status : 'seed',
      notes: String(i.notes || ''),
      createdAt: i.createdAt || new Date().toISOString(),
      updatedAt: i.updatedAt || new Date().toISOString(),
    };
  }

  const API_PATH = '/api/data';
  const API_HEADERS = { 'Content-Type': 'application/json', 'X-PaperWeave': '1' };

  const store = {
    data: emptyData(),
    storage: 'checking',
    remoteReady: false,
    fileSavedAt: '',
    saveTimer: null,
    dirty: false,
    legacyRead: false,

    init() {
      this.storage = 'checking';
      this.data = this.normalize(PW.seed.data());
    },

    normalize(raw) {
      const d = emptyData();
      if (!raw || typeof raw !== 'object') return d;
      d.version = 1;
      d.meta = Object.assign(d.meta, raw.meta || {});
      d.profile = Object.assign(d.profile, raw.profile || {});
      d.profile.progressStages = normalizeStages(d.profile.progressStages);
      const paperIds = new Map();
      const usedPaperIds = new Set();
      d.papers = (Array.isArray(raw.papers) ? raw.papers : []).map((rawPaper, idx) => {
        const p = sanitizePaper(rawPaper, idx);
        const originalId = rawPaper && rawPaper.id != null ? String(rawPaper.id) : '';
        p.id = uniqueId(p.id, usedPaperIds);
        if (originalId) paperIds.set(originalId, p.id);
        paperIds.set(p.id, p.id);
        return p;
      });
      const stageIds = new Set(d.profile.progressStages.map((s) => s.id));
      d.papers.forEach((p) => {
        if (!stageIds.has(p.stage)) p.stage = stageForProgress(p.progress, d.profile.progressStages).id;
        const stage = d.profile.progressStages.find((s) => s.id === p.stage) || null;
        p.status = statusForStage(stage, d.profile.progressStages, p.progress);
      });
      const usedLinkIds = new Set();
      d.links = (Array.isArray(raw.links) ? raw.links : [])
        .map((l, i) => {
          if (!l) return null;
          const source = paperIds.get(String(l.source));
          const target = paperIds.get(String(l.target));
          if (!source || !target || source === target) return null;
          return {
            id: uniqueId(cleanId(l.id, `l-import-${i}`), usedLinkIds),
            source,
            target,
            type: U.RELATIONS[l.type] ? l.type : 'inspiration',
            note: String(l.note || ''),
            createdAt: l.createdAt || new Date().toISOString(),
          };
        })
        .filter(Boolean);
      const usedIdeaIds = new Set();
      d.ideas = (Array.isArray(raw.ideas) ? raw.ideas : []).map((rawIdea, idx) => {
        const idea = sanitizeIdea(rawIdea, idx);
        idea.id = uniqueId(idea.id, usedIdeaIds);
        idea.sourceIds = Array.from(new Set(idea.sourceIds.map((id) => paperIds.get(String(id))).filter(Boolean)));
        idea.evidence = idea.evidence.map((e) => ({
          ...e,
          paperId: paperIds.get(String(e.paperId)) || '',
        }));
        return idea;
      });
      return d;
    },

    readLegacy() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.papers) && parsed.papers.length) return parsed;
      } catch (e) {
        console.warn('PaperWeave: could not read legacy browser data.', e);
      }
      return null;
    },

    clearLegacy() {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {
        /* localStorage can be unavailable in hardened browsers. */
      }
    },

    save() {
      if (!this.data.meta) this.data.meta = {};
      this.data.meta.savedAt = new Date().toISOString();
      this.dirty = true;
      if (this.storage === 'file' && this.remoteReady) {
        this.queueRemote();
      } else {
        this.emitStorage();
      }
    },

    emitStorage() {
      try {
        window.dispatchEvent(new CustomEvent('pw-storage', { detail: this.storageInfo() }));
      } catch (e) {
        /* CustomEvent is available in every supported browser. */
      }
    },

    async initFile() {
      if (!/^https?:$/.test(location.protocol)) {
        this.storage = 'offline';
        this.remoteReady = false;
        this.emitStorage();
        return 'offline';
      }
      this.storage = 'checking';
      try {
        const res = await fetch(API_PATH, {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        if (res.status === 200) {
          const text = await res.text();
          const parsed = JSON.parse(text);
          if (!parsed || !Array.isArray(parsed.papers)) throw new Error('remote data is malformed');
          this.data = this.normalize(parsed);
          this.storage = 'file';
          this.remoteReady = true;
          this.fileSavedAt = this.data.meta.savedAt || new Date().toISOString();
          this.dirty = false;
          this.clearLegacy();
          this.emitStorage();
          return 'file';
        }
        if (res.status === 204 || res.status === 404) {
          // No project file yet: import legacy browser data once, then delete it.
          if (!this.legacyRead) {
            this.legacyRead = true;
            const legacy = this.readLegacy();
            if (legacy) this.data = this.normalize(legacy);
          }
          this.storage = 'file';
          this.remoteReady = true;
          const ok = await this.pushFile();
          if (ok) {
            this.clearLegacy();
            this.dirty = false;
          } else {
            this.storage = 'offline';
            this.remoteReady = false;
          }
          this.emitStorage();
          return this.storage;
        }
        throw new Error(`HTTP ${res.status}`);
      } catch (e) {
        console.warn('PaperWeave: project file unavailable; changes will not be persisted.', e);
        this.storage = 'offline';
        this.remoteReady = false;
        this.emitStorage();
        return 'offline';
      }
    },

    queueRemote() {
      if (!this.remoteReady || this.storage !== 'file') return;
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.pushFile(), 250);
    },

    async pushFile() {
      if (!this.remoteReady) return false;
      try {
        const res = await fetch(API_PATH, {
          method: 'PUT',
          headers: API_HEADERS,
          body: JSON.stringify(this.data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.storage = 'file';
        this.dirty = false;
        this.fileSavedAt = new Date().toISOString();
        this.emitStorage();
        return true;
      } catch (e) {
        console.warn('PaperWeave: could not write data file; changes remain in memory only.', e);
        this.storage = 'offline';
        this.remoteReady = false;
        this.emitStorage();
        return false;
      }
    },

    async flushFile() {
      if (!this.remoteReady) return false;
      clearTimeout(this.saveTimer);
      return this.pushFile();
    },

    async reconnect() {
      // If there are unsaved in-memory edits, write them before loading an older file.
      if (this.dirty && this.data) {
        this.storage = 'file';
        this.remoteReady = true;
        const ok = await this.pushFile();
        if (ok) {
          this.clearLegacy();
          return 'file';
        }
        return 'offline';
      }
      return this.initFile();
    },

    storageInfo() {
      return {
        mode: this.storage,
        ready: this.remoteReady,
        file: 'data/paperweave.json',
        savedAt: this.fileSavedAt || (this.data.meta && this.data.meta.savedAt) || '',
        dirty: this.dirty,
      };
    },

    paper(id) {
      return this.data.papers.find((p) => p.id === id) || null;
    },

    stages() {
      return this.data.profile.progressStages && this.data.profile.progressStages.length
        ? this.data.profile.progressStages
        : DEFAULT_STAGES;
    },

    stage(id) {
      return this.stages().find((s) => s.id === id) || null;
    },

    saveStages(list) {
      const stages = normalizeStages(list);
      const ids = new Set(stages.map((s) => s.id));
      this.data.profile.progressStages = stages;
      this.data.papers.forEach((p) => {
        if (p.stage && !ids.has(p.stage)) {
          p.stage = stageForProgress(Number(p.progress) || 0, stages).id;
        }
        p.status = statusForStage(this.stage(p.stage), stages, p.progress);
      });
      this.save();
      return stages;
    },

    addPaper(fields) {
      const now = new Date().toISOString();
      const p = sanitizePaper({ ...fields, id: U.uid('p'), createdAt: now, updatedAt: now }, 0);
      if (!this.stage(p.stage)) p.stage = stageForProgress(p.progress, this.stages()).id;
      p.status = statusForStage(this.stage(p.stage), this.stages(), p.progress);
      this.data.papers.unshift(p);
      this.save();
      return p;
    },

    updatePaper(id, patch) {
      const p = this.paper(id);
      if (!p) return null;
      Object.assign(p, patch, { updatedAt: new Date().toISOString() });
      if (patch.tags) p.tags = U.parseTags(patch.tags);
      if (patch.board !== undefined) p.board = String(patch.board || '').trim() || defaultBoard(p.tags);
      if (patch.stage !== undefined) {
        p.stage = String(patch.stage || '');
        if (!this.stage(p.stage)) p.stage = stageForProgress(Number(p.progress) || 0, this.stages()).id;
      }
      if (patch.progress !== undefined) {
        p.progress = U.clamp(Number(patch.progress) || 0, 0, 100);
      } else if (patch.stage !== undefined) {
        const stage = this.stage(p.stage);
        if (stage) p.progress = stage.percent;
      }
      p.status = statusForStage(this.stage(p.stage), this.stages(), p.progress);
      this.save();
      return p;
    },

    deletePaper(id) {
      this.data.papers = this.data.papers.filter((p) => p.id !== id);
      this.data.links = this.data.links.filter((l) => l.source !== id && l.target !== id);
      this.data.ideas.forEach((idea) => {
        idea.sourceIds = (idea.sourceIds || []).filter((sid) => sid !== id);
        idea.evidence = (idea.evidence || []).filter((e) => e.paperId !== id);
      });
      this.save();
    },

    linksOf(id) {
      return this.data.links.filter((l) => l.source === id || l.target === id);
    },

    linkBetween(a, b) {
      return this.data.links.find(
        (l) => (l.source === a && l.target === b) || (l.source === b && l.target === a)
      );
    },

    addLink(source, target, type, note = '') {
      if (!source || !target || source === target) return null;
      if (this.linkBetween(source, target)) return null;
      if (!this.paper(source) || !this.paper(target)) return null;
      const link = {
        id: U.uid('l'),
        source,
        target,
        type: U.RELATIONS[type] ? type : 'inspiration',
        note: String(note || ''),
        createdAt: new Date().toISOString(),
      };
      this.data.links.unshift(link);
      this.save();
      return link;
    },

    deleteLink(id) {
      this.data.links = this.data.links.filter((l) => l.id !== id);
      this.save();
    },

    ideasFor(paperId) {
      return this.data.ideas.filter((i) => (i.sourceIds || []).includes(paperId));
    },

    addIdea(idea) {
      const now = new Date().toISOString();
      const i = sanitizeIdea({ ...idea, id: U.uid('i'), createdAt: now, updatedAt: now }, 0);
      this.data.ideas.unshift(i);
      this.save();
      return i;
    },

    updateIdea(id, patch) {
      const i = this.data.ideas.find((x) => x.id === id);
      if (!i) return null;
      Object.assign(i, patch, { updatedAt: new Date().toISOString() });
      this.save();
      return i;
    },

    deleteIdea(id) {
      this.data.ideas = this.data.ideas.filter((i) => i.id !== id);
      this.save();
    },

    stats() {
      const papers = this.data.papers;
      const tagSet = new Set();
      papers.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
      const weekAgo = Date.now() - 7 * 864e5;
      return {
        papers: papers.length,
        read: papers.filter((p) => p.status === 'read').length,
        reading: papers.filter((p) => p.status === 'reading').length,
        unread: papers.filter((p) => p.status === 'unread').length,
        tags: tagSet.size,
        links: this.data.links.length,
        ideas: this.data.ideas.length,
        weekNew: papers.filter((p) => new Date(p.createdAt).getTime() >= weekAgo).length,
      };
    },

    tagStats() {
      const map = new Map();
      this.data.papers.forEach((p) => {
        p.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1));
      });
      return Array.from(map.entries())
        .map(([tag, count]) => ({ tag, count, color: U.tagColor(tag) }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    },

    allTags() {
      return Array.from(new Set(this.data.papers.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b, 'zh'));
    },

    recent(n = 4) {
      return [...this.data.papers]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, n);
    },

    bytes() {
      try {
        return new Blob([JSON.stringify(this.data)]).size;
      } catch (e) {
        return JSON.stringify(this.data).length;
      }
    },

    exportJSON() {
      return JSON.stringify({ ...this.data, exportedAt: new Date().toISOString() }, null, 2);
    },

    importJSON(text) {
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.papers)) throw new Error('文件里没有找到 papers 数组');
      const next = this.normalize(parsed);
      if (!next.papers.length) throw new Error('文件里没有有效的论文记录');
      this.data = next;
      this.save();
      return next;
    },

    clear() {
      this.data = emptyData();
      this.data.meta.demo = false;
      this.save();
    },

    loadDemo() {
      this.data = this.normalize(PW.seed.data());
      this.save();
    },

    ideaMarkdown(idea) {
      const papers = this.data.papers;
      const ev = (idea.evidence || [])
        .map((e) => {
          const p = papers.find((x) => x.id === e.paperId);
          const label = p ? p.title : '（论文已移除）';
          return `- 《${label}》 · ${e.field}：${e.quote}`;
        })
        .join('\n');
      return `## ${idea.title}\n\n> ${idea.hypothesis}\n\n**研究问题**：${idea.problem}\n\n**研究路径**\n${(idea.approach || [])
        .map((s, i) => `${i + 1}. ${s}`)
        .join('\n')}\n\n**证据链**\n${ev || '—'}\n`;
    },

    markdown() {
      const papers = this.data.papers
        .map((p) => {
          const tags = p.tags.map((t) => `  - ${t}`).join('\n');
          return `---
title: ${p.title}
authors: ${p.authors || ''}
year: ${p.year || ''}
venue: ${p.venue || ''}
status: ${p.status}
progress: ${p.progress}%
stage: ${(this.stage(p.stage) || {}).label || ''}
tags:
${tags || '  - 未分类'}
---

# ${p.title}

${U.summaryBody(p)}
`;
        })
        .join('\n---\n\n');
      const ideas = this.data.ideas.map((i) => this.ideaMarkdown(i)).join('\n');
      return `# PaperWeave · 论文与灵感备份\n\n导出时间：${new Date().toLocaleString('zh-CN')}\n\n${papers}\n\n# 灵感板\n\n${ideas}`;
    },
  };

  PW.store = store;
  store.DEFAULT_STAGES = DEFAULT_STAGES;
  store.statusForProgress = statusForProgress;
  store.statusForStage = statusForStage;
})();
