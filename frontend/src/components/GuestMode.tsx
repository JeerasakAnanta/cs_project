import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';

interface GuestModeProps {
  onLoginClick: () => void;
}

const GuestMode: React.FC<GuestModeProps> = ({ onLoginClick }) => {
  return (
    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-yellow-200">
              โหมดผู้เยี่ยมชม (Guest Mode)
            </h3>
            <button
              onClick={onLoginClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <LogIn className="w-3 h-3 mr-1" />
              เข้าสู่ระบบ
            </button>
          </div>
          <p className="text-sm text-yellow-100 mt-1">
            คุณกำลังใช้งานในโหมดผู้เยี่ยมชม ประวัติการสนทนาจะถูกเก็บในเครื่องของคุณเท่านั้น 
            หากต้องการเก็บประวัติในระบบ กรุณา{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestMode; 