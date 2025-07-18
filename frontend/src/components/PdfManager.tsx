import React from 'react';
import PdfCrud from './Pdfcrud';

const PdfManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-3 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            จัดการไฟล์ PDF
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            อัปโหลด จัดการ และควบคุมเอกสาร PDF ในระบบ
          </p>
        </div>
      </div>

      {/* PDF Management Content */}
      <div className="card">
        <PdfCrud />
      </div>
    </div>
  );
};

export default PdfManager; 