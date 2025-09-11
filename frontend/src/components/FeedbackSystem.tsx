import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface FeedbackProps {
  messageId: string;
  conversationId: string;
  onFeedbackSubmit?: (rating: number, feedback?: string) => void;
}

interface FeedbackFormProps {
  onSubmit: (feedback: FeedbackData) => void;
  onCancel: () => void;
}

interface FeedbackData {
  feedback_type: string;
  feedback_text: string;
  category?: string;
  priority?: string;
}

const FeedbackSystem: React.FC<FeedbackProps> = ({
  messageId,
  conversationId,
  onFeedbackSubmit,
}) => {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
    setShowRating(false);

    if (onFeedbackSubmit) {
      onFeedbackSubmit(selectedRating, feedbackText);
    }

    // ส่ง feedback ไปยัง API
    submitRating(selectedRating, feedbackText);
  };

  const submitRating = async (ratingValue: number, feedback?: string) => {
    try {
      const response = await fetch('/api/feedback/rate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_id: messageId,
          rating: ratingValue,
          feedback_text: feedback,
        }),
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleFeedbackSubmit = (feedbackData: FeedbackData) => {
    // ส่ง feedback ไปยัง API
    submitFeedback(feedbackData);
    setShowFeedbackForm(false);
  };

  const submitFeedback = async (feedbackData: FeedbackData) => {
    try {
      const response = await fetch('/api/feedback/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (rating > 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>ขอบคุณสำหรับการให้คะแนน!</span>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {!showRating && !showFeedbackForm && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRating(true)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <Star className="h-4 w-4" />
            <span>ให้คะแนนคำตอบนี้</span>
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ส่งข้อเสนอแนะ
          </button>
        </div>
      )}

      {showRating && (
        <div className="mt-2">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 mr-2">ให้คะแนน:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                {star <= (hoverRating || rating) ? (
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                ) : (
                  <Star className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <textarea
              placeholder="ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      )}

      {showFeedbackForm && (
        <FeedbackForm
          onSubmit={handleFeedbackSubmit}
          onCancel={() => setShowFeedbackForm(false)}
        />
      )}
    </div>
  );
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, onCancel }) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    feedback_type: 'general',
    feedback_text: '',
    category: 'suggestion',
    priority: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackData.feedback_text.trim()) {
      onSubmit(feedbackData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 bg-gray-50 rounded-md">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ประเภทข้อเสนอแนะ
          </label>
          <select
            value={feedbackData.feedback_type}
            onChange={(e) =>
              setFeedbackData({
                ...feedbackData,
                feedback_type: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">ทั่วไป</option>
            <option value="bug">ข้อผิดพลาด</option>
            <option value="feature">ฟีเจอร์ใหม่</option>
            <option value="improvement">การปรับปรุง</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ข้อเสนอแนะ
          </label>
          <textarea
            required
            value={feedbackData.feedback_text}
            onChange={(e) =>
              setFeedbackData({
                ...feedbackData,
                feedback_text: e.target.value,
              })
            }
            placeholder="กรุณาเขียนข้อเสนอแนะของคุณ..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่
            </label>
            <select
              value={feedbackData.category}
              onChange={(e) =>
                setFeedbackData({ ...feedbackData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="suggestion">ข้อเสนอแนะ</option>
              <option value="complaint">ข้อร้องเรียน</option>
              <option value="praise">คำชม</option>
              <option value="question">คำถาม</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความสำคัญ
            </label>
            <select
              value={feedbackData.priority}
              onChange={(e) =>
                setFeedbackData({ ...feedbackData, priority: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">ต่ำ</option>
              <option value="medium">ปานกลาง</option>
              <option value="high">สูง</option>
              <option value="urgent">เร่งด่วน</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ส่งข้อเสนอแนะ
          </button>
        </div>
      </div>
    </form>
  );
};

export default FeedbackSystem;
