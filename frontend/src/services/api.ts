const API_BASE_URL = "http://localhost:8000";

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  result?: {
    status: string;
    document_id?: number;
    chunks_processed?: number;
    error?: string;
  };
}

export const apiService = {
  // 1. Carica il documento (restituisce il task_id di Celery)
  uploadDocument: async (file: File): Promise<{ task_id: string; message: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Errore durante l'upload del file");
    return response.json();
  },

  // 2. Controlla lo stato del Task in background
  checkTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
    if (!response.ok) throw new Error("Errore nel recupero dello stato del task");
    return response.json();
  },

  // 3. Invia la domanda alla Chat RAG
  askQuestion: async (question: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error("Nessun documento trovato. Carica prima un file!");
      throw new Error("Errore nella generazione della risposta");
    }
    return response.json();
  }
};