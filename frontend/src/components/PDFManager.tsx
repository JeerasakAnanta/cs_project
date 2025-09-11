import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

const BACKEND_API =
  import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';

interface PDFFile {
  filename: string;
  size_bytes: number;
  size_mb: number;
  created_at: string;
  modified_at: string;
  is_indexed: boolean;
  indexed_at?: string;
  indexing_status?: 'pending' | 'indexing' | 'completed' | 'failed';
  indexing_progress?: number;
}

interface PDFStats {
  total_files: number;
  indexed_files: number;
  not_indexed_files: number;
  total_size_mb: number;
  total_vectors_in_qdrant: number;
  indexing_percentage: number;
}

const PDFManager: React.FC = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [stats, setStats] = useState<PDFStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isIndexing, setIsIndexing] = useState<string | null>(null);
  const [indexingStatus, setIndexingStatus] = useState<{
    [key: string]: 'indexing' | 'success' | 'error' | undefined;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { theme } = useTheme();

  const authToken = localStorage.getItem('authToken');

  // Auto-hide notifications
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchFiles();
    fetchStats();

    // เริ่ม polling สำหรับสถานะการ indexing
    const interval = setInterval(() => {
      if (isIndexing) {
        fetchFiles(); // อัปเดตสถานะไฟล์
      }
    }, 2000); // อัปเดตทุก 2 วินาที

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isIndexing]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/api/pdfs/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else {
        setError('ไม่สามารถดึงข้อมูลไฟล์ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/api/pdfs/stats/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('กรุณาเลือกไฟล์ PDF เท่านั้น');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${BACKEND_API}/api/pdfs/upload/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (response.ok) {
        setSuccess(`อัปโหลดไฟล์ ${selectedFile.name} สำเร็จ`);
        setSelectedFile(null);
        fetchFiles();
        fetchStats();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsUploading(false);
    }
  };

  const handleIndex = async (filename: string) => {
    setIsIndexing(filename);
    setIndexingStatus((prev) => ({ ...prev, [filename]: 'indexing' }));
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_API}/api/pdfs/index/${filename}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message || `เริ่มต้นการ indexing ไฟล์ ${filename}`);

        // รอให้การ indexing เสร็จสิ้น
        waitForIndexingComplete(filename);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'เกิดข้อผิดพลาดในการ indexing');
        setIsIndexing(null);
        setIndexingStatus((prev) => ({ ...prev, [filename]: 'error' }));
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setIsIndexing(null);
      setIndexingStatus((prev) => ({ ...prev, [filename]: 'error' }));
    }
  };

  const waitForIndexingComplete = (filename: string) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_API}/api/pdfs/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.ok) {
          const files = await response.json();
          const file = files.find((f: PDFFile) => f.filename === filename);

          if (file && file.is_indexed) {
            // การ indexing เสร็จสิ้น
            clearInterval(checkInterval);
            setIsIndexing(null);
            setIndexingStatus((prev) => ({ ...prev, [filename]: 'success' }));
            setSuccess(`Successfully indexed ${filename}`);

            // อัปเดตข้อมูลไฟล์และสถิติ
            fetchFiles();
            fetchStats();

            // รีเซ็ตสถานะหลังจาก 3 วินาที
            setTimeout(() => {
              setIndexingStatus((prev) => ({ ...prev, [filename]: undefined }));
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error checking indexing status:', err);
      }
    }, 2000); // ตรวจสอบทุก 2 วินาที

    // หยุดการตรวจสอบหลังจาก 5 นาที
    setTimeout(() => {
      clearInterval(checkInterval);
      if (isIndexing === filename) {
        setIsIndexing(null);
        setIndexingStatus((prev) => ({ ...prev, [filename]: 'error' }));
        setError(`การ indexing ไฟล์ ${filename} ใช้เวลานานเกินไป`);
      }
    }, 300000); // 5 นาที
  };

  const handleReindex = async (filename: string) => {
    setIsIndexing(filename);
    setIndexingStatus((prev) => ({ ...prev, [filename]: 'indexing' }));
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_API}/api/pdfs/reindex/${filename}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSuccess(
          result.message || `เริ่มต้นการ re-indexing ไฟล์ ${filename}`
        );

        // รอให้การ re-indexing เสร็จสิ้น
        waitForIndexingComplete(filename);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'เกิดข้อผิดพลาดในการ re-indexing');
        setIsIndexing(null);
        setIndexingStatus((prev) => ({ ...prev, [filename]: 'error' }));
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setIsIndexing(null);
      setIndexingStatus((prev) => ({ ...prev, [filename]: 'error' }));
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบไฟล์ ${filename}?`)) return;

    setError(null);

    try {
      const response = await fetch(`${BACKEND_API}/api/pdfs/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        setSuccess(`ลบไฟล์ ${filename} สำเร็จ`);
        fetchFiles();
        fetchStats();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'เกิดข้อผิดพลาดในการลบไฟล์');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการไฟล์ PDF</h1>
          <p className="text-gray-600 mt-2">
            อัปโหลด จัดการ และ indexing ไฟล์ PDF สำหรับ RAG
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <BarChart3 className="w-4 h-4" />
          <span>ระบบจัดการเอกสาร</span>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ไฟล์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_files}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ไฟล์ที่ Index แล้ว</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.indexed_files}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ขนาดรวม</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total_size_mb} MB
                </p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vectors ใน Qdrant</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.total_vectors_in_qdrant}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          อัปโหลดไฟล์ PDF
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>เลือกไฟล์ PDF</span>
            </label>
            {selectedFile && (
              <span className="text-gray-600">{selectedFile.name}</span>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span>กำลังอัปโหลด...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>อัปโหลดไฟล์</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{success}</p>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          ไฟล์ PDF ทั้งหมด
        </h2>

        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <p className="text-neutral-400">ยังไม่มีไฟล์ PDF</p>
            <p className="text-sm text-neutral-500">
              อัปโหลดไฟล์ PDF แรกของคุณเพื่อเริ่มต้น
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-neutral-300">
                    ชื่อไฟล์
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-300">ขนาด</th>
                  <th className="text-left py-3 px-4 text-neutral-300">
                    สถานะ Indexing
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-300">
                    วันที่อัปโหลด
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-300">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr
                    key={file.filename}
                    className="border-b border-neutral-800 hover:bg-neutral-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="text-white">{file.filename}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {formatFileSize(file.size_bytes)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {isIndexing === file.filename ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-blue-500">
                              กำลัง Indexing...
                            </span>
                          </div>
                        ) : indexingStatus[file.filename] === 'success' ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">
                              Successfully indexed
                            </span>
                          </div>
                        ) : indexingStatus[file.filename] === 'error' ? (
                          <div className="flex items-center space-x-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500">
                              Indexing failed
                            </span>
                          </div>
                        ) : file.is_indexed ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">Indexed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500">Not Indexed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {isIndexing === file.filename ? (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>กำลังดำเนินการ...</span>
                          </div>
                        ) : !file.is_indexed ? (
                          <button
                            onClick={() => handleIndex(file.filename)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Index</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReindex(file.filename)}
                            className="flex items-center space-x-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Re-index</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(file.filename)}
                          disabled={isIndexing === file.filename}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>ลบ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFManager;
