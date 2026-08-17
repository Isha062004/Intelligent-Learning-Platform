import React, { useState } from 'react';
import { Layers, RotateCw, ChevronLeft, ChevronRight, Sparkles, Check, Flame } from 'lucide-react';
import { api } from '../services/api';

export function FlashcardViewer({ documents }) {
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [numCards, setNumCards] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardsDeck, setCardsDeck] = useState(null);

  // Deck interaction state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryRatings, setMasteryRatings] = useState({});

  const handleGenerateDeck = async () => {
    if (!selectedDocId) return;
    setIsGenerating(true);
    try {
      const res = await api.generateFlashcards(parseInt(selectedDocId), numCards);
      setCardsDeck(res);
      setCurrentIdx(0);
      setIsFlipped(false);
      setMasteryRatings({});
    } catch (err) {
      alert('Flashcard deck generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRating = (rating) => {
    const cardId = cards[currentIdx]?.id;
    setMasteryRatings((prev) => ({
      ...prev,
      [cardId]: rating
    }));
    // Auto advance to next card after rating
    if (currentIdx < cards.length - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIdx((i) => i + 1);
      }, 200);
    }
  };

  const cards = cardsDeck?.content?.cards || [];
  const currentCard = cards[currentIdx];

  return (
    <div className="space-y-6">
      {/* Generator bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">AI Flashcard Studio</h3>
            <p className="text-xs text-slate-500">Active recall study decks generated from document concepts</p>
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
            onClick={handleGenerateDeck}
            disabled={!selectedDocId || isGenerating}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Cards...' : 'Generate Flashcards'}</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Card Studio */}
      {cardsDeck && cards.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Deck progress header */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Card {currentIdx + 1} of {cards.length}</span>
            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
              Topic: {currentCard?.topic}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Card Front */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 flex flex-col justify-between backface-hidden">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Front • Question / Concept</span>
                  <RotateCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
                </div>

                <div className="my-auto text-center space-y-3">
                  <h4 className="text-xl font-bold text-slate-900 leading-relaxed">
                    {currentCard?.front}
                  </h4>
                </div>

                <div className="text-center text-xs font-medium text-slate-400">
                  Click card to reveal answer
                </div>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl shadow-lg p-8 text-white flex flex-col justify-between backface-hidden rotate-y-180">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-100">
                  <span>Back • Explanation & Answer</span>
                  <RotateCw className="w-4 h-4 text-amber-100" />
                </div>

                <div className="my-auto text-center space-y-3">
                  <p className="text-base font-medium text-amber-50 leading-relaxed">
                    {currentCard?.back}
                  </p>
                </div>

                <div className="text-center text-xs font-medium text-amber-200">
                  Click card to flip back
                </div>
              </div>
            </div>
          </div>

          {/* Rating & Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentIdx === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx((i) => i - 1);
              }}
              className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            {/* Self Rating Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRating('hard')}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl border border-red-200 transition-all"
              >
                Hard 😓
              </button>
              <button
                onClick={() => handleRating('medium')}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-xl border border-amber-200 transition-all"
              >
                Medium 🤔
              </button>
              <button
                onClick={() => handleRating('easy')}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 transition-all"
              >
                Easy 🎯
              </button>
            </div>

            <button
              disabled={currentIdx === cards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx((i) => i + 1);
              }}
              className="p-3 border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
