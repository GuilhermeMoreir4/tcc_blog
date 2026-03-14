"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    V86: any;
    vmEmulator: any;
  }
}

type BootState = "booting" | "ready";

const ICON_SIZE = 52;
const PANEL_W = 700;
const PANEL_H = 460;
const TITLE_H = 36;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

/** Compute default panel position relative to the icon */
function defaultPanelPos(iconX: number, iconY: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const panelW = Math.min(PANEL_W, vw - 16);
  const totalH = TITLE_H + PANEL_H;

  const spaceRight = vw - (iconX + ICON_SIZE);
  const left =
    spaceRight >= panelW + 8
      ? iconX + ICON_SIZE + 8
      : Math.max(8, iconX - panelW - 8);

  const top = clamp(iconY, 8, vh - totalH - 8);

  return { x: left, y: top, w: panelW };
}

export default function VMWidget() {
  const [open, setOpen] = useState(false);
  // Icon position (bottom-right on init)
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  // Panel position (auto-calculated until user drags it)
  const [panelPos, setPanelPos] = useState<{ x: number; y: number; w: number } | null>(null);
  const panelDetached = useRef(false); // true once user drags the panel manually

  const [bootState, setBootState] = useState<BootState>("booting");
  const [bootProgress, setBootProgress] = useState(0);

  // Icon drag
  const iconDragging = useRef(false);
  const iconDragOffset = useRef({ x: 0, y: 0 });
  const iconMoved = useRef(false);

  // Panel drag
  const panelDragging = useRef(false);
  const panelDragOffset = useRef({ x: 0, y: 0 });

  const screenRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const serialBuf = useRef("");
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init positions
  useEffect(() => {
    const ix = window.innerWidth - ICON_SIZE - 24;
    const iy = window.innerHeight - ICON_SIZE - 24;
    setIconPos({ x: ix, y: iy });
    setPanelPos(defaultPanelPos(ix, iy));
  }, []);

  // When icon moves and panel is NOT detached, follow the icon
  const updatePanelFromIcon = useCallback((ix: number, iy: number) => {
    if (!panelDetached.current) {
      setPanelPos(defaultPanelPos(ix, iy));
    }
  }, []);

  // Start emulator immediately on mount
  useEffect(() => {
    if (initialized.current) return;

    const startEmulator = () => {
      if (!window.V86 || initialized.current || !screenRef.current) return;
      initialized.current = true;

      let prog = 0;
      progressTimer.current = setInterval(() => {
        prog = Math.min(prog + 1, 70);
        setBootProgress(prog);
        if (prog >= 70) {
          clearInterval(progressTimer.current!);
          progressTimer.current = null;
        }
      }, 200);

      window.vmEmulator = new window.V86({
        wasm_path: "/v86.wasm",
        screen_container: screenRef.current,
        bios: { url: "/bios/seabios.bin" },
        vga_bios: { url: "/bios/vgabios.bin" },
        boot_order: "0x123",
        memory_size: 512 * 1024 * 1024,
        vga_memory_size: 64 * 1024 * 1024,
        net_device: {
          type: "virtio",
          relay_url: "wisps://wisp.mercurywork.shop",
        },
        hda: {
          url: "/images/alpine-dev.img",
          async: true,
          size: 1073741824,
        },
        autostart: true,
      });

      window.vmEmulator.add_listener("emulator-ready", () => {
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
        setBootProgress(85);
      });

      window.vmEmulator.add_listener("serial0-output-byte", (byte: number) => {
        serialBuf.current += String.fromCharCode(byte);
        if (serialBuf.current.length > 512)
          serialBuf.current = serialBuf.current.slice(-256);
        if (
          serialBuf.current.includes("login:") ||
          serialBuf.current.includes("localhost")
        ) {
          setBootProgress(100);
          setBootState("ready");
        }
      });
    };

    if (window.V86) {
      startEmulator();
    } else {
      const existing = document.querySelector('script[src="/libv86.js"]');
      if (existing) {
        existing.addEventListener("load", startEmulator);
      } else {
        const script = document.createElement("script");
        script.src = "/libv86.js";
        script.async = true;
        script.onload = startEmulator;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Icon drag ──────────────────────────────────────────────
  const onIconPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!iconPos) return;
      iconDragging.current = true;
      iconMoved.current = false;
      iconDragOffset.current = { x: e.clientX - iconPos.x, y: e.clientY - iconPos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [iconPos]
  );

  const onIconPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!iconDragging.current || !iconPos) return;
      const nx = clamp(e.clientX - iconDragOffset.current.x, 0, window.innerWidth - ICON_SIZE);
      const ny = clamp(e.clientY - iconDragOffset.current.y, 0, window.innerHeight - ICON_SIZE);
      if (Math.abs(nx - iconPos.x) > 4 || Math.abs(ny - iconPos.y) > 4)
        iconMoved.current = true;
      setIconPos({ x: nx, y: ny });
      updatePanelFromIcon(nx, ny);
    },
    [iconPos, updatePanelFromIcon]
  );

  const onIconPointerUp = useCallback(() => {
    if (iconDragging.current && !iconMoved.current) setOpen((o) => !o);
    iconDragging.current = false;
  }, []);

  // ── Panel title-bar drag ───────────────────────────────────
  const onPanelPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!panelPos) return;
      panelDragging.current = true;
      panelDragOffset.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [panelPos]
  );

  const onPanelPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!panelDragging.current || !panelPos) return;
      panelDetached.current = true;
      const nx = clamp(e.clientX - panelDragOffset.current.x, 0, window.innerWidth - panelPos.w);
      const ny = clamp(e.clientY - panelDragOffset.current.y, 0, window.innerHeight - TITLE_H - 8);
      setPanelPos((p) => p ? { ...p, x: nx, y: ny } : p);
    },
    [panelPos]
  );

  const onPanelPointerUp = useCallback(() => {
    panelDragging.current = false;
  }, []);

  // SVG progress ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dash = (bootProgress / 100) * circumference;
  const isReady = bootState === "ready";

  if (!iconPos || !panelPos) return null;

  return (
    <>
      {/* Floating draggable icon */}
      <button
        onPointerDown={onIconPointerDown}
        onPointerMove={onIconPointerMove}
        onPointerUp={onIconPointerUp}
        style={{
          position: "fixed",
          left: iconPos.x,
          top: iconPos.y,
          zIndex: 9999,
          cursor: "grab",
          background: "none",
          border: "none",
          padding: 0,
          touchAction: "none",
          width: ICON_SIZE,
          height: ICON_SIZE,
        }}
        title={isReady ? "Abrir terminal Alpine Linux" : `Iniciando VM… ${bootProgress}%`}
        aria-label="Terminal Alpine Linux"
      >
        <svg
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <circle
            cx={ICON_SIZE / 2}
            cy={ICON_SIZE / 2}
            r={radius}
            fill="rgba(0,0,0,0.45)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={3}
          />
          <circle
            cx={ICON_SIZE / 2}
            cy={ICON_SIZE / 2}
            r={radius}
            fill="none"
            stroke={isReady ? "#86efac" : "#f59e0b"}
            strokeWidth={3}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${ICON_SIZE / 2} ${ICON_SIZE / 2})`}
            style={{
              transition: "stroke-dasharray 0.35s ease, stroke 0.5s",
              filter: isReady ? "drop-shadow(0 0 5px #86efac)" : "drop-shadow(0 0 5px #f59e0b)",
            }}
          />
          <image
            href="https://terraria.wiki.gg/images/thumb/Map_Icon_Wall_of_Flesh.png/25px-Map_Icon_Wall_of_Flesh.png?670a42"
            x={(ICON_SIZE - 30) / 2}
            y={(ICON_SIZE - 30) / 2}
            width={30}
            height={30}
            style={{ imageRendering: "pixelated" }}
          />
        </svg>
      </button>

      {/* Terminal panel — always in DOM, display toggled */}
      <div
        style={{
          position: "fixed",
          left: panelPos.x,
          top: panelPos.y,
          width: panelPos.w,
          zIndex: 9998,
          background: "#000",
          border: "1px solid rgba(161,126,64,0.4)",
          borderRadius: 8,
          boxShadow: "0 8px 40px rgba(0,0,0,0.85)",
          overflow: "hidden",
          display: open ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        {/* Draggable title bar */}
        <div
          onPointerDown={onPanelPointerDown}
          onPointerMove={onPanelPointerMove}
          onPointerUp={onPanelPointerUp}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            height: TITLE_H,
            background: "#111",
            borderBottom: "1px solid rgba(161,126,64,0.3)",
            flexShrink: 0,
            cursor: "move",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "#a17e40",
              letterSpacing: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              pointerEvents: "none",
            }}
          >
            Alpine Linux — Terminal
            {!isReady && (
              <span style={{ color: "#f59e0b", fontSize: 11 }}>
                iniciando… {bootProgress}%
              </span>
            )}
            {isReady && (
              <span style={{ color: "#86efac", fontSize: 11 }}>● pronto</span>
            )}
          </span>
          <button
            onPointerDown={(e) => e.stopPropagation()} // don't start panel drag
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: "0 2px",
            }}
            aria-label="Fechar terminal"
          >
            ✕
          </button>
        </div>

        {/* V86 screen — never unmounts */}
        <div
          ref={screenRef}
          style={{ flex: 1, height: PANEL_H, background: "#000" }}
        >
          <div style={{ whiteSpace: "pre", font: "12px monospace", lineHeight: "14px" }} />
          <canvas style={{ display: "none" }} />
        </div>
      </div>
    </>
  );
}
