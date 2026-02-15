"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    V86: any;
    emulator: any;
  }
}

export default function EmulatorDisplay() {
  const initialized = useRef(false);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(function initializeEmulator() {
    if (
      typeof window === "undefined" ||
      !screenRef.current ||
      initialized.current
    )
      return;

    const loadV86 = () => {
      if (window.V86) {
        startEmulator();
        return;
      }
      const script = document.createElement("script");
      script.src = "/libv86.js";
      script.async = true;
      script.onload = () => startEmulator();
      document.body.appendChild(script);
    };

    const startEmulator = () => {
      if (!window.V86 || !screenRef.current) return;

      window.emulator = new window.V86({
        wasm_path: "/v86.wasm",
        screen_container: screenRef.current,
        bios: {
          url: "/bios/seabios.bin",
        },
        vga_bios: {
          url: "/bios/vgabios.bin",
        },
        boot_order: "0x123", // Boot from CD-ROM first
        memory_size: 512 * 1024 * 1024, // 512MB RAM
        vga_memory_size: 64 * 1024 * 1024, // 64MB VGA RAM
        // See more: https://github.com/copy/v86/blob/master/docs/networking.md
        net_device: {
          type: "virtio",
          relay_url: "wisps://wisp.mercurywork.shop",
        },
        hda: {
          url: "/images/alpine-dev.img",
          async: true,
          size: 1073741824
        },
        // cdrom: {
        //   url: "/images/alpine-dev.img",
        // },
        autostart: true,
      });
      initialized.current = true;
    };

    loadV86();

    return () => {
      if (window.emulator) {
        window.emulator.destroy();
        initialized.current = false;
      }
    };
  }, []);

  return (
    <div ref={screenRef} style={{ width: "100%", background: "#000" }}>
      <div
        style={{
          whiteSpace: "pre",
          font: "12px monospace",
          lineHeight: "14px",
        }}
      ></div>
      <canvas style={{ display: "none" }}></canvas>
    </div>
  );
}
