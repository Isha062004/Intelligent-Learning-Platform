import React, { useState } from 'react';
import { Upload, FileText, Trash2, Plus, CheckCircle, Clock, AlertCircle, FilePlus } from 'lucide-react';
import { api } from '../services/api';

export function DocumentManager({ documents, onRefresh }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeMode, setActiveMode] = useState('pdf'); // 'pdf' or 'note'
  
  // Note mode state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    try {
      await api.uploadDocument(file, title);
      setFile(null);
      setTitle('');
      await onRefresh();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleNoteCreate = async (e) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    setIsUploading(true);
    try {
      await api.createNote(noteTitle, noteContent);
      setNoteTitle('');
      setNoteContent('');
      await onRefresh();
    } catch (err) {
      alert('Note creation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(id);
      await onRefresh();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">PDF & Study Notes Hub</h2>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Upload course PDFs or write notes. Documents are parsed page-by-page, chunked, and indexed using 384-dimensional Sentence Transformer embeddings into a local FAISS vector store for sub-second semantic retrieval.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveMode('pdf')}
              className={`flex-1 py-2 font-medium text-sm border-b-2 transition-all ${
                activeMode === 'pdf' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Upload PDF / TXT
            </button>
            <button
              onClick={() => setActiveMode('note')}
              className={`flex-1 py-2 font-medium text-sm border-b-2 transition-all ${
                activeMode === 'note' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Add Quick Note
            </button>
          </div>

          {activeMode === 'pdf' ? (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning Chapter 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Select File (.pdf, .txt)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {file && (
                    <p className="mt-2 text-xs text-blue-600 font-medium truncate">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <span>Processing & Indexing...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Index Document</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleNoteCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Key Takeaways on RAG Architecture"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Note Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste lecture notes or text summary here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!noteTitle || !noteContent || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <FilePlus className="w-4 h-4" />
                    <span>Save & Index Note</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Document List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Indexed Documents & Notes</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {documents.length} Total Documents
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <FileText className="w-12 h-12 mx-auto stroke-[1.5]" />
              <p className="text-sm font-medium">No documents uploaded yet.</p>
              <p className="text-xs text-slate-400">Upload a PDF or add a note to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <div key={doc.id} className="py-4 flex items-center justify-between group">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{doc.title}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span className="uppercase tracking-wider font-semibold text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                          {doc.file_type}
                        </span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.chunk_count} FAISS Chunks</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {doc.status === 'processed' ? (
                      <span className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Indexed</span>
                      </span>
                    ) : doc.status === 'processing' ? (
                      <span className="flex items-center space-x-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Indexing</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Error</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
