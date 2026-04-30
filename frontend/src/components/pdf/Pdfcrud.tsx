import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Trash2,
  Download,
  Eye,
  Upload,
  RefreshCw,
  CheckCircle,
  Database,
  Search,
} from 'lucide-react';

// Fix: Use correct backend port (8001) instead of incorrect port (8004)
const VITE_HOST =
  import.meta.env.VITE_BACKEND_DOCS_API || 'http://localhost:8001';

const PdfCrud: React.FC = () => {
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPdfs, setFilteredPdfs] = useState<string[]>([]);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching PDFs from:', `${VITE_HOST}/api/pdfs/`);

      // Get authentication token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.warn('⚠️ No authentication token found, PDFs may not load');
        setPdfs([]);
        return;
      }

      const response = await fetch(`${VITE_HOST}/api/pdfs/`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'ไม่ได้รับอนุญาตให้เข้าถึง PDFs กรุณาเข้าสู่ระบบใหม่'
          );
        }
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const pdfs = await response.json();
      if (Array.isArray(pdfs)) {
        setPdfs(pdfs);
        console.log('✅ PDFs fetched successfully:', pdfs.length, 'files');
      } else {
        console.error('Expected an array of PDFs, but received:', pdfs);
        setPdfs([]);
      }
    } catch (error) {
      console.error('❌ Error fetching PDFs:', error);
      setPdfs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPdfs = useCallback(() => {
    if (!searchTerm) {
      setFilteredPdfs(pdfs);
    } else {
      const filtered = pdfs.filter((pdf) =>
        pdf.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPdfs(filtered);
    }
  }, [pdfs, searchTerm]);

  useEffect(() => {
    filterPdfs();
  }, [filterPdfs]);

  const handleCheckboxChange = (pdf: string) => {
    setSelectedPdfs((prevState) =>
      prevState.includes(pdf)
        ? prevState.filter((item) => item !== pdf)
        : [...prevState, pdf]
    );
  };

  const handleSelectAll = () => {
    if (selectedPdfs.length === filteredPdfs.length) {
      setSelectedPdfs([]);
    } else {
      setSelectedPdfs(filteredPdfs);
    }
  };

  const handleDelete = async () => {
    if (selectedPdfs.length === 0) {
      alert('❌ กรุณาเลือกไฟล์ PDF อย่างน้อย 1 ไฟล์เพื่อลบ ❌');
      return;
    }

    const confirm = window.confirm(
      `❗ คุณแน่ใจหรือไม่ที่จะลบไฟล์ PDF ที่เลือก (${selectedPdfs.length} ไฟล์)? ❗`
    );
    if (!confirm) return;

    // Get authentication token
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('⚠️ ไม่พบข้อมูลการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    const deletePromises = selectedPdfs.map((filename) =>
      fetch(`${VITE_HOST}/api/pdfs/${filename}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
    );

    try {
      await Promise.all(deletePromises);
      fetchPdfs();
      setSelectedPdfs([]);
    } catch (error) {
      console.error('Error deleting PDFs:', error);
      alert('เกิดข้อผิดพลาดในการลบไฟล์ PDF');
    }
  };

  const handleReembedding = async () => {
    if (selectedPdfs.length === 0) {
      alert('❌ กรุณาเลือกไฟล์ PDF อย่างน้อย 1 ไฟล์เพื่อ Re-embedding ❌');
      return;
    }

    const confirm = window.confirm(
      `❗ คุณแน่ใจหรือไม่ที่จะทำ Re-embedding ไฟล์ PDF ที่เลือก (${selectedPdfs.length} ไฟล์)? ❗`
    );
    if (!confirm) return;

    // TODO: Implement re-embedding functionality
    alert('ฟีเจอร์ Re-embedding กำลังอยู่ในระหว่างการพัฒนา');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">กำลังโหลดไฟล์ PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-neutral-400 text-sm">
              จัดการไฟล์ PDF ในระบบ ({pdfs.length} ไฟล์)
            </p>
          </div>
        </div>
        <button onClick={fetchPdfs} className="btn-secondary flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          รีเฟรช
        </button>
      </div>

      {/* Search and Actions */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="ค้นหาไฟล์ PDF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSelectAll}
              className="btn-secondary flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {selectedPdfs.length === filteredPdfs.length
                ? 'ยกเลิกเลือกทั้งหมด'
                : 'เลือกทั้งหมด'}
            </button>
            <button
              onClick={handleDelete}
              disabled={selectedPdfs.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบ ({selectedPdfs.length})
            </button>
            <button
              onClick={handleReembedding}
              disabled={selectedPdfs.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
            >
              <Database className="w-4 h-4 mr-2" />
              Re-embedding ({selectedPdfs.length})
            </button>
          </div>
        </div>
      </div>

      {/* PDF List */}
      <div className="card">
        {filteredPdfs.length > 0 ? (
          <div className="divide-y divide-neutral-700">
            {filteredPdfs.map((pdf) => (
              <div
                key={pdf}
                className="flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors duration-200"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedPdfs.includes(pdf)}
                    onChange={() => handleCheckboxChange(pdf)}
                    className="w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500 focus:ring-2 mr-4"
                  />
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{pdf}</p>
                      <p className="text-neutral-400 text-sm">ไฟล์ PDF</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <a
                    href={`${VITE_HOST}/${pdf}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                    title="ดูไฟล์"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={`${VITE_HOST}/${pdf}`}
                    download
                    className="p-2 text-neutral-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                    title="ดาวน์โหลด"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-400 mb-2">
              {searchTerm ? 'ไม่พบไฟล์ PDF' : 'ยังไม่มีไฟล์ PDF'}
            </h3>
            <p className="text-neutral-500 text-sm">
              {searchTerm
                ? 'ลองเปลี่ยนคำค้นหา'
                : 'อัปโหลดไฟล์ PDF แรกของคุณเพื่อเริ่มต้น'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="card p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            อัปโหลดไฟล์ PDF ใหม่
          </h3>
          <p className="text-neutral-400 text-sm mb-4">
            ลากและวางไฟล์ PDF หรือคลิกเพื่อเลือกไฟล์
          </p>
          <button className="btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            เลือกไฟล์ PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfCrud;
