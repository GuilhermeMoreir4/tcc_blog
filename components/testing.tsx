"use client";

import { useState, useRef, useEffect } from "react";

interface TestingProps {
  answer: string;
  children?: React.ReactNode;
}

type Status = "idle" | "correct" | "wrong" | "revealed";

export default function Testing({ answer, children }: TestingProps) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalise = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const handleCheck = () => {
    if (!input.trim()) return;
    const correct = normalise(input) === normalise(answer);
    setAttempts((a) => a + 1);
    setStatus(correct ? "correct" : "wrong");

    if (!correct && attempts >= 1) {
      setShowHint(true);
    }
  };

  const handleReveal = () => {
    setStatus("revealed");
    setInput(answer);
  };

  const handleReset = () => {
    setInput("");
    setStatus("idle");
    setAttempts(0);
    setShowHint(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  // Blink cursor effect
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  const borderColor =
    status === "correct"
      ? "#00ff88"
      : status === "wrong"
        ? "#ff4444"
        : status === "revealed"
          ? "#ffaa00"
          : "#2a2a3a";

  const glowColor =
    status === "correct"
      ? "0 0 12px #00ff8844"
      : status === "wrong"
        ? "0 0 12px #ff444433"
        : status === "revealed"
          ? "0 0 12px #ffaa0033"
          : "none";

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        backgroundColor: "#0d0d14",
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        padding: "1.25rem 1.5rem",
        margin: "1.5rem 0",
        boxShadow: glowColor,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            color: "#444",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          ▸ verificar resposta
        </span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "#1e1e2e" }} />
        {attempts > 0 && (
          <span style={{ color: "#444", fontSize: "0.65rem" }}>
            {attempts} tentativa{attempts !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Hint / children */}
      {children && showHint && status !== "correct" && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: "#12121e",
            border: "1px solid #1e1e3a",
            borderLeft: "3px solid #ffaa00",
            borderRadius: "4px",
            padding: "0.6rem 0.9rem",
            marginBottom: "1rem",
            fontSize: "0.8rem",
            color: "#aaa",
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              color: "#ffaa00",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
            }}
          >
            DICA{" "}
          </span>
          {children}
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            color:
              status === "correct"
                ? "#00ff88"
                : status === "wrong"
                  ? "#ff4444"
                  : "#555",
            fontSize: "0.85rem",
            userSelect: "none",
            minWidth: "1rem",
          }}
        >
          {status === "correct"
            ? "✓"
            : status === "wrong"
              ? "✗"
              : status === "revealed"
                ? "◎"
                : "$"}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (status === "wrong") setStatus("idle");
          }}
          onKeyDown={handleKeyDown}
          disabled={status === "correct" || status === "revealed"}
          placeholder="sua resposta aqui..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color:
              status === "correct"
                ? "#00ff88"
                : status === "wrong"
                  ? "#ff6666"
                  : status === "revealed"
                    ? "#ffaa00"
                    : "#c8c8d8",
            fontSize: "0.875rem",
            fontFamily: "inherit",
            caretColor: "#00ff88",
          }}
        />

        {/* Fake blinking cursor when focused and idle */}
        {status === "idle" && !input && (
          <span
            style={{
              color: "#00ff88",
              opacity: blink ? 1 : 0,
              fontSize: "0.875rem",
              marginLeft: "-0.5rem",
              pointerEvents: "none",
              transition: "opacity 0.1s",
            }}
          >
            ▌
          </span>
        )}
      </div>

      {/* Status message */}
      {status !== "idle" && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: "0.75rem",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            color:
              status === "correct"
                ? "#00ff88"
                : status === "wrong"
                  ? "#ff6666"
                  : "#ffaa00",
          }}
        >
          {status === "correct" && "// resposta correta! ✓"}
          {status === "wrong" && "// resposta incorreta. tente novamente."}
          {status === "revealed" && `// resposta revelada: ${answer}`}
        </div>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        {status !== "correct" && status !== "revealed" && (
          <button
            onClick={handleCheck}
            disabled={!input.trim()}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #2a2a4a",
              borderRadius: "4px",
              color: input.trim() ? "#c8c8d8" : "#444",
              fontSize: "0.75rem",
              fontFamily: "inherit",
              padding: "0.35rem 0.85rem",
              cursor: input.trim() ? "pointer" : "not-allowed",
              letterSpacing: "0.08em",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (input.trim()) {
                (e.target as HTMLButtonElement).style.borderColor = "#4a4a7a";
                (e.target as HTMLButtonElement).style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#2a2a4a";
              (e.target as HTMLButtonElement).style.color = input.trim()
                ? "#c8c8d8"
                : "#444";
            }}
          >
            verificar
          </button>
        )}

        {status !== "correct" && status !== "revealed" && (
          <button
            onClick={handleReveal}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #2a2a3a",
              borderRadius: "4px",
              color: "#555",
              fontSize: "0.75rem",
              fontFamily: "inherit",
              padding: "0.35rem 0.85rem",
              cursor: "pointer",
              letterSpacing: "0.08em",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#ffaa0066";
              (e.target as HTMLButtonElement).style.color = "#ffaa00";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#2a2a3a";
              (e.target as HTMLButtonElement).style.color = "#555";
            }}
          >
            revelar
          </button>
        )}

        {(status === "correct" ||
          status === "wrong" ||
          status === "revealed") && (
          <button
            onClick={handleReset}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #2a2a3a",
              borderRadius: "4px",
              color: "#555",
              fontSize: "0.75rem",
              fontFamily: "inherit",
              padding: "0.35rem 0.85rem",
              cursor: "pointer",
              letterSpacing: "0.08em",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#4a4a6a";
              (e.target as HTMLButtonElement).style.color = "#aaa";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#2a2a3a";
              (e.target as HTMLButtonElement).style.color = "#555";
            }}
          >
            tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
