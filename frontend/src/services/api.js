import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Documents
  getDocuments: async () => {
    const res = await axios.get(`${API_BASE}/documents/`);
    return res.data;
  },
  uploadDocument: async (file, title) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    const res = await axios.post(`${API_BASE}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  createNote: async (title, content) => {
    const res = await axios.post(`${API_BASE}/documents/note`, { title, content });
    return res.data;
  },
  deleteDocument: async (id) => {
    await axios.delete(`${API_BASE}/documents/${id}`);
  },

  // RAG Query
  queryRAG: async (query, documentIds = null, topK = 4) => {
    const res = await axios.post(`${API_BASE}/rag/query`, {
      query,
      document_ids: documentIds,
      top_k: topK
    });
    return res.data;
  },

  // Generator
  generateSummary: async (documentId, summaryType = 'bullet_points') => {
    const res = await axios.post(`${API_BASE}/generator/summary`, {
      document_id: documentId,
      summary_type: summaryType
    });
    return res.data;
  },
  generateQuiz: async (documentId, numQuestions = 5) => {
    const res = await axios.post(`${API_BASE}/generator/quiz`, {
      document_id: documentId,
      num_questions: numQuestions
    });
    return res.data;
  },
  generateFlashcards: async (documentId, numCards = 10) => {
    const res = await axios.post(`${API_BASE}/generator/flashcards`, {
      document_id: documentId,
      num_cards: numCards
    });
    return res.data;
  },

  // Analytics
  submitQuizAttempt: async (attemptData) => {
    const res = await axios.post(`${API_BASE}/analytics/quiz-attempt`, attemptData);
    return res.data;
  },
  getDashboardMetrics: async () => {
    const res = await axios.get(`${API_BASE}/analytics/dashboard`);
    return res.data;
  }
};
