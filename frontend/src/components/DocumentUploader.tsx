import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const DocumentUploader: React.FC = () => {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setLoading(true);
    setError("");
    setStatus("Caricamento file...");

    try {
      // 1. Upload alle API
      const data = await apiService.uploadDocument(file);
      const taskId = data.task_id;
      setStatus("File registrato. L'AI sta analizzando e indicizzando il testo...");

      // 2. Polling dello stato di Celery ogni 2 secondi
      const interval = setInterval(async () => {
        try {
          const taskData = await apiService.checkTaskStatus(taskId);
          
          if (taskData.status === "SUCCESS") {
            setStatus("Documento elaborato e pronto per la chat!");
            setLoading(false);
            clearInterval(interval);
          } else if (taskData.status === "FAILURE") {
            setError("Il worker ha riscontrato un errore nell'elaborazione.");
            setLoading(false);
            clearInterval(interval);
          }
        } catch (err) {
          setError("Errore nel tracciare l'elaborazione.");
          setLoading(false);
          clearInterval(interval);
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Errore durante l'upload");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Knowledge Base Aziendale</h2>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
        <div className="flex flex-col items-center justify-center space-y-2">
          {loading ? (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <p className="text-sm text-gray-600 font-medium">Trascina o clicca per caricare un file .txt</p>
          <p className="text-xs text-gray-400">Massimo 10MB</p>
        </div>
        <input type="file" accept=".txt" className="hidden" onChange={handleFileChange} disabled={loading} />
      </label>

      {status && !error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
          {!loading && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />}
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};