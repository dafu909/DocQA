import UploadZone from "./components/UploadZone";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import { useChat } from "./hooks/useChat";

export default function ChatView() {
  const { messages, filename, loading, error, handleUpload, handleAsk, reset } =
    useChat();

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "40px auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>DocQA</h1>
          <p style={{ color: "#6b7280", marginTop: 0, marginBottom: 24 }}>
            Upload a PDF and ask questions. Answers are grounded in the document
            with page citations.
          </p>
        </div>

        {filename && (
          <button
            onClick={reset}
            disabled={loading}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            ↺ Start over
          </button>
        )}
      </div>

      <UploadZone filename={filename} onUpload={handleUpload} disabled={loading} />

      {!filename && (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>
          Upload a PDF to get started.
        </p>
      )}

      {filename && <MessageList messages={messages} />}

      {loading && (
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 12 }}>Thinking…</p>
      )}
      {error && (
        <p style={{ color: "#dc2626", fontSize: 14, marginTop: 12 }}>{error}</p>
      )}

      {filename && <ChatInput onSend={handleAsk} disabled={loading} />}
    </div>
  );
}