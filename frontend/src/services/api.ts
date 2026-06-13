const API_BASE_URL = "";

const getToken = (): string | null => localStorage.getItem("rag_token");

const withAuth = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() ?? ""}`,
});

// Helper: legge il JSON solo se il body non è vuoto
const safeJson = async (res: Response): Promise<any> => {
  const text = await res.text();
  if (!text || text.trim() === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

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

  // --- AUTH ---

  register: async (username: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.detail || "Errore nella registrazione");
    }
  },

  loginUser: async (username: string, password: string): Promise<{ access_token: string }> => {
    const body = new URLSearchParams({ username, password });
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.detail || "Credenziali non valide");
    }
    const data = await safeJson(res);
    if (!data?.access_token) throw new Error("Token non ricevuto dal server");
    return data;
  },

  // --- DOCUMENTI ---

  uploadDocument: async (file: File): Promise<{ task_id: string; message: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.detail || "Errore durante l'upload del file");
    }
    return safeJson(res);
  },

  checkTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      headers: withAuth(),
    });
    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.detail || "Errore nel recupero dello stato del task");
    }
    return safeJson(res);
  },

  // --- CHAT ---

  askQuestion: async (question: string): Promise<ChatResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: withAuth(),
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      const err = await safeJson(res);
      if (res.status === 401) throw new Error("Sessione scaduta. Riaccedi.");
      if (res.status === 404) throw new Error("Nessun documento trovato. Carica prima un file!");
      throw new Error(err?.detail || "Errore nella generazione della risposta");
    }
    return safeJson(res);
  },
};