import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle, BookOpen, Layers } from 'lucide-react';
import { api } from '../services/api';

export function SummaryViewer({ documents }) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [summaryType, setSummaryType] = useState('bullet_points');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const handleGenerateSummary = async () => {
    if (!selectedDocId) return;
    setIsGenerating(true);
    try {
      const res = await api.generateSummary(parseInt(selectedDocId), summaryType);
      setSummaryData(res);
    } catch (err) {
      alert('Summary generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const content = summaryData?.content || {};

  return (
    <div className="space-y-6">
      {/* Generator controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Smart Executive Summaries</h3>
            <p className="text-xs text-slate-500">Automated structured takeaways and key term definitions</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {documents.length === 0 ? (
              <option value="">No documents available</option>
            ) : (
              documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))
            )}
          </select>

          <button
            onClick={handleGenerateSummary}
            disabled={!selectedDocId || isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Summary'}</span>
          </button>
        </div>
      </div>

      {/* Summary View Body */}
      {summaryData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Executive Overview */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600">Executive Overview</h4>
            <p className="text-slate-700 text-sm leading-relaxed bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              {content.executive_summary}
            </p>
          </div>

          {/* Bullet Points */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Structured Takeaways</h4>
            <div className="space-y-2">
              {content.bullet_points?.map((pt, idx) => (
                <div key={idx} className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-800">
                  <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span className="leading-snug" dangerouslySetInnerHTML={{ __html: pt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>

          {/* Key Vocabulary / Terms */}
          {content.key_terms && content.key_terms.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Key Term Definitions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.key_terms.map((kt, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                    <h5 className="font-bold text-slate-900 text-sm">{kt.term}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{kt.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
