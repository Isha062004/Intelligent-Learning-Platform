import re
from typing import List, Dict, Any
from pypdf import PdfReader

class PDFService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts text page by page from a PDF file.
        Returns a list of dicts: [{"page": 1, "text": "..."}, ...]
        """
        pages_content = []
        try:
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                clean_text = " ".join(text.split())
                if clean_text:
                    pages_content.append({
                        "page": idx + 1,
                        "text": clean_text
                    })
        except Exception as e:
            print(f"Error reading PDF file {file_path}: {e}")
        return pages_content

    @staticmethod
    def chunk_document(pages_content: List[Dict[str, Any]], target_chunk_size: int = 500, overlap_sentences: int = 1) -> List[Dict[str, Any]]:
        """
        Senior Engineer Enhancement: Semantic Sentence-Boundary Chunking.
        Prevents breaking sentences or thoughts mid-word, improving RAG context precision.
        """
        chunks = []
        global_chunk_idx = 0

        for page_data in pages_content:
            page_num = page_data["page"]
            text = page_data["text"]

            if not text:
                continue

            # Split text by sentence boundaries regex
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
            
            current_chunk_sentences = []
            current_length = 0

            for sentence in sentences:
                sentence_len = len(sentence)
                
                if current_length + sentence_len > target_chunk_size and current_chunk_sentences:
                    chunk_text = " ".join(current_chunk_sentences)
                    approx_tokens = len(chunk_text.split())
                    chunks.append({
                        "chunk_index": global_chunk_idx,
                        "page_number": page_num,
                        "text": chunk_text,
                        "token_count": approx_tokens
                    })
                    global_chunk_idx += 1

                    # Keep overlap sentences for continuity
                    current_chunk_sentences = current_chunk_sentences[-overlap_sentences:] if overlap_sentences > 0 else []
                    current_length = sum(len(s) for s in current_chunk_sentences)

                current_chunk_sentences.append(sentence)
                current_length += sentence_len

            # Tail chunk
            if current_chunk_sentences:
                chunk_text = " ".join(current_chunk_sentences)
                approx_tokens = len(chunk_text.split())
                chunks.append({
                    "chunk_index": global_chunk_idx,
                    "page_number": page_num,
                    "text": chunk_text,
                    "token_count": approx_tokens
                })
                global_chunk_idx += 1

        return chunks
