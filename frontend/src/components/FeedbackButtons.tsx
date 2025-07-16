import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackButtonsProps {
  messageId: number;
  onFeedbackSubmit: (feedbackType: 'like' | 'dislike', comment?: string, reason?: string) => void;
  onDislikeClick: () => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ messageId, onFeedbackSubmit, onDislikeClick }) => {
  const [feedbackSent, setFeedbackSent] = useState<'like' | 'dislike' | null>(null);

  const handleLike = () => {
    if (feedbackSent) return;
    onFeedbackSubmit('like');
    setFeedbackSent('like');
  };

  const handleDislike = () => {
    if (feedbackSent) return;
    onDislikeClick();
    setFeedbackSent('dislike');
    // The actual submission will be handled by the modal
  };

  return (
    <div className="flex items-center space-x-2 mt-2">
      <button
        onClick={handleLike}
        className={`p-1 rounded-full transition-colors ${feedbackSent === 'like'
            ? 'text-white bg-rmutl-gold'
            : 'text-gray-500 hover:text-rmutl-gold'
          }`}
        disabled={!!feedbackSent}
      >
        <ThumbsUp size={16} />
      </button>
      <button
        onClick={handleDislike}
        className={`p-1 rounded-full transition-colors ${feedbackSent === 'dislike'
            ? 'text-white bg-rmutl-brown'
            : 'text-gray-500 hover:text-rmutl-brown'
          }`}
        disabled={!!feedbackSent}
      >
        <ThumbsDown size={16} />
      </button>
    </div>
  );
};

export default FeedbackButtons; 