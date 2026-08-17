import React, { useEffect, useState } from 'react';
import { BarChart3, Trophy, BookOpen, Clock, AlertTriangle, Lightbulb, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export function AnalyticsDashboard({ onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch analytics metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-500 font-medium text-sm animate-pulse">
        Loading personalized study metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personalized Study Analytics</h2>
          <p className="mt-1 text-slate-300 text-sm">
            Real-time tracking of retention accuracy, study session velocity, and weak-point detection.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-xl text-xs backdrop-blur-sm transition-all"
        >
          Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indexed Documents</p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.total_documents || 0}</h4>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Completed</p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.total_quizzes_taken || 0}</h4>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Accuracy</p>
            <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {metrics?.average_quiz_score || 0}%
            </h4>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Study Duration</p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">
              {metrics?.total_study_time_minutes || 0} <span className="text-xs font-medium text-slate-500">mins</span>
            </h4>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topic Mastery Progress Bars */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Topic Mastery Breakdown</h3>
            <span className="text-xs font-medium text-slate-500">Calculated from Quiz Attempts</span>
          </div>

          <div className="space-y-4">
            {metrics?.topic_mastery?.map((item, idx) => {
              const mastery = item.mastery;
              const isWeak = mastery < 70;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.topic}</span>
                    <span className={isWeak ? 'text-amber-600' : 'text-emerald-600'}>
                      {mastery}% Mastery
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWeak ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(mastery, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="lg:col-span-1 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-base">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3>AI Recommendations</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Tailored study suggestions based on identified topic weaknesses and quiz retention curves.
          </p>

          <div className="space-y-3">
            {metrics?.recommendations?.map((rec, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs flex items-center justify-between">
                  <span>{rec.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">{rec.reason}</p>
                {rec.action_type && onNavigate && (
                  <button
                    onClick={() => {
                      if (rec.action_type === 'flashcards') onNavigate('flashcards');
                      else if (rec.action_type === 'quiz') onNavigate('quiz');
                      else if (rec.action_type === 'chat') onNavigate('rag-chat');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline pt-1 inline-block"
                  >
                    Open {rec.action_type.toUpperCase()} Workspace →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
