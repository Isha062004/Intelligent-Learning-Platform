import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DocumentManager } from './components/DocumentManager';
import { RagChat } from './components/RagChat';
import { QuizRunner } from './components/QuizRunner';
import { FlashcardViewer } from './components/FlashcardViewer';
import { SummaryViewer } from './components/SummaryViewer';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents list:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analytics' && (
          <AnalyticsDashboard onNavigate={setActiveTab} />
        )}
        {activeTab === 'documents' && (
          <DocumentManager documents={documents} onRefresh={fetchDocuments} />
        )}
        {activeTab === 'rag-chat' && (
          <RagChat documents={documents} />
        )}
        {activeTab === 'quiz' && (
          <QuizRunner documents={documents} onQuizCompleted={fetchDocuments} />
        )}
        {activeTab === 'flashcards' && (
          <FlashcardViewer documents={documents} />
        )}
        {activeTab === 'summary' && (
          <SummaryViewer documents={documents} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Intelligent Learning Platform • AI-Powered RAG, Vector Search & Study Analytics
      </footer>
    </div>
  );
}
