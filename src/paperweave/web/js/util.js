/* PaperWeave — shared helpers, formatting, and the summary parser */
(function () {
  const PW = (window.PW = window.PW || {});
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ESC[c]);
  const uid = (prefix = 'id') =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  function stripMd(v) {
    return String(v || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`>#|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function clip(v, max = 80, tail = '…') {
    const s = stripMd(v);
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const stops = ['。', '；', '，', '、', ' ', '.', ',', ';'];
    let best = -1;
    for (const ch of stops) best = Math.max(best, cut.lastIndexOf(ch));
    if (best > max * 0.55) return cut.slice(0, best).replace(/[，,、；;\s]+$/, '') + tail;
    return cut.replace(/\s+\S*$/, '') + tail;
  }

  function sentences(v) {
    return stripMd(v)
      .split(/(?<=[。！？；])\s*|\n+|(?<=[a-z])\.\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function firstSentence(v, max = 110) {
    const arr = sentences(v);
    return clip(arr[0] || '', max);
  }

  function parseTags(input) {
    const raw = Array.isArray(input) ? input : String(input || '').split(/[,，、;；|]+/);
    const seen = new Set();
    const out = [];
    raw.forEach((t) => {
      const tag = String(t).replace(/^#/, '').trim();
      const key = tag.toLowerCase();
      if (tag && tag.length <= 24 && !seen.has(key)) {
        seen.add(key);
        out.push(tag);
      }
    });
    return out.slice(0, 12);
  }

  const STATUS = {
    read: { label: '已读', cls: 'read' },
    reading: { label: '在读', cls: 'reading' },
    unread: { label: '待读', cls: 'unread' },
  };

  const IDEA_STATUS = {
    seed: { label: '萌芽', cls: 'seed' },
    exploring: { label: '探索中', cls: 'exploring' },
    project: { label: '已立项', cls: 'project' },
    parked: { label: '暂存', cls: 'parked' },
  };

  const RELATIONS = {
    extends: { label: '推进', hint: '源论文在目标论文的基础上向前一步', color: '#2F6B5F', directed: true },
    method: { label: '方法同源', hint: '共享同一套方法、优化器或理论工具', color: '#35577D', directed: false },
    applies: { label: '应用验证', hint: '源论文把目标论文的方法/理论用到新场景', color: '#A9762A', directed: true },
    contrast: { label: '观点张力', hint: '结论、假设或路线存在可对话的冲突', color: '#B33A2B', directed: false },
    inspiration: { label: '灵感关联', hint: '尚未形成方法关系，但值得放在一起想', color: '#6B4E8E', directed: false },
  };

  const TAG_COLOR_MAP = {
    强化学习: '#2F6B5F',
    RL: '#2F6B5F',
    鲁棒性: '#B33A2B',
    泛化: '#35577D',
    平坦极小值: '#6B4E8E',
    锐度感知: '#6B4E8E',
    优化: '#A9762A',
    机器人导航: '#3D6B4F',
    基准测试: '#A34C6B',
    评测: '#A34C6B',
    可塑性: '#2F6B5F',
    样本效率: '#35577D',
    策略优化: '#B0563A',
    表征学习: '#7B6A45',
    课程学习: '#4F7A3A',
    仿真: '#6A7B8C',
    监督学习: '#7B6A45',
    持续学习: '#4F7A3A',
    模仿学习: '#8A5A44',
    大语言模型: '#5C5AA7',
    多模态: '#8A4F7D',
  };
  const FALLBACK_COLORS = ['#B33A2B', '#2F6B5F', '#35577D', '#A9762A', '#6B4E8E', '#4F7A3A', '#A34C6B', '#7B6A45'];

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function tagColor(tag) {
    if (TAG_COLOR_MAP[tag]) return TAG_COLOR_MAP[tag];
    return FALLBACK_COLORS[hash(tag) % FALLBACK_COLORS.length];
  }

  function initials(title) {
    const s = String(title || '').trim();
    const words = s.match(/[A-Za-z][A-Za-z0-9-]*/g) || [];
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return s.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').slice(0, 2) || '·';
  }

  function fmtDate(iso, opts = {}) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      ...(opts.year ? { year: 'numeric' } : {}),
    }).format(d);
  }

  function relTime(iso) {
    if (!iso) return '';
    const d = new Date(iso).getTime();
    if (!d) return '';
    const diff = Date.now() - d;
    const min = 60e3;
    const hour = 60 * min;
    const day = 24 * hour;
    if (diff < 2 * min) return '刚刚';
    if (diff < hour) return `${Math.floor(diff / min)} 分钟前`;
    if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
    if (diff < 2 * day) return '昨天';
    if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
    return fmtDate(iso, { year: new Date(d).getFullYear() !== new Date().getFullYear() });
  }

  function todayLabel() {
    const d = new Date();
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(d);
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return '夜深了';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function stars(n) {
    const v = clamp(Number(n) || 0, 0, 5);
    return Array.from({ length: 5 }, (_, i) => `<span class="${i < v ? 'on' : ''}">★</span>`).join('');
  }

  function safeUrl(url) {
    const s = String(url || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    return '';
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  function download(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  function debounce(fn, ms = 160) {
    let t = 0;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  /* ------------------------------------------------------------------ *
   * Summary parser: turns a pasted reading note into structured fields
   * ------------------------------------------------------------------ */

  const SECTION_DEFS = [
    { key: 'future', label: '未来工作', cues: ['未来工作', '未来方向', '后续工作', '未来', 'future work', 'future directions', 'next steps'] },
    { key: 'limitations', label: '局限', cues: ['局限性', '局限', '不足', '缺点', '限制', 'limitations', 'limitation', 'weakness', 'drawbacks'] },
    { key: 'contributions', label: '贡献', cues: ['主要贡献', '贡献', '创新点', '创新', 'contributions', 'contribution'] },
    { key: 'results', label: '结果', cues: ['实验结果', '结果', '实验', '评估', 'results', 'experiments', 'evaluation'] },
    { key: 'method', label: '方法', cues: ['方法', '核心方法', '技术路线', '做法', '模型', '算法', 'method', 'approach', 'methodology'] },
    { key: 'problem', label: '问题', cues: ['研究问题', '问题', '背景', '动机', '现状', 'problem', 'motivation', 'background'] },
    { key: 'notes', label: '批注', cues: ['我的笔记', '笔记', '批注', '思考', '备注', 'notes', 'takeaways'] },
  ];

  const TAG_VOCAB = [
    '强化学习', '机器人导航', '鲁棒性', '泛化', '平坦极小值', '锐度感知', '优化', '表征学习',
    '样本效率', '基准测试', '仿真', '模仿学习', '多模态', '大语言模型', '世界模型', '对抗攻击',
    '安全', '课程学习', '离线强化学习', '持续学习', '扩散模型', '图神经网络', '策略优化',
    '迁移学习', '自监督学习', '三维视觉', 'SLAM', '运动规划', '自动驾驶', '具身智能',
  ];

  function headingOf(line) {
    let s = String(line).trim();
    if (!s) return null;
    s = s.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '').replace(/^[-*•]\s+/, '');
    const num = s.match(/^(?:\d{1,2}[.、)]|[一二三四五六七八九十]+[、.])\s*/);
    if (num) s = s.slice(num[0].length);
    const bracket = s.match(/^[【\[]([^】\]]{1,12})[】\]]\s*[:：]?\s*(.*)$/);
    if (bracket) return { label: bracket[1], rest: bracket[2] };
    for (const def of SECTION_DEFS) {
      for (const cue of def.cues) {
        const re = new RegExp(`^${cue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:：]?\\s*(.*)$`, 'i');
        const m = s.match(re);
        if (m) {
          const rest = m[1].trim();
          const prefix = s.slice(0, s.length - rest.length);
          const hasColon = /[:：]/.test(prefix);
          // A heading is either "方法" on its own line or "方法：…". Prose such as
          // "方法上，我们……" also starts with the cue but must not become a heading.
          if (!hasColon && rest) continue;
          if (!hasColon && !rest && s.length > cue.length + 8) continue;
          return { label: cue, rest };
        }
      }
    }
    return null;
  }

  function classifySentence(sentence) {
    const s = sentence.toLowerCase();
    const score = {
      problem: /问题|挑战|痛点|难以|缺少|不足|敏感|需求|challenge|problem|sensitive/.test(s) ? 2 : 0,
      method: /提出|方法|框架|算法|设计|引入|采用|优化|propose|method|approach|framework/.test(s) ? 2 : 0,
      contributions: /贡献|创新|首次|主要工作|contribution|novel/.test(s) ? 2 : 0,
      results: /实验|结果|表明|达到|优于|提升|outperform|result|improv/.test(s) ? 2 : 0,
      limitations: /局限|不足|缺点|然而|受限于|尚未|limitation|drawback|however/.test(s) ? 2 : 0,
      future: /未来|进一步|值得|下一步|future|extend/.test(s) ? 2 : 0,
    };
    let best = 'problem';
    let bestScore = 0;
    Object.entries(score).forEach(([k, v]) => {
      if (v > bestScore) {
        best = k;
        bestScore = v;
      }
    });
    return bestScore ? best : null;
  }

  function parseSummary(raw) {
    const text = String(raw || '').replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const fields = { problem: '', method: '', contributions: '', results: '', limitations: '', future: '', notes: '' };
    const buffers = {};
    let current = null;
    let blank = true;
    const plain = [];

    lines.forEach((line) => {
      if (!line.trim()) {
        blank = true;
        if (current) buffers[current].push('');
        return;
      }
      const head = headingOf(line);
      if (head) {
        const def = SECTION_DEFS.find((d) => d.cues.some((c) => c.toLowerCase() === head.label.toLowerCase())) ||
          SECTION_DEFS.find((d) => d.cues.some((c) => head.label.toLowerCase().includes(c.toLowerCase())));
        if (def) {
          current = def.key;
          buffers[current] = buffers[current] || [];
          if (head.rest) buffers[current].push(head.rest);
          blank = false;
          return;
        }
      }
      if (current) {
        // A blank-line-separated paragraph without a heading may still be a new
        // section written in prose ("方法上，我们……"). Classify it before
        // assuming it continues the previous section.
        if (blank) {
          const first = sentences(line)[0] || line;
          const cls = classifySentence(first);
          if (cls && cls !== current && !buffers[cls]) {
            current = cls;
            buffers[current] = [];
          }
        }
        buffers[current].push(line);
      } else {
        plain.push(line);
      }
      blank = false;
    });

    Object.keys(buffers).forEach((k) => {
      fields[k] = buffers[k].join('\n').replace(/\n{3,}/g, '\n\n').trim();
    });

    // Fallback: no headings detected — classify sentences.
    const hasStructured = Object.values(fields).some(Boolean);
    if (!hasStructured) {
      const all = sentences(plain.join('\n'));
      const buckets = { problem: [], method: [], contributions: [], results: [], limitations: [], future: [], notes: [] };
      all.forEach((s, i) => {
        const k = classifySentence(s) || (i < 2 ? 'problem' : 'notes');
        buckets[k].push(s);
      });
      Object.keys(buckets).forEach((k) => {
        fields[k] = buckets[k].join(' ');
      });
    }

    // Try to recover a title from the first meaningful line.
    let title = '';
    const firstLine = (plain.find((l) => l.trim()) || '').trim();
    const titleMatch = firstLine.match(/^(?:标题|题目|title)\s*[:：]\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else if (
      firstLine &&
      firstLine.length <= 110 &&
      !/[。！？!?]$/.test(firstLine) &&
      !headingOf(firstLine) &&
      firstLine.split(/\s+/).length <= 20 &&
      !/^(abstract|摘要|introduction|引言)/i.test(firstLine)
    ) {
      title = firstLine.replace(/^#+\s*/, '');
    }

    // Tags: hashtags, explicit keyword lines, and vocabulary hits.
    const tags = new Set();
    (text.match(/#([\u4e00-\u9fa5A-Za-z0-9_-]{2,20})/g) || []).forEach((t) => tags.add(t.slice(1)));
    const kw = text.match(/(?:关键词|关键字|keywords?)\s*[:：]\s*([^\n]{2,120})/i);
    if (kw) parseTags(kw[1]).forEach((t) => tags.add(t));
    TAG_VOCAB.forEach((t) => {
      if (text.toLowerCase().includes(t.toLowerCase())) tags.add(t);
    });

    const filled = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k]) => (SECTION_DEFS.find((d) => d.key === k) || { label: k }).label);

    return { title, fields, tags: Array.from(tags).slice(0, 10), filled };
  }

  function summaryBody(p) {
    const rows = [
      ['研究问题', p.problem],
      ['方法', p.method],
      ['贡献', p.contributions],
      ['结果', p.results],
      ['局限', p.limitations],
      ['未来工作', p.future],
      ['我的批注', p.notes],
    ];
    return rows
      .filter(([, v]) => v)
      .map(([k, v]) => `### ${k}\n\n${v}`)
      .join('\n\n');
  }

  function summaryMarkdown(p) {
    return `# ${p.title}\n\n- 作者：${p.authors || '—'}\n- 年份：${p.year || '—'}\n- 出处：${p.venue || '—'}\n- 板块：${p.board || '未分组'}\n- 标签：${(p.tags || []).join(' / ') || '—'}\n- 状态：${(STATUS[p.status] || STATUS.read).label}\n\n${summaryBody(p)}\n`;
  }

  PW.util = {
    esc, uid, clamp, stripMd, clip, sentences, firstSentence, parseTags,
    STATUS, IDEA_STATUS, RELATIONS, tagColor, initials, fmtDate, relTime, todayLabel,
    greeting, stars, safeUrl, hostOf, download, copyText, debounce, parseSummary,
    summaryBody, summaryMarkdown, hash,
  };
})();
