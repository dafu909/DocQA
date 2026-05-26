export interface Source {
  page: number;
  text: string;
  distance: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export interface UploadResponse {
  filename: string;
  num_pages: number;
  num_chunks: number;
  message: string;
}