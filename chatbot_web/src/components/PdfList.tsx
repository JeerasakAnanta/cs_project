// src/components/About.tsx
import React, { useEffect, useState } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

// Host  web api list
const HOST = import.meta.env.VITE_BACKEND_DOCS_API;

// link to web static web
const DOCS_STATIC = import.meta.env.VITE_BACKEND_DOCS_STATIC;

const PdfList: React.FC = () => {
  const [pdfList, setPdfList] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${HOST}/pdflist`, {
      headers: {
        accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPdfList(data.pdfs);
      });
  }, []);

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
