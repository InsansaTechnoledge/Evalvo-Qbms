// src/components/QbmsFlowShowcase.jsx
import React, { useLayoutEffect, useRef, useMemo } from "react";
import gsap from "gsap";

// Helper: default bubble radius based on label length
const radiusFor = (label = "") => {
  const len = String(label).replace(/\n/g, " ").length;
  return Math.max(40, Math.min(76, 26 + len * 2)); // 40..76
};

// Quadratic path between two points with a mild offset
const qPath = (x1, y1, x2, y2) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // perpendicular control point offset for a gentle curve
  const k = 0.18; // curvature
  const cx = mx - dy * k;
  const cy = my + dx * k;
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
};

export default function QbmsFlowShowcase({
  nodes = [],
  edges = [],
  viewBox = { w: 1200, h: 700 },
}) {
  const wrapRef = useRef(null);

  const { core, bubbles, nodeIndex } = useMemo(() => {
    const idx = new Map();
    nodes.forEach((n) => idx.set(n.id, n));
    const coreNode = nodes.find((n) => n.id === "core") || nodes[0];

    // Normalize bubble meta
    const bub = nodes
      .filter((n) => n.id !== coreNode.id)
      .map((n) => {
        const x = n.position?.x ?? 0;
        const y = n.position?.y ?? 0;
        const label = n.data?.label ?? n.id;
        const r = n.data?.r ?? radiusFor(label);
        return { id: n.id, x, y, r, label };
      });

    return { core: coreNode, bubbles: bub, nodeIndex: idx };
  }, [nodes]);

  const cardRect = useMemo(() => {
    // center the “glass” card on the core node's position; width from style.width or 320
    const w = Math.max(280, core?.style?.width || 320);
    const h = 360;
    const x = (core?.position?.x ?? 560) - w / 2; // position.x = center for nicer placement
    const y = (core?.position?.y ?? 320) - h / 2;
    return { x, y, w, h };
  }, [core]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // float bubbles
      gsap.utils.toArray(".qbms-bubble").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? 6 : -6,
          duration: 2.2 + (i % 5) * 0.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // line draw on mount
      gsap.utils.toArray(".qbms-line").forEach((path, i) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: 0.1 + i * 0.05,
          ease: "power2.out",
          repeat: -1
        });
      });

      // card pop
      gsap.from(".qbms-card", {
        opacity: 0,
        y: 12,
        scale: 0.98,
        duration: 0.4,
        yoyo: true,
        ease: "power2.out",
        // repeat: -1
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  // Build edge paths from your dataset
  const edgePaths = useMemo(() => {
    const paths = [];
    edges.forEach((e, i) => {
      const s = nodeIndex.get(e.source);
      const t = nodeIndex.get(e.target);
      if (!s || !t) return;

      // Start from node center/border; core targets route to the card boundary
      const sx = s.position?.x ?? 0;
      const sy = s.position?.y ?? 0;

      // If target is core, aim toward the nearest point on the card
      if (t.id === "core") {
        // Closest point on card rectangle to source
        const cx = Math.min(Math.max(sx, cardRect.x), cardRect.x + cardRect.w);
        const cy = Math.min(Math.max(sy, cardRect.y), cardRect.y + cardRect.h);
        paths.push({ id: e.id, d: qPath(sx, sy, cx, cy) });
      } else if (s.id === "core") {
        // From card to a non-core node: start at nearest card edge point
        const tx = t.position?.x ?? 0;
        const ty = t.position?.y ?? 0;
        const cx = Math.min(Math.max(tx, cardRect.x), cardRect.x + cardRect.w);
        const cy = Math.min(Math.max(ty, cardRect.y), cardRect.y + cardRect.h);
        paths.push({ id: e.id, d: qPath(cx, cy, tx, ty) });
      } else {
        // non-core to non-core
        const tx = t.position?.x ?? 0;
        const ty = t.position?.y ?? 0;
        paths.push({ id: e.id, d: qPath(sx, sy, tx, ty) });
      }
    });
    return paths;
  }, [edges, nodeIndex, cardRect]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden  rounded-3xl mt-20  "
      style={{ minHeight: viewBox.h }}
    >
      {/* SVG connectors (behind everything) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {edgePaths.map((p) => (
          <path
            key={p.id}
            className="qbms-line"
            d={p.d}
            fill="none"
            stroke="rgb(59,130,246)"
            strokeOpacity="0.6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 10"
            filter="url(#glow)"
          />
        ))}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgb(59,130,246)" floodOpacity="0.35" />
          </filter>
        </defs>
      </svg>

      {/* Core glass card */}
      <div
        className="qbms-card absolute"
        style={{ left: cardRect.x, top: cardRect.y, width: cardRect.w, height: cardRect.h }}
      >
        <div className="h-full w-full rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-lg">
          {/* <div className="flex items-center gap-2 mb-4">
            <span className="h-3 w-3 rounded-full bg-indigo-500" />
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="h-3 w-3 rounded-full bg-rose-500" />
          </div>

        
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-snug mb-3">
            {core?.data?.label || "QBMS Core"}
          </h3>

         
          <MetricCard
            title="Question Bank Growth"
            points={[{ x: 10, y: 70 }, { x: 60, y: 50 }, { x: 120, y: 42 }, { x: 180, y: 30 }, { x: 240, y: 22 }]}
            delta="+899"
          />
          <div className="mt-6">
            <MetricCard
              title="Faculty Adoption"
              points={[{ x: 10, y: 80 }, { x: 60, y: 68 }, { x: 120, y: 58 }, { x: 180, y: 40 }, { x: 240, y: 30 }]}
              delta="↑ 73%"
            />
          </div> */}
        </div>
      </div>

      {/* Bubbles for every non-core node */}
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="qbms-bubble absolute flex items-center justify-center rounded-full border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          style={{
            left: b.x - b.r,
            top: b.y - b.r,
            width: b.r * 2,
            height: b.r * 2,
            filter: "drop-shadow(0 8px 26px rgba(0,0,0,0.10))",
          }}
          title={b.label}
        >
          <span className="text-[12px] md:text-sm font-semibold text-neutral-800 dark:text-neutral-100 px-3 text-center leading-tight whitespace-pre-line">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}


