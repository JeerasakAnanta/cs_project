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
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_API = import.meta.env.VITE_BACKEND_CHATBOT_API || 'http://localhost:8001';

interface PDFFile {
  filename: string;
  size_bytes: number;
  size_mb: number;
  created_at: string;
  modified_at: string;
  is_indexed: boolean;
  indexed_at?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

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
    setError(null);

    try {
      const response = await fetch(`${BACKEND_API}/api/pdfs/index/${filename}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        setSuccess(`เริ่มต้นการ indexing ไฟล์ ${filename}`);
        // Refresh files after a delay to check indexing status
        setTimeout(() => {
          fetchFiles();
          fetchStats();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'เกิดข้อผิดพลาดในการ indexing');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsIndexing(null);
    }
  };

  const handleReindex = async (filename: string) => {
    setIsIndexing(filename);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_API}/api/pdfs/reindex/${filename}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        setSuccess(`เริ่มต้นการ re-indexing ไฟล์ ${filename}`);
        setTimeout(() => {
          fetchFiles();
          fetchStats();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'เกิดข้อผิดพลาดในการ re-indexing');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsIndexing(null);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">จัดการไฟล์ PDF</h1>
          <p className="text-neutral-400 mt-2">อัปโหลด จัดการ และ indexing ไฟล์ PDF สำหรับ RAG</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-neutral-400">
          <BarChart3 className="w-4 h-4" />
          <span>ระบบจัดการเอกสาร</span>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">ไฟล์ทั้งหมด</p>
                <p className="text-2xl font-bold text-white">{stats.total_files}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">ไฟล์ที่ Index แล้ว</p>
                <p className="text-2xl font-bold text-green-500">{stats.indexed_files}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">ขนาดรวม</p>
                <p className="text-2xl font-bold text-white">{stats.total_size_mb} MB</p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Vectors ใน Qdrant</p>
                <p className="text-2xl font-bold text-orange-500">{stats.total_vectors_in_qdrant}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">อัปโหลดไฟล์ PDF</h2>
        
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
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>เลือกไฟล์ PDF</span>
            </label>
            {selectedFile && (
              <span className="text-neutral-300">{selectedFile.name}</span>
            )}
          </div>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        <h2 className="text-xl font-semibold text-white mb-4">ไฟล์ PDF ทั้งหมด</h2>
        
        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <p className="text-neutral-400">ยังไม่มีไฟล์ PDF</p>
            <p className="text-sm text-neutral-500">อัปโหลดไฟล์ PDF แรกของคุณเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-neutral-300">ชื่อไฟล์</th>
                  <th className="text-left py-3 px-4 text-neutral-300">ขนาด</th>
                  <th className="text-left py-3 px-4 text-neutral-300">สถานะ Indexing</th>
                  <th className="text-left py-3 px-4 text-neutral-300">วันที่อัปโหลด</th>
                  <th className="text-left py-3 px-4 text-neutral-300">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.filename} className="border-b border-neutral-800 hover:bg-neutral-800/50">
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
                        {file.is_indexed ? (
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
                        {!file.is_indexed ? (
                          <button
                            onClick={() => handleIndex(file.filename)}
                            disabled={isIndexing === file.filename}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
                          >
                            {isIndexing === file.filename ? (
                              <LoadingSpinner />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>Index</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReindex(file.filename)}
                            disabled={isIndexing === file.filename}
                            className="flex items-center space-x-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm disabled:opacity-50"
                          >
                            {isIndexing === file.filename ? (
                              <LoadingSpinner />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            <span>Re-index</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(file.filename)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
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
