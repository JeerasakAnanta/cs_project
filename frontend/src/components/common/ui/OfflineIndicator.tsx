import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '../../../contexts/OfflineContext';
import { useTheme } from '../../../contexts/ThemeContext';

const OfflineIndicator: React.FC = () => {
  const { isOnline, queuedMessages } = useOffline();
  const { theme } = useTheme();
  const [show, setShow] = React.useState(!isOnline);

  React.useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Show "back online" message briefly
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg backdrop-blur-md border transition-all duration-300 animate-slide-down safe-top ${
        isOnline
          ? theme === 'light'
            ? 'bg-green-100/90 border-green-300 text-green-800'
            : 'bg-green-900/90 border-green-700 text-green-200'
          : theme === 'light'
            ? 'bg-orange-100/90 border-orange-300 text-orange-800'
            : 'bg-orange-900/90 border-orange-700 text-orange-200'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">
              เชื่อมต่ออินเทอร์เน็ตแล้ว
              {queuedMessages.length > 0 && ` (กำลังส่งข้อความที่รอ...)`}
            </span>
          </>
        ) : (
          <>
            <WifiOff size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">
              ไม่มีการเชื่อมต่ออินเทอร์เน็ต
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

