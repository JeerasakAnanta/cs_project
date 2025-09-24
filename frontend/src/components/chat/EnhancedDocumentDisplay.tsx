import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  BarChart3, 
  Eye, 
  Download, 
  Share2, 
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import DocumentViewer from './DocumentViewer';

interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

interface EnhancedDocumentDisplayProps {
  references: DocumentReference[];
  query?: string;
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'detailed';
type SortBy = 'confidence' | 'filename' | 'page';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'high' | 'medium' | 'low';

const EnhancedDocumentDisplay: React.FC<EnhancedDocumentDisplayProps> = ({
  references,
  query = '',
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('confidence');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedDocs, setExpandedDocs] = useState<Set<number>>(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentReference | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const { theme } = useTheme();

  // Filter and sort documents
  const processedDocuments = useMemo(() => {
    let filtered = references;

    // Apply confidence filter
    if (filterType !== 'all') {
      filtered = references.filter(doc => {
        switch (filterType) {
          case 'high': return doc.confidence_score >= 0.8;
          case 'medium': return doc.confidence_score >= 0.6 && doc.confidence_score < 0.8;
          case 'low': return doc.confidence_score < 0.6;
          default: return true;
        }
      });
    }

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'confidence':
          comparison = a.confidence_score - b.confidence_score;
          break;
        case 'filename':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'page':
          comparison = (a.page || 0) - (b.page || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [references, filterType, sortBy, sortOrder]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = references.length;
    const highConfidence = references.filter(d => d.confidence_score >= 0.8).length;
    const mediumConfidence = references.filter(d => d.confidence_score >= 0.6 && d.confidence_score < 0.8).length;
    const lowConfidence = references.filter(d => d.confidence_score < 0.6).length;
    const avgConfidence = references.reduce((sum, d) => sum + d.confidence_score, 0) / total;
    const uniqueFiles = new Set(references.map(d => d.filename)).size;

    return {
      total,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      avgConfidence,
      uniqueFiles
    };
  }, [references]);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDocs(newExpanded);
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

  const getConfidenceIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (score >= 0.6) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  if (!references || references.length === 0) {
    return (
      <div className={`mt-4 ${className}`}>
        <div className={`p-6 text-center rounded-lg ${
          theme === 'light' 
            ? 'bg-gray-50 border border-gray-200' 
            : 'bg-neutral-800/50 border border-neutral-600'
        }`}>
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className={`text-lg font-medium mb-2 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            ไม่พบเอกสารที่เกี่ยวข้อง
          </h3>
          <p className={`text-sm ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            ลองใช้คำค้นหาที่แตกต่างหรือเฉพาะเจาะจงมากขึ้น
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${className}`}>
      {/* Header with Controls */}
      <div className={`p-4 rounded-lg mb-4 ${
        theme === 'light' 
          ? 'bg-blue-50 border border-blue-200' 
          : 'bg-blue-900/20 border border-blue-700/50'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'light' ? 'bg-blue-100' : 'bg-blue-800/30'
            }`}>
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                theme === 'light' ? 'text-blue-900' : 'text-blue-100'
              }`}>
                ผลการค้นหาเอกสาร
              </h3>
              <p className={`text-sm ${
                theme === 'light' ? 'text-blue-700' : 'text-blue-300'
              }`}>
                พบ {references.length} รายการ • {analytics.uniqueFiles} ไฟล์
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-white hover:bg-gray-50 border border-gray-200' 
                  : 'bg-neutral-700 hover:bg-neutral-600 border border-neutral-600'
              }`}
              title="แสดงสถิติ"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Query Display */}
        {query && (
          <div className={`p-3 rounded-lg mb-3 ${
            theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-800 border border-neutral-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                คำค้นหา:
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-neutral-700 text-gray-200'
              }`}>
                "{query}"
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? (theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-800/50 text-blue-300')
                  : (theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600')
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? (theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-800/50 text-blue-300')
                  : (theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600')
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className={`px-3 py-2 rounded-lg text-sm border ${
              theme === 'light' 
                ? 'bg-white border-gray-200 text-gray-700' 
                : 'bg-neutral-700 border-neutral-600 text-gray-300'
            }`}
          >
            <option value="all">ทั้งหมด ({analytics.total})</option>
            <option value="high">ความเชื่อมั่นสูง ({analytics.highConfidence})</option>
            <option value="medium">ความเชื่อมั่นปานกลาง ({analytics.mediumConfidence})</option>
            <option value="low">ความเชื่อมั่นต่ำ ({analytics.lowConfidence})</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                theme === 'light' 
                  ? 'bg-white border-gray-200 text-gray-700' 
                  : 'bg-neutral-700 border-neutral-600 text-gray-300'
              }`}
            >
              <option value="confidence">เรียงตามความเชื่อมั่น</option>
              <option value="filename">เรียงตามชื่อไฟล์</option>
              <option value="page">เรียงตามหน้า</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600'
              }`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className={`p-4 rounded-lg mb-4 ${
          theme === 'light' 
            ? 'bg-gray-50 border border-gray-200' 
            : 'bg-neutral-800/50 border border-neutral-600'
        }`}>
          <h4 className={`text-lg font-semibold mb-3 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            สถิติการค้นหา
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  เอกสารทั้งหมด
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {analytics.total}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  ความเชื่อมั่นเฉลี่ย
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {(analytics.avgConfidence * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  ไฟล์ที่ไม่ซ้ำ
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {analytics.uniqueFiles}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  ความเชื่อมั่นสูง
                </span>
              </div>
              <div className={`text-2xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {analytics.highConfidence}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className={`space-y-3 ${
        viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''
      }`}>
        {processedDocuments.map((doc, index) => (
          <div
            key={index}
            className={`border rounded-lg transition-all duration-200 hover:shadow-md ${
              theme === 'light'
                ? 'border-gray-200 bg-white hover:border-gray-300'
                : 'border-neutral-600 bg-neutral-800/50 hover:border-neutral-500'
            }`}
          >
            {/* Document Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    theme === 'light' ? 'bg-gray-100' : 'bg-neutral-700'
                  }`}>
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-lg mb-1 truncate ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                      {doc.filename}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      {doc.page && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          theme === 'light'
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-neutral-700 text-neutral-300'
                        }`}>
                          หน้า {doc.page}
                        </span>
                      )}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        getConfidenceBgColor(doc.confidence_score)
                      }`}>
                        {getConfidenceIcon(doc.confidence_score)}
                        <span className={getConfidenceColor(doc.confidence_score)}>
                          {getConfidenceLabel(doc.confidence_score)} ({(doc.confidence_score * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleExpanded(index)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'light' 
                      ? 'hover:bg-gray-100 text-gray-600' 
                      : 'hover:bg-neutral-700 text-gray-400'
                  }`}
                >
                  {expandedDocs.has(index) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Content Preview */}
              <div className={`text-sm leading-relaxed ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                {doc.content_preview}
                {doc.full_content.length > 200 && (
                  <span className={`ml-1 ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    ...
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedDocs.has(index) && (
              <div className={`px-4 pb-4 border-t ${
                theme === 'light' ? 'border-gray-200' : 'border-neutral-600'
              }`}>
                <div className="mt-3">
                  <div className={`text-sm leading-relaxed mb-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    {doc.full_content}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedDocument(doc);
                        setViewerOpen(true);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        theme === 'light'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      เปิดเอกสาร
                    </button>
                    
                    <button
                      onClick={() => navigator.clipboard.writeText(doc.full_content)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        theme === 'light'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      คัดลอกข้อความ
                    </button>
                    
                    <button
                      onClick={() => {
                        const shareData = {
                          title: doc.filename,
                          text: doc.content_preview,
                          url: window.location.href
                        };
                        navigator.share(shareData);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        theme === 'light'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      แชร์
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`mt-4 p-4 rounded-lg ${
        theme === 'light'
          ? 'bg-gray-50 border border-gray-200'
          : 'bg-neutral-800/50 border border-neutral-600'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className={`text-sm font-medium ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>
            สรุปผลการค้นหา
          </span>
        </div>
        <p className={`text-sm ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          พบเอกสารที่เกี่ยวข้อง {processedDocuments.length} รายการ จาก {analytics.uniqueFiles} ไฟล์ 
          โดยมีความเชื่อมั่นเฉลี่ย {(analytics.avgConfidence * 100).toFixed(1)}%
        </p>
        <div className={`mt-2 text-xs ${
          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <strong>หมายเหตุ:</strong> ข้อมูลอ้างอิงจากเอกสารอาจไม่ครบถ้วนหรือไม่ถูกต้อง 100% 
          โปรดตรวจสอบข้อมูลจากเอกสารต้นฉบับก่อนนำไปใช้งาน
        </div>
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

export default EnhancedDocumentDisplay;
