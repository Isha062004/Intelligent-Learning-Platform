import React, { useState } from 'react';
import { Send, Bot, User, BookOpen, Search, ExternalLink, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export function RagChat({ documents }) {
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('all');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Study Assistant. Ask me anything about your uploaded PDFs and notes. I will search your documents using FAISS semantic vector retrieval and synthesize context-aware answers with page citations.',
      citations: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = { role: 'user', content: query };
    setChatHistory((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    try {
      const docIds = selectedDocId === 'all' ? null : [parseInt(selectedDocId)];
      const res = await api.queryRAG(currentQuery, docIds);

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          citations: res.citations || []
        }
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred while processing your query: ' + (err.response?.data?.detail || err.message),
          citations: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Semantic RAG Workspace</h3>
            <p className="text-xs text-slate-500">Vector Search over PDF & Note Chunks</p>
          </div>
        </div>

        {/* Target document selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Search Scope:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Indexed Documents ({documents.length})</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({doc.chunk_count} chunks)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`p-2 rounded-xl text-white ${
                msg.role === 'user' ? 'bg-slate-800' : 'bg-blue-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="max-w-2xl space-y-3">
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Citations block */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-blue-900">
                    <span className="flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Retrieved Sources & Citations ({msg.citations.length})</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {msg.citations.map((cite, citeIdx) => {
                      const isExpanded = expandedCitation === `${idx}-${citeIdx}`;
                      return (
                        <div
                          key={citeIdx}
                          className="bg-white border border-blue-100 rounded-lg p-2.5 transition-all"
                        >
                          <div
                            onClick={() =>
                              setExpandedCitation(isExpanded ? null : `${idx}-${citeIdx}`)
                            }
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center space-x-2 font-medium text-slate-700">
                              <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                Page {cite.page_number}
                              </span>
                              <span className="truncate max-w-xs">{cite.document_title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                              <span className="text-blue-600 font-semibold">
                                Score: {(cite.similarity_score * 100).toFixed(1)}%
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 text-slate-600 bg-slate-50 p-2 rounded text-[11px] leading-relaxed italic">
                              "{cite.text_snippet}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-400 text-sm">
            <div className="p-2 bg-blue-600 text-white rounded-xl animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm text-xs font-medium text-slate-600 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              <span>Embedding query & searching FAISS index...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a question about your documents (e.g., 'What are the main algorithms discussed?')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
