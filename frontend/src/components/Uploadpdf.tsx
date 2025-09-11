// src/components/Uploadpdf.tsx
import React, { useState } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

// Fix: Use correct backend port (8001) instead of incorrect port
const VITE_HOST =
  import.meta.env.VITE_BACKEND_DOCS_API || 'http://localhost:8001';

const Uploadpdf: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setStatusText('กรุณาเลือกไฟล์ PDF เท่านั้น.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setStatusText('');
      }
    }
  };

  // upload function
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusText('กรุณาเลือกไฟล์ก่อนอัปโหลด.');
      return;
    }

    // Check authentication
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setStatusText('⚠️ ไม่พบข้อมูลการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    setStatusText('');
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`${VITE_HOST}/api/pdfs/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authToken}`,
        },
      });
      setStatusText('อัปโหลดสำเร็จ!');
      setSelectedFile(null); // Reset the selected file
    } catch (err: any) {
      if (err.response?.status === 401) {
        setStatusText('⚠️ ไม่ได้รับอนุญาตให้อัปโหลด PDF กรุณาเข้าสู่ระบบใหม่');
      } else {
        setStatusText('เกิดข้อผิดพลาดในการอัปโหลด. กรุณาลองใหม่อีกครั้ง.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2 min-h-screen">
      <div className="bg-gray-200 px-6 py-8 rounded shadow-md text-black w-full">
        <h1 className="mb-8 text-3xl text-center">อัปโหลดไฟล์ PDF</h1>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            name="file"
            accept=".pdf"
            required
            className="block appearance-none w-full px-3 py-2 border border-gray-300 rounded mb-3"
            onChange={handleFileChange}
          />
          <button
            type="submit"
            className="w-full text-center py-3 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none my-1"
          >
            {isLoading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              'อัปโหลด'
            )}
          </button>
          {statusText && (
            <p
              className={`text-${statusText === 'อัปโหลดสำเร็จ!' ? 'green-600' : 'red-600'}`}
            >
              {statusText}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Uploadpdf;
