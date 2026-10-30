/* PaperWeave — lightweight local similarity engine (TF-IDF over Chinese bigrams + Latin words) */
(function () {
  const PW = (window.PW = window.PW || {});
  const U = PW.util;

  const STOP = new Set([
    '本文', '我们', '一个', '可以', '以及', '通过', '对于', '这种', '其中', '同时', '进行', '能够',
    '从而', '因此', '但是', '然而', '并且', '基于', '提出', '方法', '问题', '结果', '实验', '论文',
    '研究', '使用', '不同', '可能', '一定', '相应', '相关', '上述', '如下', '例如', '由于', '如果',
    '那么', '这些', '那些', '已经', '还是', '就是', '不是', '没有', '所有', '非常', '更加', '得到',
    '给出', '表明', '发现', '需要', '存在', '具有', '使得', '带来', '提升', '表现', '环境', '情况',
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'has', 'have', 'into',
    'its', 'their', 'our', 'can', 'which', 'such', 'than', 'then', 'also', 'using', 'used', 'based',
  ]);

  function tokenize(text) {
    const s = String(text || '').toLowerCase();
    const out = [];
    const latin = s.match(/[a-z][a-z0-9-]{1,}/g) || [];
    latin.forEach((w) => {
      if (w.length >= 3 && !STOP.has(w)) out.push(w);
    });
    const runs = s.match(/[\u4e00-\u9fff]+/g) || [];
    runs.forEach((run) => {
      if (run.length === 1) {
        if (!STOP.has(run)) out.push(run);
        return;
      }
      for (let i = 0; i < run.length - 1; i++) {
        const bigram = run.slice(i, i + 2);
        if (!STOP.has(bigram)) out.push(bigram);
      }
    });
    return out;
  }

  function weightedTokens(p) {
    const parts = [
      [p.title, 3],
      [(p.tags || []).join(' '), 4],
      [p.problem, 1.3],
      [p.method, 1.5],
      [p.contributions, 1],
      [p.results, 0.8],
      [p.limitations, 1.2],
      [p.future, 0.8],
      [p.notes, 0.6],
    ];
    const map = new Map();
    parts.forEach(([text, weight]) => {
      tokenize(text).forEach((t) => map.set(t, (map.get(t) || 0) + weight));
    });
    return map;
  }

  function buildIndex(papers) {
    const docs = papers.map((p) => ({ p, tf: weightedTokens(p) }));
    const df = new Map();
    docs.forEach(({ tf }) => {
      tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1));
    });
    const N = docs.length || 1;
    const idf = new Map();
    df.forEach((n, t) => idf.set(t, Math.log((N + 1) / (n + 1)) + 1));
    const vectors = new Map();
    docs.forEach(({ p, tf }) => {
      const vec = new Map();
      let norm = 0;
      tf.forEach((count, t) => {
        const w = (1 + Math.log(count)) * (idf.get(t) || 1);
        vec.set(t, w);
        norm += w * w;
      });
      norm = Math.sqrt(norm) || 1;
      vec.forEach((v, t) => vec.set(t, v / norm));
      vectors.set(p.id, vec);
    });
    return { vectors, idf, docs };
  }

  function cosine(a, b) {
    if (!a || !b) return 0;
    let sum = 0;
    const [small, big] = a.size < b.size ? [a, b] : [b, a];
    small.forEach((v, t) => {
      const w = big.get(t);
      if (w) sum += v * w;
    });
    return sum;
  }

  function jaccard(a, b) {
    const A = new Set((a.tags || []).map((t) => t.toLowerCase()));
    const B = new Set((b.tags || []).map((t) => t.toLowerCase()));
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((t) => {
      if (B.has(t)) inter++;
    });
    return inter / (A.size + B.size - inter);
  }

  function sharedTags(a, b) {
    const B = new Set(b.tags || []);
    return (a.tags || []).filter((t) => B.has(t));
  }

  function pairScore(a, b, index) {
    const cos = cosine(index.vectors.get(a.id), index.vectors.get(b.id));
    const jac = jaccard(a, b);
    return U.clamp(cos * 0.62 + jac * 0.38, 0, 1);
  }

  function textScore(text, paper, index) {
    const tf = new Map();
    tokenize(text).forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    let norm = 0;
    tf.forEach((v, t) => {
      const w = 1 + Math.log(v);
      tf.set(t, w);
      norm += w * w;
    });
    norm = Math.sqrt(norm) || 1;
    tf.forEach((v, t) => tf.set(t, v / norm));
    return cosine(tf, index.vectors.get(paper.id));
  }

  function autoCandidates(papers, index, min = 0.06) {
    const out = [];
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const score = pairScore(papers[i], papers[j], index);
        if (score >= min) {
          out.push({
            source: papers[i].id,
            target: papers[j].id,
            score,
            type: guessRelation(papers[i], papers[j], index),
            shared: sharedTags(papers[i], papers[j]),
          });
        }
      }
    }
    return out.sort((a, b) => b.score - a.score);
  }

  function guessRelation(a, b, index) {
    const methodA = textScore(a.method || '', b, index);
    const methodB = textScore(b.method || '', a, index);
    if (methodA > 0.3 || methodB > 0.3) return 'method';
    if ((b.tags || []).some((t) => /基准|评测|benchmark/i.test(t))) return 'applies';
    if ((a.tags || []).some((t) => /基准|评测|benchmark/i.test(t))) return 'applies';
    return 'inspiration';
  }

  function reasonsFor(a, b, index) {
    const shared = sharedTags(a, b);
    const reasons = [];
    if (shared.length) reasons.push(`共享主题：${shared.slice(0, 3).join('、')}`);
    const va = index.vectors.get(a.id);
    const vb = index.vectors.get(b.id);
    const common = [];
    if (va && vb) {
      va.forEach((v, t) => {
        if (vb.has(t) && /^[a-z]{3,}$/.test(t) && !STOP.has(t) && common.length < 6) common.push(t);
      });
    }
    if (common.length >= 2) reasons.push(`共同概念：${common.slice(0, 4).join(' / ')}`);
    if (!reasons.length) reasons.push('文本与主题分布接近');
    return reasons;
  }

  function suggestions(paper, papers, existingLinks, limit = 4) {
    if (!paper) return [];
    const index = buildIndex(papers);
    const linked = new Set();
    (existingLinks || []).forEach((l) => {
      linked.add(l.source);
      linked.add(l.target);
    });
    return papers
      .filter((p) => p.id !== paper.id && !linked.has(p.id))
      .map((p) => ({
        paper: p,
        score: pairScore(paper, p, index),
        relation: guessRelation(paper, p, index),
        reasons: reasonsFor(paper, p, index),
      }))
      .filter((s) => s.score >= 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  PW.sim = {
    tokenize,
    buildIndex,
    pairScore,
    textScore,
    autoCandidates,
    suggestions,
    sharedTags,
    reasonsFor,
    guessRelation,
    cosine,
  };
})();
