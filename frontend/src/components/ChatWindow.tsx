import React, { useState } from 'react';
import { apiService } from '../services/api';
import { SourceBadge } from './SourceBadge';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input;
    setInput("");
    setMessages(prev => [...prev, { sender: 'user', text: userQuestion }]);
    setLoading(true);

    try {
      const data = await apiService.askQuestion(userQuestion);
      setMessages(prev => [...prev, { sender: 'ai', text: data.answer, sources: data.sources }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Errore: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-600" />
        <span className="font-bold text-gray-700">Assistente AI locale (RAG)</span>
      </div>

      {/* Messaggi */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20 text-sm">
            Nessun messaggio. Carica un documento a sinistra e fai una domanda per iniziare!
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-3 rounded-xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800 border border-gray-100'}`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.sources && <SourceBadge sources={msg.sources} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              L'AI sta formulando la risposta consultando i dati...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Chiedi qualcosa sui documenti caricati..."
          className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};