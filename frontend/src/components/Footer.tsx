// src/components/Footer.tsx
import React from 'react';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-white p-4 text-center">
      <QuestionAnswerIcon />
      Chatbot คู่มือปฏิบัติงาน การเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน Prototype v.(
      {import.meta.env.VITE_WEB_GUI})
      <p>
        &copy; {new Date().getFullYear()} Chatbot RMUTL LLM Prototype . All
        Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
