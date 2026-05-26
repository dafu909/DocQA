import { useState } from "react";
import { Message } from "../types/chat";
import { uploadPdf, askQuestion } from "../api";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadPdf(file);
      setFilename(res.filename);
      setMessages([]); 
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);
    setError(null);

    try {
      const res = await askQuestion(question);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setFilename(null);
    setError(null);
  };

  return { messages, filename, loading, error, handleUpload, handleAsk, reset };
}