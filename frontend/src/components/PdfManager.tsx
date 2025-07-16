import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_CHATBOT_API;

const PdfManager: React.FC = () => {
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/pdfs/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลไฟล์ได้');
      }
      const data = await response.json();
      setPdfs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus('กำลังอัปโหลด...');
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pdfs/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'การอัปโหลดล้มเหลว');
      }

      setUploadStatus('อัปโหลดสำเร็จ!');
      setSelectedFile(null);
      fetchPdfs(); // Refresh the list
    } catch (err) {
      setUploadStatus('');
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  const handleDelete = async (filename: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ ${filename}?`)) {
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/pdfs/${filename}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'การลบไฟล์ล้มเหลว');
        }
        
        fetchPdfs(); // Refresh the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบไฟล์');
      }
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-gray-800">จัดการไฟล์ PDF</h3>
      {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
      
      {/* Upload Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-2 text-gray-700">อัปโหลดไฟล์ใหม่</h4>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            อัปโหลด
          </button>
        </div>
        {uploadStatus && <p className="text-sm mt-2 text-gray-600">{uploadStatus}</p>}
      </div>

      {/* PDF List Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-2 text-gray-700">รายการไฟล์ทั้งหมด</h4>
        <ul className="space-y-2">
          {pdfs.map((pdf) => (
            <li key={pdf} className="flex justify-between items-center p-2 border-b">
              <span className="text-gray-800">{pdf}</span>
              <button
                onClick={() => handleDelete(pdf)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PdfManager; 