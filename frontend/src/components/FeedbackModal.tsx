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
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">ให้คะแนนคำตอบ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-300 mb-2">กรุณาเลือกเหตุผลที่ท่านให้คะแนน:</p>
          <div className="flex flex-wrap gap-2">
            {feedbackOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedOption === option
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
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
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500"
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