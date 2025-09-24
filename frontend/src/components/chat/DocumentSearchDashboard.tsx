import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  FileText, 
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import EnhancedDocumentDisplay from './EnhancedDocumentDisplay';
import DocumentComparison from './DocumentComparison';

interface DocumentReference {
  filename: string;
  page: number | null;
  confidence_score: number;
  content_preview: string;
  full_content: string;
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  avgConfidence: number;
}

interface DocumentSearchDashboardProps {
  documents: DocumentReference[];
  query?: string;
  onNewSearch?: (query: string) => void;
  className?: string;
}

const DocumentSearchDashboard: React.FC<DocumentSearchDashboardProps> = ({
  documents,
  query = '',
  onNewSearch,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useTheme();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('documentSearchHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search history
  const saveSearchHistory = (newSearch: SearchHistory) => {
    const updatedHistory = [newSearch, ...searchHistory].slice(0, 10); // Keep only last 10 searches
    setSearchHistory(updatedHistory);
    localStorage.setItem('documentSearchHistory', JSON.stringify(updatedHistory));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !onNewSearch) return;
    
    setIsSearching(true);
    try {
      await onNewSearch(searchQuery.trim());
      
      // Add to search history
      const avgConfidence = documents.length > 0 
        ? documents.reduce((sum, doc) => sum + doc.confidence_score, 0) / documents.length 
        : 0;
      
      const newSearch: SearchHistory = {
        id: Date.now().toString(),
        query: searchQuery.trim(),
        timestamp: new Date(),
        resultCount: documents.length,
        avgConfidence
      };
      
      saveSearchHistory(newSearch);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('documentSearchHistory');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className={`p-6 rounded-lg mb-6 ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' 
          : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/50'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              theme === 'light' ? 'bg-blue-100' : 'bg-blue-800/30'
            }`}>
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-blue-900' : 'text-blue-100'
              }`}>
                ค้นหาเอกสารทางการเงิน
              </h1>
              <p className={`text-sm ${
                theme === 'light' ? 'text-blue-700' : 'text-blue-300'
              }`}>
                คู่มือปฏิบัติงานด้านการเงินและการเบิกจ่ายค่าใช้จ่าย
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
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowComparison(true)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-white hover:bg-gray-50 border border-gray-200' 
                  : 'bg-neutral-700 hover:bg-neutral-600 border border-neutral-600'
              }`}
              title="เปรียบเทียบเอกสาร"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ค้นหาข้อมูลทางการเงิน เช่น การเบิกจ่าย ค่าใช้จ่าย..."
              className={`w-full pl-10 pr-4 py-3 rounded-lg border text-lg ${
                theme === 'light' 
                  ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-100' 
                  : 'bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/50'
              }`}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              searchQuery.trim() && !isSearching
                ? (theme === 'light' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600')
                : (theme === 'light' 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-neutral-600 text-neutral-400 cursor-not-allowed')
            }`}
          >
            {isSearching ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              'ค้นหา'
            )}
          </button>
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${
          theme === 'light' 
            ? 'bg-gray-50 border border-gray-200' 
            : 'bg-neutral-800/50 border border-neutral-600'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              ประวัติการค้นหา
            </h3>
            <button
              onClick={clearHistory}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' 
                  : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600'
              }`}
            >
              ล้างประวัติ
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSearchQuery(item.query);
                  if (onNewSearch) {
                    onNewSearch(item.query);
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  theme === 'light' 
                    ? 'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50' 
                    : 'bg-neutral-700 border border-neutral-600 hover:border-neutral-500 hover:bg-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {item.timestamp.toLocaleString('th-TH')}
                  </span>
                </div>
                <p className={`font-medium text-sm mb-1 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {item.query}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-neutral-600 text-gray-300'
                  }`}>
                    {item.resultCount} รายการ
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    getConfidenceColor(item.avgConfidence)
                  }`}>
                    {(item.avgConfidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className={`p-6 rounded-lg mb-6 ${
          theme === 'light' 
            ? 'bg-gray-50 border border-gray-200' 
            : 'bg-neutral-800/50 border border-neutral-600'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            สถิติการค้นหา
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className={`font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  เอกสารทั้งหมด
                </span>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {documents.length}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className={`font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  ความเชื่อมั่นเฉลี่ย
                </span>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {documents.length > 0 
                  ? (documents.reduce((sum, doc) => sum + doc.confidence_score, 0) / documents.length * 100).toFixed(1)
                  : '0.0'
                }%
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className={`font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  ไฟล์ที่ไม่ซ้ำ
                </span>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {new Set(documents.map(doc => doc.filename)).size}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className={`font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  การค้นหาทั้งหมด
                </span>
              </div>
              <div className={`text-3xl font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>
                {searchHistory.length}
              </div>
            </div>
          </div>

          {/* Confidence Distribution */}
          <div className={`p-4 rounded-lg ${
            theme === 'light' ? 'bg-white border border-gray-200' : 'bg-neutral-700 border border-neutral-600'
          }`}>
            <h4 className={`text-lg font-semibold mb-3 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              การกระจายความเชื่อมั่น
            </h4>
            <div className="space-y-3">
              {[
                { label: 'สูง (≥80%)', threshold: 0.8, color: 'bg-green-500' },
                { label: 'ปานกลาง (60-79%)', threshold: 0.6, color: 'bg-yellow-500' },
                { label: 'ต่ำ (<60%)', threshold: 0, color: 'bg-red-500' }
              ].map(({ label, threshold, color }) => {
                const count = documents.filter(doc => 
                  threshold === 0 ? doc.confidence_score < 0.6 :
                  threshold === 0.6 ? doc.confidence_score >= 0.6 && doc.confidence_score < 0.8 :
                  doc.confidence_score >= threshold
                ).length;
                const percentage = documents.length > 0 ? (count / documents.length) * 100 : 0;
                
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`w-20 text-sm ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {label}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={`w-12 text-sm text-right ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Document Results */}
      <EnhancedDocumentDisplay 
        references={documents}
        query={query}
      />

      {/* Document Comparison Modal */}
      <DocumentComparison
        documents={documents}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
};

export default DocumentSearchDashboard;
