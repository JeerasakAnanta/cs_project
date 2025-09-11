import { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  MessageSquare,
  Shield,
  Info,
  Save,
  Monitor,
  Volume2,
  Database,
  Trash2,
} from 'lucide-react';

const menus = [
  { id: 'general', label: 'ทั่วไป', icon: SettingsIcon },
  { id: 'interface', label: 'อินเทอร์เฟซ', icon: Monitor },
  { id: 'personalization', label: 'ส่วนบุคคล', icon: User },
  { id: 'audio', label: 'เสียง', icon: Volume2 },
  { id: 'chats', label: 'การสนทนา', icon: MessageSquare },
  { id: 'account', label: 'บัญชี', icon: User },
  { id: 'admin', label: 'ผู้ดูแลระบบ', icon: Shield },
  { id: 'about', label: 'เกี่ยวกับ', icon: Info },
];

const General = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">การตั้งค่าทั่วไป</h2>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ธีม</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                defaultChecked
                className="mr-3"
              />
              <span className="text-neutral-300">โหมดมืด (แนะนำ)</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="theme" value="light" className="mr-3" />
              <span className="text-neutral-300">โหมดสว่าง</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="theme" value="auto" className="mr-3" />
              <span className="text-neutral-300">อัตโนมัติ</span>
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ภาษา</h3>
          <select className="input-field">
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            การแจ้งเตือน
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-neutral-300">แจ้งเตือนข้อความใหม่</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-neutral-300">แจ้งเตือนเสียง</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const Interface = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        การตั้งค่าอินเทอร์เฟซ
      </h2>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            โมเดลเริ่มต้น
          </h3>
          <select className="input-field">
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5">GPT-3.5</option>
          </select>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">การแสดงผล</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-neutral-300">แสดงการพิมพ์</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-neutral-300">แสดงเวลาส่งข้อความ</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const Personalization = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        การตั้งค่าส่วนบุคคล
      </h2>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">การปรับแต่ง</h3>
        <p className="text-neutral-400">ฟีเจอร์นี้จะมาเร็วๆ นี้</p>
      </div>
    </div>
  );
};

const Audio = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">การตั้งค่าเสียง</h2>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            การแปลงเสียงเป็นข้อความ (STT)
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <span className="text-neutral-300">
                ส่งข้อความอัตโนมัติหลังการแปลงเสียง
              </span>
            </label>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            การแปลงข้อความเป็นเสียง (TTS)
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-neutral-300">
                เล่นเสียงตอบกลับอัตโนมัติ
              </span>
            </label>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                เลือกเสียง
              </label>
              <select className="input-field">
                <option value="th-female">เสียงหญิงไทย</option>
                <option value="th-male">เสียงชายไทย</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chats = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">การจัดการการสนทนา</h2>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            การนำเข้า/ส่งออก
          </h3>
          <div className="space-y-3">
            <button className="btn-secondary w-full">
              <Database className="w-4 h-4 mr-2" />
              นำเข้าการสนทนา
            </button>
            <button className="btn-secondary w-full">
              <Database className="w-4 h-4 mr-2" />
              ส่งออกการสนทนา
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            การจัดการข้อมูล
          </h3>
          <div className="space-y-3">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 w-full">
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              เก็บถาวรการสนทนาทั้งหมด
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 w-full">
              <Trash2 className="w-4 h-4 mr-2 inline" />
              ลบการสนทนาทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Account = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">การตั้งค่าบัญชี</h2>

      <div className="space-y-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            ข้อมูลส่วนตัว
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                รูปโปรไฟล์
              </label>
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                ชื่อ
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="ชื่อของคุณ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                เปลี่ยนรหัสผ่าน
              </label>
              <button className="btn-secondary">เปลี่ยนรหัสผ่าน</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        การตั้งค่าผู้ดูแลระบบ
      </h2>

      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-amber-500 mr-3" />
          <h3 className="text-lg font-semibold text-white">
            แผงควบคุมผู้ดูแลระบบ
          </h3>
        </div>
        <p className="text-neutral-400 mb-4">
          เข้าถึงการตั้งค่าขั้นสูงสำหรับผู้ดูแลระบบ
        </p>
        <button className="btn-primary">
          <Shield className="w-4 h-4 mr-2" />
          ไปยังแผงควบคุม
        </button>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">เกี่ยวกับ</h2>

      <div className="card p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Info className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">LannaFinChat</h3>
          <p className="text-neutral-400 mb-4">เวอร์ชัน 1.0.0</p>
          <p className="text-neutral-400 text-sm mb-6">
            ระบบ AI Assistant สำหรับการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน
          </p>
          <div className="text-xs text-neutral-500">
            © 2025 LannaFinChat. Developed by CS RMUTL NAN. All rights
            reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const [activeMenu, setActiveMenu] = useState(menus[0].id);

  const renderContent = () => {
    switch (activeMenu) {
      case 'general':
        return <General />;
      case 'interface':
        return <Interface />;
      case 'personalization':
        return <Personalization />;
      case 'audio':
        return <Audio />;
      case 'chats':
        return <Chats />;
      case 'account':
        return <Account />;
      case 'admin':
        return <AdminSettings />;
      case 'about':
        return <About />;
      default:
        return <General />;
    }
  };

  return (
    <div className="flex h-screen bg-chat-bg">
      {/* Sidebar */}
      <div className="w-80 bg-chat-sidebar border-r border-neutral-700/50 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text flex items-center">
            <SettingsIcon className="w-6 h-6 mr-3" />
            การตั้งค่า
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            ปรับแต่งการตั้งค่าระบบ
          </p>
        </div>

        <nav className="space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <button
                key={menu.id}
                onClick={() => setActiveMenu(menu.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                  activeMenu === menu.id
                    ? 'bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 shadow-lg'
                    : 'hover:bg-neutral-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                      activeMenu === menu.id
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-glow'
                        : 'bg-neutral-700/50 group-hover:bg-neutral-600/50'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeMenu === menu.id
                          ? 'text-white'
                          : 'text-neutral-400 group-hover:text-neutral-300'
                      }`}
                    />
                  </div>
                  <span
                    className={`font-medium ${
                      activeMenu === menu.id
                        ? 'text-white'
                        : 'text-neutral-300 group-hover:text-white'
                    }`}
                  >
                    {menu.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

        {/* Save Button */}
        <div className="p-6 border-t border-neutral-700/50 bg-neutral-800/30 backdrop-blur-sm">
          <button className="btn-primary flex items-center">
            <Save className="w-4 h-4 mr-2" />
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
