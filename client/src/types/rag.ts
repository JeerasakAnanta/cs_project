// Shared RAG response types for chatbot communication

export interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}
