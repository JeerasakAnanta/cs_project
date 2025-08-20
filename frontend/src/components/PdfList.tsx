// src/components/About.tsx
import React, { useState, useEffect } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Fix: Use correct backend port (8001) instead of incorrect port
const HOST = import.meta.env.VITE_BACKEND_DOCS_API || 'http://localhost:8001';

// link to web static web
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

const PdfList: React.FC = () => {
  const [pdfList, setPdfList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        // Get authentication token
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          console.warn('⚠️ No authentication token found, PDFs may not load');
          setPdfList([]);
          return;
        }

        const response = await fetch(`${HOST}/api/pdfs/`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('ไม่ได้รับอนุญาตให้เข้าถึง PDFs กรุณาเข้าสู่ระบบใหม่');
            return;
          }
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setPdfList(data);
        } else {
          console.error('Expected an array of PDFs, but received:', data);
          setPdfList([]);
        }
      } catch (error) {
        console.error('Error fetching PDFs:', error);
        setError('เกิดข้อผิดพลาดในการโหลดรายการ PDF');
        setPdfList([]);
      }
    };

    fetchPdfs();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto min-h-screen">
        <div className="text-center text-red-500 p-4">
          <h1 className="text-xl font-bold">⚠️ เกิดข้อผิดพลาด</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen">
      <div className="container myPictureAsPdfIcon-5 h-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            🗃 รายการเอกสารที่ ChatBot สามารถตอบได้
          </h1>
        </div>

        <ul className="container bg-gray-200 p-4 mt-4">
          {pdfList.map((item) => (
            <li key={item} className="h-100 d-flex align-items-center">
              <a
                href={`${DOCS_STATIC}/${item}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FolderOpenIcon />
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PdfList;
