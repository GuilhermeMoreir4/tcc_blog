"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    V86: any;
    vmEmulator: any;
  }
}

type BootState = "booting" | "ready";
type ResizeEdge = "e" | "s" | "se" | null;

const DB_NAME = "vm-state-db";
const DB_STORE = "states";
const DB_KEY = "alpine-boot";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadState(): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const get = tx.objectStore(DB_STORE).get(DB_KEY);
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveState(buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(buffer, DB_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

const ICON_SIZE = 52;
const MIN_W = 320;
const MIN_H = 200;
const TITLE_H = 36;
const HANDLE_SIZE = 8; // px hit area for resize handles

function playReadyChime() {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.12 + 0.18,
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.2);
    });
  } catch {
    // AudioContext not available
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

/** Panel position + size */
type PanelState = { x: number; y: number; w: number; h: number };

function defaultPanelState(iconX: number, iconY: number): PanelState {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(700, vw - 16);
  const h = Math.min(460, vh - TITLE_H - 16);

  const spaceRight = vw - (iconX + ICON_SIZE);
  const x =
    spaceRight >= w + 8 ? iconX + ICON_SIZE + 8 : Math.max(8, iconX - w - 8);

  const y = clamp(iconY, 8, vh - TITLE_H - h - 8);

  return { x, y, w, h };
}

export default function VMWidget() {
  const [open, setOpen] = useState(false);
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const panelDetached = useRef(false);

  const [bootState, setBootState] = useState<BootState>("booting");
  const [bootProgress, setBootProgress] = useState(0);

  // Icon drag
  const iconDragging = useRef(false);
  const iconDragOffset = useRef({ x: 0, y: 0 });
  const iconMoved = useRef(false);

  // Panel drag
  const panelDragging = useRef(false);
  const panelDragOffset = useRef({ x: 0, y: 0 });

  // Panel resize
  const resizing = useRef<ResizeEdge>(null);
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0 });

  const screenRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const serialBuf = useRef("");
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init positions
  useEffect(() => {
    const ix = window.innerWidth - ICON_SIZE - 24;
    const iy = window.innerHeight - ICON_SIZE - 24;
    setIconPos({ x: ix, y: iy });
    setPanel(defaultPanelState(ix, iy));
  }, []);

  // Toast + sound when VM becomes ready
  useEffect(() => {
    if (bootState !== "ready") return;
    playReadyChime();
    toast.success("Estou pronto!", {
      description:
        "A máquina virtual está inicializada e aguardando seus comandos.",
      className: "border-2 border-solid",
      icon: (
        <img
          src="https://terraria.wiki.gg/images/thumb/Map_Icon_Wall_of_Flesh.png/25px-Map_Icon_Wall_of_Flesh.png?670a42"
          alt="Wall of Flesh"
          style={{ width: 20, height: 20, imageRendering: "pixelated" }}
        />
      ),
      duration: 500000,
    });
  }, [bootState]);

  // When icon moves and panel is NOT detached, follow the icon
  const updatePanelFromIcon = useCallback((ix: number, iy: number) => {
    if (!panelDetached.current) {
      setPanel((p) =>
        p ? { ...defaultPanelState(ix, iy), w: p.w, h: p.h } : p,
      );
    }
  }, []);

  // ── Global resize listeners ────────────────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!resizing.current) return;
      const { mx, my, w, h } = resizeStart.current;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;
      setPanel((p) => {
        if (!p) return p;
        const newW =
          resizing.current === "s"
            ? p.w
            : clamp(w + dx, MIN_W, window.innerWidth - p.x - 8);
        const newH =
          resizing.current === "e"
            ? p.h
            : clamp(h + dy, MIN_H, window.innerHeight - p.y - 8);
        return { ...p, w: newW, h: newH };
      });
    };
    const onUp = () => {
      resizing.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Start emulator immediately on mount
  useEffect(() => {
    if (initialized.current) return;

    const startEmulator = async () => {
      if (!window.V86 || initialized.current || !screenRef.current) return;
      initialized.current = true;

      const savedState = await loadState();

      // With a saved state, boot is instant — skip the fake progress timer
      if (!savedState) {
        let prog = 0;
        progressTimer.current = setInterval(() => {
          prog = Math.min(prog + 1, 70);
          setBootProgress(prog);
          if (prog >= 70) {
            clearInterval(progressTimer.current!);
            progressTimer.current = null;
          }
        }, 200);
      }

      const options: Record<string, unknown> = {
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
          url:
            process.env.NODE_ENV === "development"
              ? "/images/alpine-dev.img"
              : "https://files.bootloader.blog/alpine-dev.img",
          async: true,
          size: 1073741824,
        },
        autostart: true,
      };

      if (savedState) {
        options.initial_state = { buffer: savedState };
      }

      window.vmEmulator = new window.V86(options);

      window.vmEmulator.add_listener("emulator-ready", () => {
        if (progressTimer.current) {
          clearInterval(progressTimer.current);
          progressTimer.current = null;
        }
        if (savedState) {
          // State restored — already at login prompt
          setBootProgress(100);
          setBootState("ready");
        } else {
          setBootProgress(85);
        }
      });

      let stateSaved = false;
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

          // Save state once after first successful boot
          if (!stateSaved) {
            stateSaved = true;
            window.vmEmulator.save_state((err: unknown, state: ArrayBuffer) => {
              if (!err) saveState(state);
            });
          }
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
      iconDragOffset.current = {
        x: e.clientX - iconPos.x,
        y: e.clientY - iconPos.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [iconPos],
  );

  const onIconPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!iconDragging.current || !iconPos) return;
      const nx = clamp(
        e.clientX - iconDragOffset.current.x,
        0,
        window.innerWidth - ICON_SIZE,
      );
      const ny = clamp(
        e.clientY - iconDragOffset.current.y,
        0,
        window.innerHeight - ICON_SIZE,
      );
      if (Math.abs(nx - iconPos.x) > 4 || Math.abs(ny - iconPos.y) > 4)
        iconMoved.current = true;
      setIconPos({ x: nx, y: ny });
      updatePanelFromIcon(nx, ny);
    },
    [iconPos, updatePanelFromIcon],
  );

  const onIconPointerUp = useCallback(() => {
    if (iconDragging.current && !iconMoved.current) setOpen((o) => !o);
    iconDragging.current = false;
  }, []);

  // ── Panel title-bar drag ───────────────────────────────────
  const onPanelPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!panel) return;
      panelDragging.current = true;
      panelDragOffset.current = {
        x: e.clientX - panel.x,
        y: e.clientY - panel.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [panel],
  );

  const onPanelPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!panelDragging.current || !panel) return;
      panelDetached.current = true;
      const nx = clamp(
        e.clientX - panelDragOffset.current.x,
        0,
        window.innerWidth - panel.w,
      );
      const ny = clamp(
        e.clientY - panelDragOffset.current.y,
        0,
        window.innerHeight - TITLE_H - 8,
      );
      setPanel((p) => (p ? { ...p, x: nx, y: ny } : p));
    },
    [panel],
  );

  const onPanelPointerUp = useCallback(() => {
    panelDragging.current = false;
  }, []);

  // ── Resize handle pointer down ─────────────────────────────
  const onResizePointerDown = useCallback(
    (edge: ResizeEdge) => (e: React.PointerEvent) => {
      if (!panel) return;
      e.stopPropagation();
      e.preventDefault();
      resizing.current = edge;
      resizeStart.current = {
        mx: e.clientX,
        my: e.clientY,
        w: panel.w,
        h: panel.h,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [panel],
  );

  // SVG progress ring
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dash = (bootProgress / 100) * circumference;
  const isReady = bootState === "ready";

  if (!iconPos || !panel) return null;

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
        title={
          isReady
            ? "Abrir terminal Alpine Linux"
            : `Iniciando VM… ${bootProgress}%`
        }
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
              filter: isReady
                ? "drop-shadow(0 0 5px #86efac)"
                : "drop-shadow(0 0 5px #f59e0b)",
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
          left: panel.x,
          top: panel.y,
          width: panel.w,
          height: TITLE_H + panel.h,
          zIndex: 9998,
          border: "1px solid rgba(161,126,64,0.4)",
          borderRadius: 8,
          boxShadow: "0 8px 40px rgba(0,0,0,0.85)",
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
            borderRadius: "8px 8px 0 0",
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
            onPointerDown={(e) => e.stopPropagation()}
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
          style={{
            flex: 1,
            height: panel.h,
            background: "#000",
            overflow: "auto",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <div
            style={{
              whiteSpace: "pre",
              font: "12px monospace",
              lineHeight: "14px",
            }}
          />
          <canvas style={{ display: "none" }} />
        </div>

        {/* ── Resize handles ── */}
        {/* Right edge */}
        <div
          onPointerDown={onResizePointerDown("e")}
          style={{
            position: "absolute",
            right: 0,
            top: TITLE_H,
            width: HANDLE_SIZE,
            bottom: HANDLE_SIZE,
            cursor: "ew-resize",
            touchAction: "none",
          }}
        />
        {/* Bottom edge */}
        <div
          onPointerDown={onResizePointerDown("s")}
          style={{
            position: "absolute",
            bottom: 0,
            left: HANDLE_SIZE,
            right: HANDLE_SIZE,
            height: HANDLE_SIZE,
            cursor: "ns-resize",
            touchAction: "none",
          }}
        />
        {/* Bottom-right corner */}
        <div
          onPointerDown={onResizePointerDown("se")}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: HANDLE_SIZE + 4,
            height: HANDLE_SIZE + 4,
            cursor: "nwse-resize",
            touchAction: "none",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            paddingBottom: 3,
            paddingRight: 3,
          }}
        >
          {/* Grip dots */}
          <svg
            width={10}
            height={10}
            viewBox="0 0 10 10"
            style={{ opacity: 0.35 }}
          >
            <circle cx={8} cy={8} r={1.2} fill="#a17e40" />
            <circle cx={4} cy={8} r={1.2} fill="#a17e40" />
            <circle cx={8} cy={4} r={1.2} fill="#a17e40" />
          </svg>
        </div>
      </div>
    </>
  );
}
