/* PaperWeave — local idea synthesis engine
 * Grounded in structured paper fields. No network, no model calls:
 * every idea is assembled from the user's own summaries with an evidence chain.
 */
(function () {
  const PW = (window.PW = window.PW || {});
  const U = PW.util;

  const STRATEGIES = [
    {
      id: 'mix',
      label: '混合模式',
      code: 'MIX',
      color: '#20201D',
      desc: '在四种策略中自动挑选互补性最高的组合',
    },
    {
      id: 'gap',
      label: '空白桥接',
      code: 'GAP',
      color: '#B33A2B',
      desc: '用一篇论文的方法，补另一篇论文明确留下的局限',
    },
    {
      id: 'transplant',
      label: '方法移植',
      code: 'XFR',
      color: '#35577D',
      desc: '把异领域的方法搬到你的问题上，先检验假设是否成立',
    },
    {
      id: 'triangulate',
      label: '三方融合',
      code: 'TRI',
      color: '#A9762A',
      desc: '问题 × 方法 × 评测标尺，拼出一份完整的研究设计',
    },
    {
      id: 'frontier',
      label: '领域前沿',
      code: 'FRO',
      color: '#2F6B5F',
      desc: '汇总多篇论文的共同局限，寻找公共缺口',
    },
    {
      id: 'analogy',
      label: '跨域类比',
      code: 'ANA',
      color: '#6B4E8E',
      desc: '寻找共享抽象主题、但领域不同的隐藏同构',
    },
  ];

  const FIELD_LABEL = {
    problem: '研究问题',
    method: '方法',
    contributions: '贡献',
    results: '结果',
    limitations: '局限',
    future: '未来工作',
    notes: '批注',
  };

  const ABSTRACT_TAGS = new Set(['鲁棒性', '泛化', '可塑性', '样本效率', '平坦极小值', '优化', '评测', '基准测试']);

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function trimPunct(s) {
    return String(s || '').replace(/^[\s·•\-–—]+/, '').replace(/[。．.；;，,、\s]+$/, '').trim();
  }

  // Collapse the template's spacing between Chinese characters while keeping
  // the conventional space between Latin terms and Chinese text.
  function zh(text) {
    return String(text || '')
      .replace(/([\u4e00-\u9fff]) +(?=[\u4e00-\u9fff])/g, '$1')
      .replace(/([\u4e00-\u9fff]) +(?=[，。；：、！？])/g, '$1')
      .replace(/([（「『“]) +(?=[\u4e00-\u9fff])/g, '$1')
      .replace(/ +([）」。；：、！？])/g, '$1')
      .replace(/\s{2,}/g, ' ');
  }

  function sent(text, max = 110) {
    return trimPunct(U.firstSentence(text, max));
  }

  function clause(text, max = 42) {
    const s = trimPunct(U.firstSentence(text, 240));
    const idx = s.search(/[，,；;]/);
    const head = idx > 10 ? s.slice(0, idx) : s;
    return U.clip(head, max).replace(/…$/, '');
  }

  function shortOf(p) {
    if (p.short && p.short.length <= 26) return p.short;
    const t = p.title.replace(/[:：].*$/, '');
    if (/^[A-Za-z]/.test(t)) {
      const words = t.split(/\s+/);
      if (words.length >= 3) {
        const cap = words.filter((w) => /^[A-Z]/.test(w)).length;
        if (cap >= 3) return words.filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('').slice(0, 5);
      }
      return U.clip(words.slice(0, 3).join(' '), 22);
    }
    return U.clip(t, 14);
  }

  function methodLabel(p) {
    const m = `${p.method || ''} ${p.title || ''}`;
    const rules = [
      [/平坦奖励|flat reward/i, '平坦奖励'],
      [/锐度|sharpness/i, '锐度感知最小化'],
      [/可塑性|plasticity/i, '可塑性正则'],
      [/难度|评测|基准|benchmark/i, '难度分级评测'],
      [/掩码/, '掩码训练'],
      [/课程/, '课程学习'],
      [/蒸馏/, '蒸馏'],
      [/对比学习/, '对比学习'],
      [/数据增强/, '数据增强'],
    ];
    for (const [re, label] of rules) if (re.test(m)) return label;
    const acro = m.match(/（([A-Z][A-Za-z0-9-]{1,10})）|\(([A-Z][A-Za-z0-9-]{1,10})\)/);
    if (acro) return acro[1] || acro[2];
    const after = m.match(/^(?:提出|引入|设计|采用|定义)\s*([^：:，。；]{2,20})/);
    if (after) return after[1].trim();
    if (p.short) return `${p.short} 方法`;
    return U.clip(p.method || '', 18).replace(/…$/, '') || '其方法';
  }

  function topicOf(p) {
    return (p.tags && p.tags[0]) || p.venue || '该方向';
  }

  function topicPair(p) {
    const tags = (p.tags || []).slice(0, 2);
    return tags.length ? tags.join(' · ') : topicOf(p);
  }

  function slotOf(p) {
    const m = `${p.method || ''} ${p.title || ''}`;
    if (/优化|目标|损失|梯度|min-?max|正则|锐度|更新/.test(m)) return '训练目标 / 优化器';
    if (/网络|架构|编码器|表征|模块|层/.test(m)) return '网络结构与表征';
    if (/数据|采样|课程|环境|基准/.test(m)) return '数据与课程设计';
    if (/评测|指标|benchmark/i.test(m)) return '评测协议';
    if (/定义|定理|证明|界/.test(m)) return '理论假设与目标函数';
    return '方法组件';
  }

  function evalPhrase(a, b) {
    if ((b.tags || []).some((t) => /基准|评测|benchmark/i.test(t))) return `${shortOf(b)} 的评测协议`;
    if ((a.tags || []).includes('机器人导航')) return '导航仿真与真机迁移实验';
    return '两篇论文各自的代表性环境';
  }

  function metricPhrase(a, b) {
    const tags = new Set([...(a.tags || []), ...(b.tags || [])]);
    if (tags.has('鲁棒性')) return '扰动下的成功率、性能保持率与衰减曲线';
    if (tags.has('可塑性')) return '性能恢复速度与长期回报';
    if (tags.has('泛化')) return '分布外测试误差与最差组表现';
    if (tags.has('样本效率')) return '达到目标回报所需样本量与稳定性';
    if (tags.has('评测') || tags.has('基准测试')) return '系统级成功率、路径效率与跨环境排名';
    return '主指标与扰动下的衰减曲线';
  }

  function evidence(p, field, quote) {
    return {
      paperId: p.id,
      field: FIELD_LABEL[field] || field,
      quote: trimPunct(quote || p[field] || ''),
    };
  }

  function scoreIdea(rand, base) {
    return {
      novelty: U.clamp(Math.round((base.novelty || 62) + (rand() - 0.5) * 10), 42, 93),
      feasibility: U.clamp(Math.round((base.feasibility || 60) + (rand() - 0.5) * 10), 40, 92),
      impact: U.clamp(Math.round((base.impact || 62) + (rand() - 0.5) * 10), 42, 93),
    };
  }

  function make(raw) {
    return {
      id: U.uid('gen'),
      strategy: raw.strategy,
      title: zh(raw.title),
      hypothesis: zh(raw.hypothesis),
      problem: zh(raw.problem),
      approach: raw.approach.filter(Boolean).map(zh),
      evidence: raw.evidence.filter((e) => e && e.quote),
      scores: raw.scores,
      sourceIds: Array.from(new Set(raw.sourceIds)),
      status: 'seed',
      notes: '',
      createdAt: new Date().toISOString(),
    };
  }

  /* --------------------------- strategies --------------------------- */

  function genGap(papers, index, anchors, all, rand) {
    const out = [];
    anchors.forEach((a) => {
      if (!a.limitations && !a.future) return;
      const gapText = `${a.limitations} ${a.future}`;
      all
        .filter((b) => b.id !== a.id && b.method)
        .map((b) => {
          const relevance = PW.sim.textScore(gapText, b, index);
          const tags = PW.sim.sharedTags(a, b).length;
          return { b, relevance, tags, rank: relevance * 0.7 + tags * 0.08 };
        })
        .sort((x, y) => y.rank - x.rank)
        .slice(0, 2)
        .forEach(({ b, relevance, tags }) => {
          const lim = sent(a.limitations || a.future, 110);
          const titles = [
            `${methodLabel(b)} × ${topicOf(a)}：补足 ${shortOf(a)} 的一条缺口`,
            `把 ${methodLabel(b)} 接进 ${topicOf(a)}：从 ${shortOf(a)} 的局限出发`,
            `${shortOf(a)} 的下一个增量：借 ${shortOf(b)} 的 ${methodLabel(b)}`,
          ];
          const title = titles[Math.floor(rand() * titles.length)];
          out.push(
            make({
              strategy: 'gap',
              title,
              hypothesis: `${shortOf(a)} 留下的关键缺口是「${lim}」。${shortOf(b)} 提供了另一套可借用的机制：${methodLabel(b)}。若把二者接起来，${topicOf(a)} 可能得到一个既保留原方法骨架、又补足该缺口的混合方案，并可用${evalPhrase(a, b)}检验。`,
              problem: `${lim}。这一缺口在 ${topicOf(a)} 中仍缺少可复用的解法，而 ${shortOf(b)} 的思路尚未在该任务上被系统验证。`,
              approach: [
                `复现 ${shortOf(a)} 的基线，锁定数据、评测协议与随机种子，先确认这个缺口在实验中可被观测。`,
                `将 ${methodLabel(b)} 作为${slotOf(b)}接入基线，先做“一个场景、一组超参”的单点可行性实验。`,
                `在${evalPhrase(a, b)}上对比${metricPhrase(a, b)}，并针对「${clause(a.limitations || a.future, 26)}」做消融与扰动测试。`,
              ],
              evidence: [
                evidence(a, a.limitations ? 'limitations' : 'future'),
                evidence(b, 'method'),
                evidence(b, b.contributions ? 'contributions' : 'results'),
              ],
              sourceIds: [a.id, b.id],
              scores: scoreIdea(rand, {
                novelty: 62 + (1 - relevance) * 14 + (tags ? 2 : 0),
                feasibility: 56 + (a.method ? 6 : 0) + (b.method ? 6 : 0) + tags * 2,
                impact: 62 + (a.rating || 3) * 2.5,
              }),
            })
          );
        });
    });
    return out;
  }

  function genTransplant(papers, index, anchors, all, rand) {
    const out = [];
    anchors.forEach((a) => {
      const base = all.filter((b) => b.id !== a.id && b.method);
      const nonBench = base.filter((b) => !(b.tags || []).some((t) => /基准|评测|benchmark/i.test(t)));
      const pool = nonBench.length ? nonBench : base;
      pool
        .map((b) => {
          const sim = PW.sim.pairScore(a, b, index);
          const diffTopic = topicOf(a) !== topicOf(b) ? 1 : 0;
          return { b, sim, diffTopic, rank: (1 - sim) * 0.7 + diffTopic * 0.3 };
        })
        .filter((x) => x.sim < 0.6)
        .sort((x, y) => y.rank - x.rank)
        .slice(0, 1)
        .forEach(({ b, sim, diffTopic }) => {
          if (!diffTopic && sim > 0.4) return;
          const titles = [
            `${methodLabel(b)} 能解 ${topicOf(a)} 的题吗？一次跨域移植`,
            `借 ${shortOf(b)} 的锤子，敲 ${topicOf(a)} 的钉子`,
            `${topicOf(a)} × ${topicOf(b)}：把 ${methodLabel(b)} 搬到新土壤`,
          ];
          out.push(
            make({
              strategy: 'transplant',
              title: titles[Math.floor(rand() * titles.length)],
              hypothesis: `${shortOf(b)} 在「${topicOf(b)}」方面实践了「${methodLabel(b)}」；而 ${shortOf(a)} 的核心困难是「${clause(a.problem, 44)}」。两者领域不同，但若 ${methodLabel(b)} 的关键假设在 ${topicOf(a)} 中成立，移植后可能同时带来新的机制与新的评测视角。`,
              problem: `${sent(a.problem, 110)}。目前的解法大多生长在本领域内部，缺少从 ${topicOf(b)} 借来的工具；但跨域移植的前提——假设是否成立——很少被显式检查。`,
              approach: [
                `拆解 ${methodLabel(b)} 的关键假设与接口（输入、输出、可微性、数据需求），逐条检查它在 ${topicOf(a)} 中是否成立。`,
                `在 ${shortOf(a)} 的基线上做“最小移植”：先替换一个组件或增加一个正则项，而不是整体照搬。`,
                `用${evalPhrase(a, b)}做 A/B 对照；如果收益确实来自 ${methodLabel(b)}，它应当能在消融中消失。`,
              ],
              evidence: [
                evidence(a, 'problem'),
                evidence(b, 'method'),
                evidence(b, 'limitations'),
              ],
              sourceIds: [a.id, b.id],
              scores: scoreIdea(rand, {
                novelty: 66 + (1 - sim) * 12,
                feasibility: 54 + (a.method ? 6 : 0) + (b.method ? 6 : 0) + (1 - sim) * 5,
                impact: 62 + (b.rating || 3) * 2.5,
              }),
            })
          );
        });
    });
    return out;
  }

  function genTriangulate(papers, index, anchors, all, rand) {
    const out = [];
    anchors.forEach((a) => {
      if (all.length < 3) return;
      const others = all.filter((b) => b.id !== a.id && b.method);
      if (!others.length) return;
      const b = others.sort((x, y) => PW.sim.pairScore(a, y, index) - PW.sim.pairScore(a, x, index))[0];
      const rest = all.filter((c) => c.id !== a.id && c.id !== b.id);
      if (!rest.length) return;
      const benchmarkish = rest.filter((c) => (c.tags || []).some((t) => /基准|评测|仿真|机器人导航/.test(t)));
      const c = (benchmarkish.length ? benchmarkish : rest)[Math.floor(rand() * (benchmarkish.length || rest.length))];
      out.push(
        make({
          strategy: 'triangulate',
          title: `问题 × 方法 × 标尺：${shortOf(a)} + ${shortOf(b)} + ${shortOf(c)} 的三方实验设计`,
          hypothesis: `把 ${shortOf(a)} 的问题、来自 ${shortOf(b)} 的「${methodLabel(b)}」与 ${shortOf(c)} 的评测标尺放在同一张实验台上，可以一次回答三个问题：方法是否有效、在什么条件下有效、以及如何公平比较。`,
          problem: `${sent(a.problem, 100)}。现有验证往往只在各自指标上成立，缺少跨基准的可比性；而 ${shortOf(c)} 恰好提供了另一种“尺子”。`,
          approach: [
            `以 ${shortOf(a)} 的设定定义任务与成功判据，以来自 ${shortOf(b)} 的「${methodLabel(b)}」作为待检验机制，以 ${shortOf(c)} 的指标作为外部标尺。`,
            `设计 2×2 对照：有无 ${methodLabel(b)} × 两种评测标尺，观察结论是否随标尺改变。`,
            `报告${metricPhrase(a, b)}，并给出“在什么条件下结论翻转”的边界分析。`,
          ],
          evidence: [evidence(a, 'problem'), evidence(b, 'method'), evidence(c, 'results')],
          sourceIds: [a.id, b.id, c.id],
          scores: scoreIdea(rand, {
            novelty: 64 + (PW.sim.pairScore(a, c, index) < 0.2 ? 8 : 0),
            feasibility: 60 + (a.method ? 4 : 0) + (c.results ? 4 : 0),
            impact: 64 + (b.rating || 3) * 2,
          }),
        })
      );
    });
    return out;
  }

  function genFrontier(papers, index, anchors, all, rand) {
    const pools = new Map();
    papers.forEach((p) => {
      (p.tags || []).forEach((t) => {
        if (!pools.has(t)) pools.set(t, []);
        pools.get(t).push(p);
      });
    });
    const candidates = Array.from(pools.entries())
      .filter(([tag, list]) => list.length >= 2 && list.some((p) => p.limitations))
      .sort((a, b) => {
        const score = (x) => x[1].length * 2 + (ABSTRACT_TAGS.has(x[0]) ? 4 : 0) + (x[0] === '强化学习' ? -2 : 0);
        return score(b) - score(a);
      });
    const out = [];
    candidates.slice(0, 3).forEach(([tag, list]) => {
      const top = list
        .filter((p) => p.limitations)
        .sort((x, y) => (y.rating || 0) - (x.rating || 0))
        .slice(0, 3);
      if (top.length < 2) return;
      const p1 = top[0];
      const p2 = top[1];
      const lim1 = sent(p1.limitations, 84);
      const lim2 = sent(p2.limitations, 84);
      out.push(
        make({
          strategy: 'frontier',
          title: `「${tag}」的公共缺口：把 ${shortOf(p1)} 与 ${shortOf(p2)} 的局限并成一份议程`,
          hypothesis: `围绕「${tag}」，${shortOf(p1)} 暴露出「${lim1}」，${shortOf(p2)} 则受限于「${lim2}」。这些局限可能指向同一个未被系统回答的问题：${tag} 的收益究竟来自哪种可测量、可迁移的机制？`,
          problem: `现有 ${tag} 工作大多在各自场景内推进，但共同缺少一个把“机制—度量—部署”串起来的框架；单篇论文的局限因此被当作实现细节，而不是研究方向。`,
          approach: [
            `画一张缺口矩阵：行是 ${top.map((p) => shortOf(p)).join('、')}，列是「理论假设 / 数据与场景 / 评测标尺 / 真实部署」，标出所有空白格。`,
            `选一个最小统一目标，至少覆盖两个缺口（例如：同一个可计算量既能解释收益，又能预测扰动下的失效）。`,
            `在 ${tag} 相关的两个基准上做交叉验证，并明确写出“这个框架在什么情况下不成立”。`,
          ],
          evidence: [evidence(p1, 'limitations'), evidence(p2, 'limitations'), ...(top[2] ? [evidence(top[2], 'future')] : [])],
          sourceIds: top.map((p) => p.id),
          scores: scoreIdea(rand, {
            novelty: 70 + (top.length >= 3 ? 4 : 0),
            feasibility: 50 + top.filter((p) => p.method).length * 3,
            impact: 66 + (ABSTRACT_TAGS.has(tag) ? 6 : 0),
          }),
        })
      );
    });
    return out;
  }

  function genAnalogy(papers, index, anchors, all, rand) {
    const out = [];
    const pairs = [];
    anchors.forEach((a) => {
      all.forEach((b) => {
        if (a.id === b.id) return;
        const shared = PW.sim.sharedTags(a, b).filter((t) => ABSTRACT_TAGS.has(t));
        if (!shared.length) return;
        const sim = PW.sim.pairScore(a, b, index);
        if (sim > 0.42) return;
        pairs.push({ a, b, shared, sim, rank: shared.length * 0.4 + (1 - sim) * 0.6 });
      });
    });
    pairs
      .sort((x, y) => y.rank - x.rank)
      .slice(0, 2)
      .forEach(({ a, b, shared, sim }) => {
        const tag = shared[0];
        out.push(
          make({
            strategy: 'analogy',
            title: `${topicOf(a)} 与 ${topicOf(b)} 的隐藏同构：${tag} 的两种写法`,
            hypothesis: `${shortOf(a)} 与 ${shortOf(b)} 看起来分属不同问题，但都在处理「${tag}」。如果把两者的核心机制抽象成同一张概念图，可能出现一个可复用的中间层——它既能解释 ${shortOf(a)} 的失效模式，也能为 ${shortOf(b)} 提供新的约束。`,
            problem: `两个领域各自积累了关于「${tag}」的经验，却缺少概念层面的对齐：同一个词在不同论文里指的不是同一件事，导致方法无法直接比较，也难以迁移。`,
            approach: [
              `建立概念映射表：把 ${shortOf(a)} 与 ${shortOf(b)} 中与「${tag}」相关的定义、假设、度量逐项对齐，标出“同词不同义”的位置。`,
              `从映射中提炼一个中间表示（例如统一的扰动算子或统一的几何量），并用它重写两篇论文的目标函数。`,
              `选择一个能同时容纳两种设定的最小实验，验证中间表示是否带来可迁移的收益；若失败，记录反例本身。`,
            ],
            evidence: [evidence(a, 'method'), evidence(b, 'method'), evidence(a, 'limitations')],
            sourceIds: [a.id, b.id],
            scores: scoreIdea(rand, {
              novelty: 70 + (1 - sim) * 10,
              feasibility: 50 + (a.method && b.method ? 8 : 0),
              impact: 64 + shared.length * 3,
            }),
          })
        );
      });
    return out;
  }

  const GENERATORS = {
    gap: genGap,
    transplant: genTransplant,
    triangulate: genTriangulate,
    frontier: genFrontier,
    analogy: genAnalogy,
  };

  function generate(opts = {}) {
    const papers = opts.papers || [];
    const count = U.clamp(Number(opts.count) || 3, 1, 8);
    const strategy = GENERATORS[opts.strategy] ? opts.strategy : 'mix';
    if (papers.length < 2) return [];

    const scopeIds = (opts.scopeIds || []).filter((id) => papers.some((p) => p.id === id));
    const anchors = scopeIds.length ? papers.filter((p) => scopeIds.includes(p.id)) : papers;
    const index = PW.sim.buildIndex(papers);
    const seed = Number(opts.seed) || Date.now();
    const rand = mulberry32(seed);

    let pools = [];
    if (strategy === 'mix') {
      pools = ['gap', 'transplant', 'triangulate', 'frontier', 'analogy'].map((s) =>
        GENERATORS[s](papers, index, anchors, papers, mulberry32(seed + s.length * 9173))
      );
    } else {
      pools = [GENERATORS[strategy](papers, index, anchors, papers, rand)];
    }

    const picked = [];
    const seen = new Set();
    const sourceSeen = new Set();
    let guard = 0;
    while (picked.length < count && guard < 80) {
      guard++;
      let advanced = false;
      for (const pool of pools) {
        while (pool.length) {
          const cand = pool.shift();
          const key = cand.title;
          const srcKey = cand.sourceIds.slice().sort().join('|') + cand.strategy;
          if (seen.has(key) || sourceSeen.has(srcKey)) continue;
          if (picked.some((p) => p.sourceIds.slice().sort().join('|') === cand.sourceIds.slice().sort().join('|'))) continue;
          seen.add(key);
          sourceSeen.add(srcKey);
          picked.push(cand);
          advanced = true;
          break;
        }
        if (picked.length >= count) break;
      }
      if (!advanced) break;
    }

    // If a narrow scope produced too few ideas, top up with gap variants.
    if (picked.length < count) {
      const extra = genGap(papers, index, anchors, papers, mulberry32(seed + 11));
      extra.forEach((cand) => {
        if (picked.length < count && !seen.has(cand.title)) {
          seen.add(cand.title);
          picked.push(cand);
        }
      });
    }

    return picked.slice(0, count);
  }

  function strategyMeta(id) {
    return STRATEGIES.find((s) => s.id === id) || STRATEGIES[1];
  }

  PW.ideas = { generate, STRATEGIES, strategyMeta, FIELD_LABEL };
})();
