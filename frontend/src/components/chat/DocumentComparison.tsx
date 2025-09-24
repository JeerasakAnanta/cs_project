import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

interface DocumentComparisonProps {
  documents: DocumentReference[];
  isOpen: boolean;
  onClose: () => void;
}

const DocumentComparison: React.FC<DocumentComparisonProps> = ({
  documents,
  isOpen,
  onClose
}) => {
  const [selectedDocs, setSelectedDocs] = useState<DocumentReference[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useTheme();

  if (!isOpen || documents.length === 0) return null;

  const toggleDocumentSelection = (doc: DocumentReference) => {
    setSelectedDocs(prev => {
      const isSelected = prev.some(d => d.filename === doc.filename && d.page === doc.page);
      if (isSelected) {
        return prev.filter(d => !(d.filename === doc.filename && d.page === doc.page));
      } else {
        return [...prev, doc];
      }
    });
  };

  const resetSelection = () => {
    setSelectedDocs([]);
    setCurrentIndex(0);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 0.6) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'สูง';
    if (score >= 0.6) return 'ปานกลาง';
    return 'ต่ำ';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-7xl h-full max-h-[90vh] rounded-lg shadow-xl ${
        theme === 'light' ? 'bg-white' : 'bg-neutral-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'light' ? 'border-gray-200' : 'border-neutral-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'
            }`}>
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                เปรียบเทียบเอกสาร
              </h2>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                เลือกเอกสารเพื่อเปรียบเทียบ ({selectedDocs.length} รายการ)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetSelection}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600'
              }`}
              title="รีเซ็ตการเลือก"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Document List */}
          <div className={`w-1/3 border-r ${
            theme === 'light' ? 'border-gray-200' : 'border-neutral-700'
          }`}>
            <div className="p-4">
              <h3 className={`text-lg font-semibold mb-3 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                รายการเอกสาร
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.map((doc, index) => {
                  const isSelected = selectedDocs.some(d => 
                    d.filename === doc.filename && d.page === doc.page
                  );
                  
                  return (
                    <div
                      key={index}
                      onClick={() => toggleDocumentSelection(doc)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? (theme === 'light' 
                              ? 'bg-blue-100 border-2 border-blue-300' 
                              : 'bg-blue-900/30 border-2 border-blue-600')
                          : (theme === 'light' 
                              ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100' 
                              : 'bg-neutral-800 border border-neutral-600 hover:bg-neutral-700')
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? (theme === 'light' ? 'border-blue-500 bg-blue-500' : 'border-blue-400 bg-blue-400')
                            : (theme === 'light' ? 'border-gray-300' : 'border-neutral-500')
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm truncate ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>
                            {doc.filename}
                          </h4>
                          {doc.page && (
                            <p className={`text-xs ${
                              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              หน้า {doc.page}
                            </p>
                          )}
                          <div className={`flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs ${
                            getConfidenceBgColor(doc.confidence_score)
                          }`}>
                            <span className={getConfidenceColor(doc.confidence_score)}>
                              {getConfidenceLabel(doc.confidence_score)} ({(doc.confidence_score * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comparison View */}
          <div className="flex-1 flex flex-col">
            {selectedDocs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    เลือกเอกสารเพื่อเปรียบเทียบ
                  </h3>
                  <p className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    คลิกเลือกเอกสารจากรายการด้านซ้าย
                  </p>
                </div>
              </div>
            ) : selectedDocs.length === 1 ? (
              <div className="flex-1 p-4">
                <div className={`p-4 rounded-lg border ${
                  theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-neutral-600 bg-neutral-800/50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h3 className={`font-semibold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>
                        {selectedDocs[0].filename}
                      </h3>
                      {selectedDocs[0].page && (
                        <p className={`text-sm ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          หน้า {selectedDocs[0].page}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`text-sm leading-relaxed ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {selectedDocs[0].full_content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Navigation */}
                <div className={`flex items-center justify-between p-4 border-b ${
                  theme === 'light' ? 'border-gray-200' : 'border-neutral-700'
                }`}>
                  <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      currentIndex === 0
                        ? (theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-neutral-700 text-neutral-500')
                        : (theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600')
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    ก่อนหน้า
                  </button>
                  
                  <span className={`text-sm font-medium ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {currentIndex + 1} / {selectedDocs.length}
                  </span>
                  
                  <button
                    onClick={() => setCurrentIndex(Math.min(selectedDocs.length - 1, currentIndex + 1))}
                    disabled={currentIndex === selectedDocs.length - 1}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      currentIndex === selectedDocs.length - 1
                        ? (theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-neutral-700 text-neutral-500')
                        : (theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600')
                    }`}
                  >
                    ถัดไป
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Document Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className={`p-4 rounded-lg border ${
                    theme === 'light' ? 'border-gray-200 bg-gray-50' : 'border-neutral-600 bg-neutral-800/50'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className={`font-semibold ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>
                          {selectedDocs[currentIndex].filename}
                        </h3>
                        {selectedDocs[currentIndex].page && (
                          <p className={`text-sm ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            หน้า {selectedDocs[currentIndex].page}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`text-sm leading-relaxed ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {selectedDocs[currentIndex].full_content}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentComparison;
