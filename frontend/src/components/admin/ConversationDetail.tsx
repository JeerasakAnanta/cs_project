import React from 'react';
import { X, Clock, ThumbsUp, ThumbsDown, MessageSquare, User, Bot, Calendar, Star } from 'lucide-react';

interface Conversation {
  id: string;
  user_id: string;
  username: string;
  question: string;
  bot_response: string;
  satisfaction_rating?: number;
  response_time_ms?: number;
  created_at: string;
  updated_at: string;
}

interface ConversationDetailProps {
  conversation: Conversation | null;
  onClose: () => void;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ conversation, onClose }) => {
  if (!conversation) return null;

  const getSatisfactionIcon = (rating: number) => {
    if (rating >= 4) return <ThumbsUp className="w-6 h-6 text-green-500" />;
    if (rating === 3) return <MessageSquare className="w-6 h-6 text-yellow-500" />;
    return <ThumbsDown className="w-6 h-6 text-red-500" />;
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 1000) return 'text-green-500';
    if (time <= 2000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getResponseTimeLabel = (time: number) => {
    if (time <= 1000) return 'เร็วมาก';
    if (time <= 2000) return 'เร็ว';
    return 'ช้า';
  };

  const getSatisfactionLabel = (rating: number) => {
    if (rating >= 4) return 'พึงพอใจมาก';
    if (rating === 3) return 'ปานกลาง';
    if (rating === 2) return 'ไม่ค่อยพึงพอใจ';
    return 'ไม่พึงพอใจ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">
              รายละเอียดการสนทนา #{conversation.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">ผู้ใช้</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{conversation.username}</p>
              <p className="text-sm text-gray-500">ID: {conversation.user_id}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">วันที่สร้าง</span>
              </div>
              <p className="text-sm text-gray-900">{formatDate(conversation.created_at)}</p>
              <p className="text-xs text-gray-500">
                อัปเดต: {formatDate(conversation.updated_at)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">เวลาตอบสนอง</span>
              </div>
              <p className={`text-lg font-semibold ${getResponseTimeColor(conversation.response_time_ms || 0)}`}>
                {formatDuration(conversation.response_time_ms || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {getResponseTimeLabel(conversation.response_time_ms || 0)}
              </p>
            </div>
          </div>

          {/* Satisfaction Rating */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ความพึงพอใจของผู้ใช้</h3>
                <div className="flex items-center gap-3">
                  {getSatisfactionIcon(conversation.satisfaction_rating || 0)}
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {conversation.satisfaction_rating || 'N/A'}/5
                    </p>
                    <p className="text-sm text-gray-600">
                      {getSatisfactionLabel(conversation.satisfaction_rating || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Star Rating Display */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= (conversation.satisfaction_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Question Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              คำถามจากผู้ใช้
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-800 text-lg leading-relaxed">{conversation.question}</p>
            </div>
          </div>

          {/* Bot Response Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-500" />
              คำตอบจาก Bot
            </h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-gray-800 text-lg leading-relaxed">{conversation.bot_response}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">เมตริกประสิทธิภาพ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-600">เวลาตอบสนอง</span>
                <span className={`font-semibold ${getResponseTimeColor(conversation.response_time_ms || 0)}`}>
                  {conversation.response_time_ms || 'N/A'}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-600">ความพึงพอใจ</span>
                <span className="font-semibold text-gray-900">
                  {conversation.satisfaction_rating || 'N/A'}/5
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-600">สถานะ</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  เสร็จสิ้น
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-gray-600">ประเภท</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  คำถามทั่วไป
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ปิด
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              แก้ไข
            </button>
            <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors">
              ส่งออก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
