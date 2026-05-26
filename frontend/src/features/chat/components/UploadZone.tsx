import { useRef } from "react";

interface Props {
  filename: string | null;
  onUpload: (file: File) => void;
  disabled: boolean;
}

export default function UploadZone({ filename, onUpload, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #4f46e5",
          background: "#4f46e5",
          color: "white",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 14,
        }}
      >
        {filename ? "Upload a different PDF" : "Upload a PDF"}
      </button>
      {filename && (
        <span style={{ marginLeft: 12, color: "#374151", fontSize: 14 }}>
          📄 {filename}
        </span>
      )}
    </div>
  );
}