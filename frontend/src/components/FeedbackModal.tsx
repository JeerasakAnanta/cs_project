import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string, feedbackType: string) => void;
}

const feedbackOptions = ['ไม่เกี่ยวกับปัญหาที่ถาม', 'ข้อมูลเท็จ', 'ไม่มีประโยชน์', 'อื่นๆ'];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(comment, selectedOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">ให้คะแนนคำตอบ</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 mb-2">กรุณาเลือกเหตุผลที่ท่านให้คะแนน:</p>
          <div className="flex flex-wrap gap-2">
            {feedbackOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedOption === option
                    ? 'bg-rmutl-brown text-white border-rmutl-brown'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="เราขอขอบคุณสำหรับความคิดเห็นของท่าน โปรดแสดงความคิดเห็นหรือข้อเสนอแนะเพื่อช่วยเราปรับปรุง"
            className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-rmutl-gold"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-rmutl-brown text-white rounded-md hover:bg-opacity-80"
            disabled={!selectedOption}
          >
            ส่ง
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal; 