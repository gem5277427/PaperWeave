/* PaperWeave — canvas knowledge graph: force layout, pan / zoom / drag */
(function () {
  const PW = (window.PW = window.PW || {});
  const U = PW.util;

  function mount(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const papers = opts.papers || [];
    const links = opts.links || [];
    const onSelect = opts.onSelect || function () {};
    const sim = PW.sim.buildIndex(papers);
    const boardColors = opts.boardColors || {};
    const grouped = !!opts.grouped;

    function boardOf(p) {
      return (p.board || '未分组').trim() || '未分组';
    }

    function rgba(hex, a) {
      const h = String(hex || '#8f8878').replace('#', '');
      const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
      const n = parseInt(full, 16);
      if (!Number.isFinite(n)) return `rgba(143, 136, 120, ${a})`;
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    }

    let W = 800;
    let H = 600;
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let threshold = typeof opts.threshold === 'number' ? opts.threshold : 0.14;
    let selected = opts.selectedId || null;
    let hover = null;
    let raf = 0;
    let destroyed = false;
    let fitted = false;
    const cam = { x: 0, y: 0, k: 1 };

    const byId = new Map(papers.map((p) => [p.id, p]));
    const degree = new Map();
    links.forEach((l) => {
      degree.set(l.source, (degree.get(l.source) || 0) + 1);
      degree.set(l.target, (degree.get(l.target) || 0) + 1);
    });

    const nodes = papers.map((p, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(1, papers.length);
      const ring = 150 + (i % 2) * 34;
      const board = boardOf(p);
      return {
        id: p.id,
        p,
        board,
        x: Math.cos(angle) * ring + (Math.random() - 0.5) * 8,
        y: Math.sin(angle) * ring + (Math.random() - 0.5) * 8,
        vx: 0,
        vy: 0,
        r: U.clamp(14 + (p.rating || 0) * 1.5 + Math.min(6, (degree.get(p.id) || 0) * 1.2), 14, 27),
        color: boardColors[board] || U.tagColor((p.tags || [])[0] || ''),
        tagColor: U.tagColor((p.tags || [])[0] || ''),
        fixed: false,
      };
    });
    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const groupNames = [...new Set(nodes.map((n) => n.board))].sort((a, b) => a.localeCompare(b, 'zh'));
    const groupAnchor = new Map();
    groupNames.forEach((name, i) => {
      if (groupNames.length === 1) {
        groupAnchor.set(name, { x: 0, y: 0 });
      } else {
        const angle = (i * Math.PI * 2) / groupNames.length;
        groupAnchor.set(name, { x: Math.cos(angle) * 205, y: Math.sin(angle) * 205 });
      }
    });
    nodes.forEach((n) => {
      const a = groupAnchor.get(n.board);
      if (a) {
        n.x += a.x;
        n.y += a.y;
      }
    });

    const edgeKey = (a, b) => [a, b].sort().join('|');
    const known = new Set();
    const edges = [];
    links.forEach((l) => {
      if (!nodeById.has(l.source) || !nodeById.has(l.target)) return;
      known.add(edgeKey(l.source, l.target));
      edges.push({
        a: l.source,
        b: l.target,
        type: l.type,
        color: (U.RELATIONS[l.type] || U.RELATIONS.inspiration).color,
        weight: 1,
        dashed: false,
        directed: !!(U.RELATIONS[l.type] || {}).directed,
      });
    });
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const a = papers[i];
        const b = papers[j];
        if (known.has(edgeKey(a.id, b.id))) continue;
        const score = PW.sim.pairScore(a, b, sim);
        if (score >= 0.04) {
          edges.push({
            a: a.id,
            b: b.id,
            type: 'inferred',
            color: '#8f8878',
            weight: score,
            dashed: true,
            directed: false,
          });
        }
      }
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = Math.max(240, rect.width);
      H = Math.max(240, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      if (!fitted) fit(false);
      // Resizing the backing store clears the canvas; repaint immediately so a
      // throttled/backgrounded requestAnimationFrame loop can't leave it blank.
      draw();
    }

    function fit(animate) {
      if (!nodes.length) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach((n) => {
        minX = Math.min(minX, n.x - n.r);
        maxX = Math.max(maxX, n.x + n.r);
        minY = Math.min(minY, n.y - n.r);
        maxY = Math.max(maxY, n.y + n.r);
      });
      const w = Math.max(80, maxX - minX);
      const h = Math.max(80, maxY - minY);
      const k = U.clamp(Math.min((W - 150) / w, (H - 150) / h), 0.35, 1.9);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      cam.k = k;
      cam.x = -cx * k;
      cam.y = -cy * k;
      fitted = true;
      if (animate) {
        alpha = 0.4;
      }
      draw();
    }

    let alpha = 1;
    function tick() {
      alpha *= 0.994;
      if (alpha < 0.02) alpha = 0.02;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            d2 = 1;
          }
          const d = Math.sqrt(d2);
          const weight = a.board !== b.board ? 1.6 : 1;
          const force = Math.min(46, 3400 / d2) * alpha * weight;
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      edges.forEach((e) => {
        if (e.dashed && e.weight < threshold) return;
        const a = nodeById.get(e.a);
        const b = nodeById.get(e.b);
        if (!a || !b) return;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const rest = e.dashed ? 168 : 132;
        const f = (d - rest) * 0.008 * (e.dashed ? 0.5 + e.weight : 1) * alpha;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      nodes.forEach((n) => {
        if (n.fixed) return;
        const anchor = groupAnchor.get(n.board);
        if (anchor) {
          n.vx += (anchor.x - n.x) * 0.006 * alpha;
          n.vy += (anchor.y - n.y) * 0.006 * alpha;
        }
        const centerPull = groupNames.length > 1 ? 0.0002 : 0.0012;
        n.vx -= n.x * centerPull * alpha;
        n.vy -= n.y * centerPull * alpha;
        n.vx = U.clamp(n.vx * 0.86, -14, 14);
        n.vy = U.clamp(n.vy * 0.86, -14, 14);
        n.x += n.vx;
        n.y += n.vy;
      });
    }

    function screenToWorld(px, py) {
      return {
        x: (px - W / 2 - cam.x) / cam.k,
        y: (py - H / 2 - cam.y) / cam.k,
      };
    }

    function hitTest(w) {
      let best = null;
      let bestD = Infinity;
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - w.x, n.y - w.y);
        if (d <= n.r + 8 / cam.k && d < bestD) {
          best = n;
          bestD = d;
        }
      });
      return best;
    }

    function roundRect(x, y, w, h, r) {
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    function convexHull(points) {
      const pts = points.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
      const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
      const lower = [];
      pts.forEach((p) => {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
      });
      const upper = [];
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
      }
      lower.pop();
      upper.pop();
      return lower.concat(upper);
    }

    function drawGroups() {
      if (!grouped || groupNames.length < 2) return;
      ctx.save();
      groupNames.forEach((name) => {
        const members = nodes.filter((n) => n.board === name);
        if (!members.length) return;
        const color = boardColors[name] || U.tagColor(name);
        const pts = [];
        members.forEach((n) => {
          const rr = n.r + 18;
          for (let k = 0; k < 12; k++) {
            const ang = (k * Math.PI * 2) / 12;
            pts.push({ x: n.x + Math.cos(ang) * rr, y: n.y + Math.sin(ang) * rr });
          }
        });
        const hull = convexHull(pts);
        if (hull.length < 3) return;
        const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
        const start = mid(hull[hull.length - 1], hull[0]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        hull.forEach((p, i) => {
          const m = mid(p, hull[(i + 1) % hull.length]);
          ctx.quadraticCurveTo(p.x, p.y, m.x, m.y);
        });
        ctx.closePath();
        ctx.fillStyle = rgba(color, 0.055);
        ctx.fill();
        ctx.setLineDash([7 / cam.k, 6 / cam.k]);
        ctx.lineWidth = 1.2 / cam.k;
        ctx.strokeStyle = rgba(color, 0.26);
        ctx.stroke();
        ctx.setLineDash([]);

        const minY = Math.min(...hull.map((p) => p.y));
        const top = hull.filter((p) => p.y < minY + 8);
        const cx = top.reduce((sum, p) => sum + p.x, 0) / top.length;
        const fs = Math.max(9, 11 / Math.sqrt(cam.k));
        ctx.font = `600 ${fs}px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
        const tw = ctx.measureText(name).width;
        const h = fs + 10;
        const y = minY - 14 - h;
        ctx.fillStyle = 'rgba(252, 250, 244, 0.96)';
        roundRect(cx - tw / 2 - 11, y, tw + 22, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = rgba(color, 0.32);
        ctx.lineWidth = 0.8 / cam.k;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, cx, y + h / 2 + 0.5);
      });
      ctx.restore();
    }

    function drawEdge(e) {
      if (e.dashed && e.weight < threshold) return;
      const a = nodeById.get(e.a);
      const b = nodeById.get(e.b);
      if (!a || !b) return;
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const x1 = a.x + Math.cos(ang) * (a.r + 2);
      const y1 = a.y + Math.sin(ang) * (a.r + 2);
      const x2 = b.x - Math.cos(ang) * (b.r + (e.directed ? 8 : 2));
      const y2 = b.y - Math.sin(ang) * (b.r + (e.directed ? 8 : 2));
      ctx.save();
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = e.dashed ? U.clamp(0.16 + e.weight * 0.55, 0.16, 0.6) : 0.5;
      ctx.lineWidth = (e.dashed ? 1.1 : 1.8) / cam.k;
      if (e.dashed) ctx.setLineDash([4 / cam.k, 5 / cam.k]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      if (e.directed) {
        const size = 6 / cam.k;
        ctx.fillStyle = e.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - Math.cos(ang - 0.44) * size, y2 - Math.sin(ang - 0.44) * size);
        ctx.lineTo(x2 - Math.cos(ang + 0.44) * size, y2 - Math.sin(ang + 0.44) * size);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    function drawNode(n) {
      const isSel = n.id === selected;
      const isHover = hover && hover.id === n.id;
      ctx.save();
      if (isSel) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(179, 58, 43, 0.12)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(179, 58, 43, 0.55)';
        ctx.lineWidth = 1.4 / cam.k;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (isHover ? 2 : 0), 0, Math.PI * 2);
      ctx.fillStyle = '#FCFAF4';
      ctx.shadowColor = 'rgba(38, 33, 22, 0.18)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = (isSel ? 2.4 : 1.8) / cam.k;
      ctx.strokeStyle = n.color;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r - 3.2, 0, Math.PI * 2);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = n.tagColor || n.color;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = n.color;
      ctx.font = `600 ${Math.max(8, 10 / Math.sqrt(cam.k))}px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(U.initials(n.p.short || n.p.title), n.x, n.y + 0.5);

      const label = n.p.short || U.clip(n.p.title, 16);
      const fs = Math.max(9, 11 / Math.sqrt(cam.k));
      ctx.font = `500 ${fs}px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;
      const tw = ctx.measureText(label).width;
      const pad = 5;
      ctx.globalAlpha = isHover || isSel ? 0.98 : 0.82;
      ctx.fillStyle = '#FCFAF4';
      roundRect(n.x - tw / 2 - pad, n.y + n.r + 5, tw + pad * 2, fs + 7, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(203, 191, 166, 0.7)';
      ctx.lineWidth = 0.7 / cam.k;
      ctx.stroke();
      ctx.fillStyle = isSel ? '#8d2a1e' : '#4a463b';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, n.x, n.y + n.r + 5 + (fs + 7) / 2);
      ctx.restore();
    }

    function draw() {
      if (destroyed) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2 + cam.x, H / 2 + cam.y);
      ctx.scale(cam.k, cam.k);

      if (grouped) drawGroups();
      edges.forEach(drawEdge);
      nodes.forEach(drawNode);

      ctx.restore();
    }

    function frame() {
      if (destroyed) return;
      tick();
      draw();
      raf = requestAnimationFrame(frame);
    }

    /* ---------------- pointer interaction ---------------- */

    let drag = null;
    let lastPointer = null;

    function localPos(e) {
      const r = canvas.getBoundingClientRect();
      return { px: e.clientX - r.left, py: e.clientY - r.top };
    }

    function onDown(e) {
      const { px, py } = localPos(e);
      const w = screenToWorld(px, py);
      const node = hitTest(w);
      canvas.setPointerCapture(e.pointerId);
      if (node) {
        drag = { mode: 'node', node, sx: px, sy: py, ox: node.x, oy: node.y, moved: false };
        node.fixed = true;
        canvas.classList.add('grabbing');
      } else {
        drag = { mode: 'pan', sx: px, sy: py, cx: cam.x, cy: cam.y, moved: false };
        canvas.classList.add('grabbing');
      }
      lastPointer = { px, py };
    }

    function onMove(e) {
      const { px, py } = localPos(e);
      if (drag) {
        if (drag.mode === 'node') {
          const w = screenToWorld(px, py);
          drag.node.x = w.x;
          drag.node.y = w.y;
          drag.node.vx = 0;
          drag.node.vy = 0;
          alpha = Math.max(alpha, 0.3);
        } else {
          cam.x = drag.cx + (px - drag.sx);
          cam.y = drag.cy + (py - drag.sy);
        }
        if (Math.abs(px - drag.sx) + Math.abs(py - drag.sy) > 4) drag.moved = true;
        return;
      }
      const w = screenToWorld(px, py);
      const node = hitTest(w);
      hover = node;
      canvas.style.cursor = node ? 'pointer' : 'grab';
    }

    function onUp(e) {
      if (!drag) return;
      const moved = drag.moved;
      if (drag.mode === 'node') {
        drag.node.fixed = false;
        if (!moved) {
          selected = drag.node.id;
          onSelect(selected);
        }
      } else if (!moved) {
        selected = null;
        onSelect(null);
      }
      drag = null;
      canvas.classList.remove('grabbing');
    }

    function onWheel(e) {
      e.preventDefault();
      const { px, py } = localPos(e);
      const w = screenToWorld(px, py);
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      cam.k = U.clamp(cam.k * factor, 0.3, 3);
      cam.x = px - W / 2 - w.x * cam.k;
      cam.y = py - H / 2 - w.y * cam.k;
    }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', () => {
      if (!drag) {
        hover = null;
        canvas.style.cursor = 'grab';
      }
    });
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', () => fit(true));

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    resize();
    fit(false);
    // Let the force simulation settle, then refit once so the graph fills the
    // canvas instead of staying at the compact initial layout.
    const fitTimer = setTimeout(() => fit(false), 900);
    frame();

    return {
      fit: () => fit(true),
      setThreshold(v) {
        threshold = v;
        if (threshold < 0.14) alpha = Math.max(alpha, 0.25);
        draw();
      },
      select(id) {
        selected = id || null;
        draw();
      },
      destroy() {
        destroyed = true;
        clearTimeout(fitTimer);
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('wheel', onWheel);
      },
    };
  }

  PW.graph = { mount };
})();
