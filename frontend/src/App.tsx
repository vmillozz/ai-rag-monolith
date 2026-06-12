import { DocumentUploader } from "./components/DocumentUploader";
import { ChatWindow } from "./components/ChatWindow";
import { ShieldCheck, Database, Brain, FileText } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur bg-slate-950/90 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-sm tracking-tight">
              RAG
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Smart Enterprise Search</h1>
              <p className="text-slate-500 text-xs">Local AI · RAG Platform · Knowledge Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-medium">GDPR Compliant</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-300 text-xs font-medium mb-6">
          <Brain className="w-3.5 h-3.5" />
          Alimentato da Ollama · llama3 + nomic-embed-text
        </div>

        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          AI Search per Documenti Aziendali
        </h2>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
          Carica documenti interni, crea una knowledge base vettoriale e
          interroga i tuoi dati con un assistente AI completamente locale.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {[
            { icon: Database, label: "PostgreSQL + pgvector", color: "text-cyan-400" },
            { icon: Brain,    label: "LLM locale · nessun dato in cloud", color: "text-purple-400" },
            { icon: FileText, label: "TXT · PDF · Word",      color: "text-amber-400" },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-sm text-slate-300"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-5 gap-6 text-left">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <DocumentUploader />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-4">
                Come funziona
              </h3>
              <ol className="space-y-3">
                {[
                  "Carica i documenti aziendali",
                  "Il worker genera gli embeddings in background",
                  "PostgreSQL indicizza i vettori",
                  "L'AI risponde usando solo le fonti reali",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-600/40 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right column — chat */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full min-h-[520px]">
              <ChatWindow />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default App;