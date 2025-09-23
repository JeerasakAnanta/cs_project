import React, { useState } from 'react';
import { FileText, ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import DocumentViewer from './DocumentViewer';

interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

interface DocumentReferencesProps {
  references: DocumentReference[];
  className?: string;
}

const DocumentReferences: React.FC<DocumentReferencesProps> = ({
  references,
  className = '',
}) => {
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set());
  const [showFullContent, setShowFullContent] = useState<Set<number>>(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentReference | null>(null);
  const { theme } = useTheme();

  if (!references || references.length === 0) {
    return null;
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedRefs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRefs(newExpanded);
  };

  const toggleFullContent = (index: number) => {
    const newShowFull = new Set(showFullContent);
    if (newShowFull.has(index)) {
      newShowFull.delete(index);
    } else {
      newShowFull.add(index);
    }
    setShowFullContent(newShowFull);
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
    <div className={`mt-4 ${className}`}>
      <div
        className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${
          theme === 'light'
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-blue-900/20 border border-blue-700/50'
        }`}
      >
        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span
          className={`text-sm font-medium ${
            theme === 'light' ? 'text-blue-800' : 'text-blue-300'
          }`}
        >
          อ้างอิงจากเอกสาร ({references.length} รายการ)
        </span>
      </div>

      <div className="space-y-2">
        {references.map((ref, index) => (
          <div
            key={index}
            className={`border rounded-lg transition-all duration-200 ${
              theme === 'light'
                ? 'border-gray-200 bg-white hover:border-gray-300'
                : 'border-neutral-600 bg-neutral-800/50 hover:border-neutral-500'
            }`}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'light' ? 'bg-gray-100' : 'bg-neutral-700'
                  }`}
                >
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium truncate ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {ref.filename}
                    </h4>
                    {ref.page && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          theme === 'light'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        หน้า {ref.page}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'light'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      ความเชื่อมั่น: {getConfidenceLabel(ref.confidence_score)}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${getConfidenceColor(
                        ref.confidence_score
                      )}`}
                    />
                    <span className={`text-xs ${getConfidenceColor(ref.confidence_score)}`}>
                      {(ref.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullContent(index);
                  }}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}
                  title={showFullContent.has(index) ? 'ซ่อนเนื้อหาเต็ม' : 'แสดงเนื้อหาเต็ม'}
                >
                  {showFullContent.has(index) ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {expandedRefs.has(index) ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </div>

            {/* Content */}
            {expandedRefs.has(index) && (
              <div
                className={`px-3 pb-3 border-t ${
                  theme === 'light' ? 'border-gray-200' : 'border-neutral-600'
                }`}
              >
                <div className="mt-3">
                  <div
                    className={`text-sm leading-relaxed ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    {showFullContent.has(index) ? ref.full_content : ref.content_preview}
                  </div>
                  {!showFullContent.has(index) && ref.full_content.length > 200 && (
                    <button
                      onClick={() => toggleFullContent(index)}
                      className={`mt-2 text-sm font-medium hover:underline ${
                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                      }`}
                    >
                      อ่านต่อ...
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-neutral-600">
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      theme === 'light'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    }`}
                    onClick={() => {
                      setSelectedDocument(ref);
                      setViewerOpen(true);
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    เปิดเอกสาร
                  </button>
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      theme === 'light'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                    }`}
                    onClick={() => {
                      navigator.clipboard.writeText(ref.full_content);
                    }}
                  >
                    คัดลอกข้อความ
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        className={`mt-3 px-3 py-2 rounded-lg text-xs ${
          theme === 'light'
            ? 'bg-gray-50 text-gray-600'
            : 'bg-neutral-800/50 text-neutral-400'
        }`}
      >
        <strong>หมายเหตุ:</strong> ข้อมูลอ้างอิงจากเอกสารอาจไม่ครบถ้วนหรือไม่ถูกต้อง 100% 
        โปรดตรวจสอบข้อมูลจากเอกสารต้นฉบับก่อนนำไปใช้งาน
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </div>
  );
};

export default DocumentReferences;
