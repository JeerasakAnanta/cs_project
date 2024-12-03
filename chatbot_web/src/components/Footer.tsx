// src/components/Footer.tsx
import React from 'react';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-800 text-white p-4 text-center ">
      <QuestionAnswerIcon />
      Chatbot มาตรการสินเชื่อ Prototype v.({import.meta.env.VITE_WEB_GUI})
      <p>
        &copy; {new Date().getFullYear()} Chatbot LLM BAAC x SuperAI. All Rights
        Reserved.
      </p>
    </footer>
  );
};

export default Footer;
