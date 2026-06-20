// src/components/Contact.tsx
import React from 'react';

const Management: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex justify-center text-center  space-x-4">
        <div className="space-x-4">
          <a
            className="text-3xl bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            href="/uploadpdf"
          >
            📂 Upload a PDF
          </a>
          <a
            className="text-3xl  bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            href="/pdfcrud"
          >
            📃 List PDFs
          </a>
        </div>
      </div>
    </div>
  );
};

export default Management;
