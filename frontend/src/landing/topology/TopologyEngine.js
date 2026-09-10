import {
  TOPOLOGY_NODES,
  TOPOLOGY_EDGES,
  CODE_LINES,
  GRAPH_LAYOUT,
  segmentProgress
} from './topologyData';

const INK = '#1D1D1F';
const MUTED = '#6E6E73';
const FAINT = 'rgba(29, 29, 31, 0.28)';
const BRAND = '#4F46E5';
const BRAND_SOFT = 'rgba(79, 70, 229, 0.14)';
const SURFACE = '#FBFBFD';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default class TopologyEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.progress = 0;
    this.hoverId = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.nodes = [];
    this.pointer = { x: 0, y: 0 };
    this.needsDraw = true;
    this.reduced = false;
  }

  setReduced(reduced) {
    this.reduced = reduced;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.dpr = dpr;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.layoutNodes();
    this.needsDraw = true;
  }

  layoutNodes() {
    const padX = this.width * (this.width < 720 ? 0.08 : 0.16);
    const padY = this.height * 0.14;
    const usableW = this.width - padX * 2;
    const usableH = this.height - padY * 2;

    this.nodes = TOPOLOGY_NODES.map((node, i) => {
      const graph = GRAPH_LAYOUT[node.id];
      const codeX = this.width * (this.width < 720 ? 0.12 : 0.22);
      const codeY = padY + (i / Math.max(1, TOPOLOGY_NODES.length - 1)) * usableH * 0.72;
      return {
        ...node,
        codeX,
        codeY,
        graphX: padX + graph.x * usableW,
        graphY: padY + graph.y * usableH
      };
    });
  }

  setProgress(progress) {
    this.progress = clamp01(progress);
    this.needsDraw = true;
  }

  setPointer(x, y) {
    this.pointer.x = x;
    this.pointer.y = y;
    const hit = this.hitTest(x, y);
    if (hit !== this.hoverId) {
      this.hoverId = hit;
      this.needsDraw = true;
    }
    return hit;
  }

  hitTest(x, y) {
    const lift = easeInOut(segmentProgress(this.progress, 0.16, 0.36));
    if (lift < 0.35) return null;
    let best = null;
    let bestDist = 28;
    for (const node of this.nodes) {
      const px = lerp(node.codeX, node.graphX, lift);
      const py = lerp(node.codeY, node.graphY, lift);
      const d = Math.hypot(px - x, py - y);
      if (d < bestDist) {
        bestDist = d;
        best = node.id;
      }
    }
    return best;
  }

  getHoveredNode() {
    return this.nodes.find((n) => n.id === this.hoverId) || null;
  }

  draw() {
    if (!this.needsDraw && !this.reduced) return;
    this.needsDraw = false;

    const { ctx, width, height, progress } = this;
    ctx.clearRect(0, 0, width, height);

    const lift = easeInOut(segmentProgress(progress, 0.16, 0.36));
    const connect = easeInOut(segmentProgress(progress, 0.3, 0.5));
    const layer = easeInOut(segmentProgress(progress, 0.42, 0.62));
    const understand = easeInOut(segmentProgress(progress, 0.54, 0.7));
    const change = easeInOut(segmentProgress(progress, 0.66, 0.84));
    const collapse = easeInOut(segmentProgress(progress, 0.84, 1));
    const codeFade = 1 - lift;

    this.drawGrid(ctx, width, height, 0.18 + layer * 0.12);

    if (codeFade > 0.04) {
      this.drawCodeColumn(ctx, codeFade);
    }

    if (layer > 0.02) {
      this.drawIntelligenceField(ctx, layer * (1 - collapse));
    }

    if (connect > 0.02) {
      this.drawEdges(ctx, lift, connect * (1 - collapse * 0.85));
    }

    this.drawNodes(ctx, lift, understand, change, collapse);

    if (collapse > 0.15) {
      this.drawCenterMark(ctx, collapse);
    }
  }

  drawGrid(ctx, width, height, alpha) {
    ctx.save();
    ctx.strokeStyle = `rgba(29, 29, 31, ${0.035 + alpha * 0.03})`;
    ctx.lineWidth = 1;
    const step = 48;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCodeColumn(ctx, alpha) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.clip();
    ctx.globalAlpha = alpha;
    const x = this.width * (this.width < 720 ? 0.06 : 0.12);
    const fontSize = this.width < 420 ? 9 : 10;
    ctx.font = `500 ${fontSize}px JetBrains Mono, monospace`;
    ctx.fillStyle = MUTED;
    ctx.fillText('workspace / aethria-api', x, this.height * 0.1);
    ctx.fillStyle = FAINT;
    ctx.fillText('main · 6 files indexed', x, this.height * 0.1 + 16);

    CODE_LINES.forEach((line, i) => {
      const y = this.height * 0.16 + i * Math.min(26, this.height * 0.11);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.55)';
      ctx.fillText(String(i + 12).padStart(2, '0'), x, y);
      ctx.fillStyle = INK;
      const text = this.width < 520 ? line.slice(0, 28) + (line.length > 28 ? '…' : '') : line;
      ctx.fillText(text, x + 32, y);
    });
    ctx.restore();
  }

  nodePos(node, lift, collapse) {
    const x = lerp(node.codeX, node.graphX, lift);
    const y = lerp(node.codeY, node.graphY, lift);
    const cx = this.width / 2;
    const cy = this.height / 2;
    return {
      x: lerp(x, cx, collapse),
      y: lerp(y, cy, collapse)
    };
  }

  drawEdges(ctx, lift, strength) {
    ctx.save();
    ctx.lineWidth = 1;
    TOPOLOGY_EDGES.forEach(([aId, bId], i) => {
      const a = this.nodes.find((n) => n.id === aId);
      const b = this.nodes.find((n) => n.id === bId);
      if (!a || !b) return;
      const pa = this.nodePos(a, lift, 0);
      const pb = this.nodePos(b, lift, 0);
      const t = clamp01((strength - i * 0.08) / 0.7);
      if (t <= 0) return;
      ctx.strokeStyle = `rgba(79, 70, 229, ${0.18 + t * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      const mx = (pa.x + pb.x) / 2;
      const my = (pa.y + pb.y) / 2 - 24;
      ctx.quadraticCurveTo(mx, my, lerp(pa.x, pb.x, t), lerp(pa.y, pb.y, t));
      ctx.stroke();
    });
    ctx.restore();
  }

  drawIntelligenceField(ctx, amount) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = Math.min(this.width, this.height) * (0.22 + amount * 0.12);
    const g = ctx.createRadialGradient(cx, cy, 12, cx, cy, r);
    g.addColorStop(0, `rgba(79, 70, 229, ${0.16 * amount})`);
    g.addColorStop(0.55, `rgba(99, 102, 241, ${0.06 * amount})`);
    g.addColorStop(1, 'rgba(79, 70, 229, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = amount * 0.9;
    if (this.width >= 560) {
      ctx.font = '500 10px JetBrains Mono, monospace';
      ctx.fillStyle = BRAND;
      ctx.textAlign = 'center';
      ctx.fillText('PERSISTENT INTELLIGENCE LAYER', cx, cy - r * 0.72);
    }
    ctx.restore();
  }

  drawNodes(ctx, lift, understand, change, collapse) {
    this.nodes.forEach((node) => {
      const { x, y } = this.nodePos(node, lift, collapse);
      const hovered = this.hoverId === node.id;
      const modified = node.status === 'modified';
      const appear = clamp01(lift * 1.4);
      if (appear < 0.02) return;

      ctx.save();
      ctx.globalAlpha = appear * (1 - collapse * 0.92);

      ctx.beginPath();
      ctx.arc(x, y, hovered ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = hovered ? BRAND : INK;
      ctx.fill();
      ctx.strokeStyle = SURFACE;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (change > 0.2 && modified) {
        ctx.beginPath();
        ctx.arc(x, y, 14 + change * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(5, 150, 105, ${0.35 * change})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const labelAlpha = clamp01(understand + lift * 0.35);
      ctx.globalAlpha = appear * labelAlpha * (1 - collapse);
      ctx.font = `${hovered ? 600 : 500} ${this.width < 520 ? 9 : 11}px JetBrains Mono, monospace`;
      ctx.fillStyle = hovered ? BRAND : INK;
      ctx.textAlign = 'left';
      ctx.fillText(node.file, x + 10, y - 3);
      if (this.width >= 560) {
        ctx.font = '400 9px JetBrains Mono, monospace';
        ctx.fillStyle = MUTED;
        const meta =
          change > 0.45 && modified
            ? `${node.role}  ·  Δ modified`
            : understand > 0.4
              ? `${node.role}  ·  ${node.loc} loc`
              : node.path;
        ctx.fillText(meta, x + 10, y + 10);
      }

      ctx.restore();
    });
  }

  drawCenterMark(ctx, collapse) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    ctx.save();
    ctx.globalAlpha = clamp01((collapse - 0.2) / 0.5);
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = BRAND_SOFT;
    ctx.fill();
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.font = '600 11px JetBrains Mono, monospace';
    ctx.fillStyle = BRAND;
    ctx.textAlign = 'center';
    ctx.fillText('AETHRIA', cx, cy + 4);
    ctx.restore();
  }
}
