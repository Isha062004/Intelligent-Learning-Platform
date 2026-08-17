import React from 'react';
import { BookOpen, MessageSquare, Brain, Layers, BarChart3, Sparkles } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { id: 'documents', label: 'PDFs & Notes Hub', icon: BookOpen },
    { id: 'rag-chat', label: 'AI RAG Workspace', icon: MessageSquare },
    { id: 'quiz', label: 'Interactive Quizzes', icon: Brain },
    { id: 'flashcards', label: 'Flashcard Studio', icon: Layers },
    { id: 'summary', label: 'Smart Summaries', icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">
                Intelligent Learning Platform
              </h1>
              <p className="text-xs text-blue-600 font-medium">AI-Powered Semantic Study & RAG</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
