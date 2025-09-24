import React, { useState, useEffect } from 'react';
import { X, Download, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentReference | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedContent, setHighlightedContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { theme } = useTheme();

  useEffect(() => {
    if (document && searchTerm) {
      // Simple text highlighting
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      const highlighted = document.full_content.replace(
        regex,
        '<mark class="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">$1</mark>'
      );
      setHighlightedContent(highlighted);
    } else if (document) {
      setHighlightedContent(document.full_content);
    }
  }, [document, searchTerm]);

  useEffect(() => {
    if (document) {
      setCurrentPage(document.page || 1);
      setSearchTerm('');
    }
  }, [document]);

  if (!isOpen || !document) {
    return null;
  }

  const handleDownload = () => {
    const blob = new Blob([document.full_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.filename}_page_${document.page || 'unknown'}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'สูง';
    if (score >= 0.6) return 'ปานกลาง';
    return 'ต่ำ';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-4xl h-full max-h-[90vh] rounded-2xl shadow-2xl ${
          theme === 'light'
            ? 'bg-white border border-gray-200'
            : 'bg-neutral-800 border border-neutral-600'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === 'light' ? 'border-gray-200' : 'border-neutral-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'
              }`}
            >
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2
                className={`text-lg font-semibold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                {document.filename}
              </h2>
              <div className="flex items-center gap-2">
                {document.page && (
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      theme === 'light'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    หน้า {document.page}
                  </span>
                )}
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    theme === 'light'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  ความเชื่อมั่น: {getConfidenceLabel(document.confidence_score)}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${getConfidenceColor(
                    document.confidence_score
                  )}`}
                />
                <span className={`text-sm ${getConfidenceColor(document.confidence_score)}`}>
                  {(document.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
              }`}
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-neutral-700 text-neutral-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-neutral-600">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาในเอกสาร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'bg-neutral-700 border-neutral-600 text-white'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            className={`prose max-w-none ${
              theme === 'light'
                ? 'prose-p:text-gray-800 prose-p:font-medium prose-strong:text-gray-900 prose-strong:font-bold prose-em:text-gray-800 prose-em:font-medium prose-a:text-blue-700 prose-a:font-medium prose-headings:text-gray-900 prose-headings:font-bold prose-code:text-blue-700 prose-code:font-semibold prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-pre:font-medium prose-pre:border-gray-200 prose-blockquote:border-l-blue-600 prose-blockquote:text-gray-800 prose-blockquote:font-medium prose-ul:text-gray-800 prose-ul:font-medium prose-ol:text-gray-800 prose-ol:font-medium prose-li:text-gray-800 prose-li:font-medium prose-table:text-gray-800 prose-table:font-medium prose-th:text-gray-900 prose-th:font-bold prose-td:text-gray-800 prose-td:font-medium'
                : 'prose-invert prose-p:text-gray-200 prose-p:font-medium prose-strong:text-white prose-strong:font-bold prose-em:text-gray-200 prose-em:font-medium prose-a:text-blue-300 prose-a:font-medium prose-headings:text-white prose-headings:font-bold prose-h1:text-white prose-h1:font-bold prose-h2:text-white prose-h2:font-bold prose-h3:text-white prose-h3:font-bold prose-h4:text-white prose-h4:font-bold prose-h5:text-white prose-h5:font-bold prose-h6:text-white prose-h6:font-bold prose-code:text-primary-300 prose-code:font-semibold prose-pre:bg-neutral-800 prose-pre:text-gray-200 prose-pre:font-medium prose-pre:border-neutral-700 prose-blockquote:border-l-primary-500 prose-blockquote:text-gray-300 prose-blockquote:font-medium prose-ul:text-gray-200 prose-ul:font-medium prose-ol:text-gray-200 prose-ol:font-medium prose-li:text-gray-200 prose-li:font-medium prose-table:text-gray-200 prose-table:font-medium prose-th:text-white prose-th:font-bold prose-td:text-gray-200 prose-td:font-medium'
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t ${
            theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-neutral-600 bg-neutral-800/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
              }`}
            >
              เอกสารอ้างอิงจากระบบ RAG - ความแม่นยำอาจแตกต่างจากเอกสารต้นฉบับ
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-200 text-gray-600'
                    : 'hover:bg-neutral-700 text-neutral-400'
                }`}
                disabled
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span
                className={`px-3 py-1 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-neutral-400'
                }`}
              >
                หน้า {currentPage}
              </span>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'hover:bg-gray-200 text-gray-600'
                    : 'hover:bg-neutral-700 text-neutral-400'
                }`}
                disabled
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
