import { Message } from "../types/chat";

interface Props {
  messages: Message[];
}

export default function MessageList({ messages }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: msg.role === "user" ? "#4f46e5" : "#f3f4f6",
              color: msg.role === "user" ? "white" : "#111827",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            {msg.content}
          </div>

          {msg.sources && msg.sources.length > 0 && (
            <details style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
              <summary style={{ cursor: "pointer" }}>
                {msg.sources.length} source(s)
              </summary>
              {msg.sources.map((s, j) => (
                <div
                  key={j}
                  style={{
                    marginTop: 6,
                    padding: 8,
                    background: "#fafafa",
                    borderLeft: "3px solid #4f46e5",
                    borderRadius: 4,
                  }}
                >
                  <strong>Page {s.page}</strong> · distance {s.distance.toFixed(3)}
                  <p style={{ margin: "4px 0 0" }}>{s.text}…</p>
                </div>
              ))}
            </details>
          )}
        </div>
      ))}
    </div>
  );
}