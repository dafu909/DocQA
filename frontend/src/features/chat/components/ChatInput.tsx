import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  const send = () => {
    onSend(text);
    setText("");
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) send();
        }}
        placeholder="Ask a question about the document…"
        disabled={disabled}
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          fontSize: 15,
        }}
      />
      <button
        onClick={send}
        disabled={disabled}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          background: disabled ? "#9ca3af" : "#4f46e5",
          color: "white",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 15,
        }}
      >
        Send
      </button>
    </div>
  );
}