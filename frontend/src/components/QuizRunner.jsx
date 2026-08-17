import React, { useState } from 'react';
import { Brain, CheckCircle2, XCircle, Clock, Trophy, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export function QuizRunner({ documents, onQuizCompleted }) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizMaterial, setQuizMaterial] = useState(null);

  // Quiz execution state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: "A" }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  const handleGenerateQuiz = async () => {
    if (!selectedDocId) return;
    setIsGenerating(true);
    try {
      const res = await api.generateQuiz(parseInt(selectedDocId), numQuestions);
      setQuizMaterial(res);
      setCurrentIdx(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setStartTime(Date.now());
      setScoreResult(null);
    } catch (err) {
      alert('Quiz generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizMaterial) return;
    const questions = quizMaterial.content.questions || [];
    let correctCount = 0;

    const topicBreakdown = {};

    questions.forEach((q) => {
      const isCorrect = selectedAnswers[q.id] === q.correct_answer;
      if (isCorrect) correctCount++;

      const t = q.topic || 'General';
      if (!topicBreakdown[t]) {
        topicBreakdown[t] = { correct: 0, total: 0 };
      }
      topicBreakdown[t].total += 1;
      if (isCorrect) topicBreakdown[t].correct += 1;
    });

    const elapsedSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);
    setIsSubmitted(true);

    const attemptData = {
      study_material_id: quizMaterial.id,
      document_id: quizMaterial.document_id,
      total_questions: questions.length,
      correct_answers: correctCount,
      time_taken_seconds: elapsedSeconds,
      topic_breakdown: topicBreakdown
    };

    try {
      const savedAttempt = await api.submitQuizAttempt(attemptData);
      setScoreResult(savedAttempt);
      if (onQuizCompleted) onQuizCompleted();
    } catch (err) {
      console.error('Failed to submit quiz attempt metrics:', err);
    }
  };

  const questions = quizMaterial?.content?.questions || [];
  const currentQuestion = questions[currentIdx];

  return (
    <div className="space-y-6">
      {/* Quiz Generator Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">AI Practice Quiz Generator</h3>
            <p className="text-xs text-slate-500">Automated multiple-choice questions with explanations</p>
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

          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
          </select>

          <button
            onClick={handleGenerateQuiz}
            disabled={!selectedDocId || isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Active Quiz Card */}
      {quizMaterial && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Quiz Header Progress Bar */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Topic: {currentQuestion?.topic}
            </span>
          </div>

          {!isSubmitted ? (
            <div className="p-6 space-y-6">
              <h4 className="text-lg font-semibold text-slate-900 leading-snug">
                {currentQuestion?.question}
              </h4>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion?.options?.map((opt) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => i - 1)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((i) => i + 1)}
                    className="px-5 py-2 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center space-x-1"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < questions.length}
                    className="px-6 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Breakdown */
            <div className="p-6 space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3">
                <Trophy className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-bold text-emerald-950">Quiz Completed!</h4>
                <div className="text-3xl font-extrabold text-emerald-600">
                  {scoreResult?.score_percentage || 0}%
                </div>
                <p className="text-xs font-medium text-emerald-800">
                  Correct Answers: {scoreResult?.correct_answers} / {scoreResult?.total_questions} • Time Taken: {scoreResult?.time_taken_seconds}s
                </p>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-4">
                <h5 className="font-semibold text-slate-900 text-sm">Detailed Explanations:</h5>
                {questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correct_answer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border text-sm space-y-2 ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-red-200 bg-red-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-900">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        <span>Your Answer: <strong>Option {userAns || 'None'}</strong></span>
                        {!isCorrect && (
                          <span className="ml-3 text-emerald-700">Correct Answer: <strong>Option {q.correct_answer}</strong></span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                        Explanation: {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleGenerateQuiz}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 flex items-center space-x-2 shadow-md shadow-indigo-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Another Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
