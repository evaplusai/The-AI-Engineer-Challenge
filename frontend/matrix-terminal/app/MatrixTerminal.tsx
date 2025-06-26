"use client";
import React, { useRef, useEffect, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * MatrixTerminal renders a fullscreen canvas with Matrix rain effect and a terminal overlay for chat.
 */
const MatrixTerminal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userMessage, setUserMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Matrix characters (binary only)
    const letters = "01";
    const fontSize = 18;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops = Array(columns).fill(1);

    // Animation loop
    let animationId: number;
    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = "#00FF41";
      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isLoading]);

  // Handle chat form submission and stream response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    setIsLoading(true);
    setChat((prev) => [...prev, { role: "user", content: userMessage }]);
    setUserMessage("");
    try {
      const apiUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:8000/api/chat"
        : "/api/chat";
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_message: "You are a helpful assistant in a Matrix terminal.",
          user_message: userMessage,
          api_key: apiKey,
        }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = "";
      let isFirstChunk = true;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          setChat((prev) => {
            // If last message is assistant, append chunk; otherwise, add new assistant message
            if (prev.length && prev[prev.length - 1].role === "assistant") {
              return [
                ...prev.slice(0, -1),
                { role: "assistant", content: prev[prev.length - 1].content + chunk },
              ];
            } else {
              return [...prev, { role: "assistant", content: chunk }];
            }
          });
        }
      }
    } catch (err) {
      setChat((prev) => [...prev, { role: "assistant", content: `[Error] ${err instanceof Error ? err.message : String(err)}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Matrix rain canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "black",
          zIndex: 1,
        }}
        aria-label="Matrix terminal animation"
      />
      {/* API Key input at top right */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 3,
          background: "rgba(0,0,0,0.85)",
          border: "1px solid #00FF41",
          borderRadius: 8,
          padding: 12,
          minWidth: 220,
          color: "#00FF41",
          fontFamily: "monospace",
          fontSize: 14,
          boxShadow: "0 0 8px #00FF41",
        }}
      >
        <label style={{ color: "#00FF41", fontFamily: "monospace", fontWeight: "bold" }}>
          API Key
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            required
            style={{
              width: "100%",
              marginTop: 4,
              background: "#111",
              color: "#00FF41",
              border: "1px solid #00FF41",
              borderRadius: 4,
              padding: 8,
              fontFamily: "monospace",
            }}
            autoComplete="off"
          />
        </label>
      </div>
      {/* Chat overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          minHeight: "100vh",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          pointerEvents: "none",
        }}
      >
        {/* Chat window */}
        <div
          style={{
            background: "rgba(0,0,0,0.85)",
            border: "1px solid #00FF41",
            borderRadius: 8,
            padding: 24,
            marginBottom: 16,
            minWidth: 320,
            maxWidth: 640,
            width: "90vw",
            color: "#00FF41",
            fontFamily: "monospace",
            fontSize: 16,
            boxShadow: "0 0 16px #00FF41",
            pointerEvents: "auto",
            maxHeight: "40vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {chat.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                background: msg.role === "user" ? "#00FF41" : "rgba(0,0,0,0.7)",
                color: msg.role === "user" ? "#111" : "#00FF41",
                borderRadius: 8,
                padding: "8px 16px",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
                boxShadow: msg.role === "user" ? "0 0 8px #00FF41" : undefined,
              }}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div style={{ color: "#00FF41", opacity: 0.7 }}>Streaming...</div>
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Terminal-style chat input at the bottom */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(0,0,0,0.95)",
            border: "1px solid #00FF41",
            borderRadius: 8,
            padding: 0,
            marginBottom: 32,
            minWidth: 320,
            maxWidth: 640,
            width: "90vw",
            boxShadow: "0 0 16px #00FF41",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 0,
          }}
        >
          <span style={{
            color: "#00FF41",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: 18,
            padding: "0 12px",
            userSelect: "none"
          }}>
            $&nbsp;
          </span>
          <input
            type="text"
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            required
            style={{
              flex: 1,
              background: "#111",
              color: "#00FF41",
              border: "none",
              outline: "none",
              fontFamily: "monospace",
              fontSize: 18,
              padding: "16px 8px",
              borderRadius: 0,
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading ? "#222" : "#00FF41",
              color: isLoading ? "#00FF41" : "#111",
              border: "none",
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              padding: "16px 24px",
              fontFamily: "monospace",
              fontWeight: "bold",
              fontSize: 18,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.2s, color 0.2s",
              borderLeft: "1px solid #00FF41",
            }}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </>
  );
};

export default MatrixTerminal; 