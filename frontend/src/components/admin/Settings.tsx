import { useState } from 'react';

const menus = [
  'General',
  'Interface',
  'Personalization',
  'Audio',
  'Chats',
  'Account',
  'Admin Settings',
  'About',
];

const General = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1 className="text-start text-3xl col-span-1">General</h1>
      <div> WebUI Settings </div>
      <div> Theme</div>
      <div> Language </div>
      <div> Notifications </div>
      <hr />
      <div> System Prompt </div>
    </div>
  );
};
const Interface = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>Interface</h1>
      <div>Default Model</div>
      <div> UI </div>
      <div> Chat </div>
      <div> Voice </div>
    </div>
  );
};

const Personalization = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>Personalization</h1>
    </div>
  );
};
const Audio = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>Audio</h1>
      <div className="space-y-2">STT Setting : Speedch-to-Text Engine </div>
      <div className="text-sm space-y-2">
        Instant Auto-Send After Voice Transcription{' '}
      </div>
      <div className="text-2xl"> TTS setttings </div>
      <div className=""> auto-playback Responsese </div>
      <hr />
      <div className=""> Set Voice </div>
    </div>
  );
};

const Chats = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>Chats</h1>
      <div> Import Chats </div>
      <div> Export Chats </div>
      <hr />
      <div> Archive All Chats </div>
      <div> Delete All Chats </div>
    </div>
  );
};

const Account = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>Account</h1>
      <div> Profile Image </div>
      <div> Name </div>
      <div>Change Password</div>
    </div>
  );
};

const AdminSettings = () => {
  return (
    <div>
      {/* Link to Admin Panel */}
      <h1>Admin Setting </h1>
    </div>
  );
};

const About = () => {
  return (
    <div>
      {/* Add your component content here */}
      <h1>About</h1>
    </div>
  );
};

const Settings = () => {
  const [activeMenu, setActiveMenu] = useState(menus[0]);

  return (
    <div className="">
      <h1 className="text-start text-3xl col-span-1">Settings</h1>
      <div className="grid grid-cols-2">
        <div className="w-20">
          {' '}
          Menu
          <div className="space-y-2">
            {menus.map((menu) => (
              <button
                key={menu}
                className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600"
                onClick={() => setActiveMenu(menu)}
              >
                {menu}
              </button>
            ))}
          </div>
        </div>
        <div>
          {' '}
          Choice
          <div className="p-4 m-4 border-2 border-gray-500 rounded-md">
            {activeMenu === 'General' && <General />}
            {activeMenu === 'Interface' && <Interface />}
            {activeMenu === 'Personalization' && <Personalization />}
            {activeMenu === 'Audio' && <Audio />}
            {activeMenu === 'Chats' && <Chats />}
            {activeMenu === 'Account' && <Account />}
            {activeMenu === 'Admin Settings' && <AdminSettings />}
            {activeMenu === 'About' && <About />}
          </div>
          {/* Save button  */}
          <button className="text-2xl bg-green-700 hover:bg-green-800  text-white rounded-md m-1 p-1 text-justify-end">
            {' '}
            Save{' '}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
