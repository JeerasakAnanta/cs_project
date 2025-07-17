import React, { useEffect, useState } from 'react';

const VITE_HOST = import.meta.env.VITE_BACKEND_DOCS_API;

const PdfCrud: React.FC = () => {
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await fetch(`${VITE_HOST}/pdflist`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const { pdfs } = await response.json();
      if (Array.isArray(pdfs)) {
        setPdfs(pdfs);
      } else {
        console.error('Expected an array of PDFs, but received:', pdfs);
        setPdfs([]);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      setPdfs([]);
    }
  };

  const handleCheckboxChange = (pdf: string) => {
    setSelectedPdfs((prevState) =>
      prevState.includes(pdf)
        ? prevState.filter((item) => item !== pdf)
        : [...prevState, pdf]
    );
  };

  const handleDelete = async () => {
    if (selectedPdfs.length === 0) {
      alert('❌ Please select at least one PDF to delete. ❌');
      return;
    }

    const confirm = window.confirm(
      '❗ Are you sure you want to delete the selected PDFs? ❗'
    );
    if (!confirm) return;

    const deletePromises = selectedPdfs.map((filename) =>
      fetch(`${VITE_HOST}/delete/${filename}`, { method: 'DELETE' })
    );

    try {
      await Promise.all(deletePromises);
      // Refetch the PDF list after deletion
      fetchPdfs();
      setSelectedPdfs([]); // Reset selected PDFs state
    } catch (error) {
      console.error('Error deleting PDFs:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🗃 มาตรการสินเชื่อที่ upload</h1>
      </div>

      <div className="bg-gray-200 p-4 mt-4">
        <ul>
          {Array.isArray(pdfs) && pdfs.length > 0 ? (
            pdfs.map((pdf) => (
              <li key={pdf} className="flex items-center justify-start">
                <input
                  type="checkbox"
                  checked={selectedPdfs.includes(pdf)}
                  onChange={() => handleCheckboxChange(pdf)}
                />
                <a
                  href={`${VITE_HOST}/${pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {pdf}
                </a>
              </li>
            ))
          ) : (
            <li>No PDFs available or an error occurred.</li>
          )}
        </ul>
      </div>

      <div className="flex justify-between p-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={handleDelete}
        >
          ลบ
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">
          Re-embedding
        </button>
      </div>
    </div>
  );
};

export default PdfCrud;
