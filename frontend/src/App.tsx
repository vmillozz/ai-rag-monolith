import { DocumentUploader } from "./components/DocumentUploader";
import { ChatWindow } from "./components/ChatWindow";
import {
  ShieldCheck,
  Database,
  Brain,
  FileText,
} from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur bg-slate-950/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center font-black text-xl">
              Rag
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Smart Enterprise Search
              </h1>

              <p className="text-slate-400 text-sm">
                Local AI • RAG Platform • Knowledge Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">
              GDPR Compliant
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h2 className="text-5xl font-bold mb-4">
            AI Search per Documenti Aziendali
          </h2>

          <p className="text-slate-400 text-lg max-w-3xl">
            Carica documenti interni, crea una knowledge base
            vettoriale e interroga i tuoi dati con un assistente AI
            completamente locale.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Database className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-semibold mb-2">
              Vector Database
            </h3>
            <p className="text-slate-400 text-sm">
              PostgreSQL + pgvector per ricerca semantica avanzata.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <Brain className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold mb-2">
              Local LLM
            </h3>
            <p className="text-slate-400 text-sm">
              Risposte generate solo dai documenti caricati.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <FileText className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="font-semibold mb-2">
              Knowledge Base
            </h3>
            <p className="text-slate-400 text-sm">
              PDF, TXT, Word e documentazione aziendale.
            </p>
          </div>
        </div>

        {/* Main */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <DocumentUploader />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">
                Come funziona
              </h3>

              <ol className="space-y-3 text-sm text-slate-300">
                <li>1. Carica i documenti aziendali.</li>
                <li>2. Il worker genera embeddings.</li>
                <li>3. PostgreSQL indicizza i dati.</li>
                <li>4. L'AI risponde usando solo le fonti reali.</li>
              </ol>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full">
              <ChatWindow />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;