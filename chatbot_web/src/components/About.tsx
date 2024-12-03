// src/components/Contact.tsx
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold text-green-700 mb-4 text-center">
        แนะนำ น้องน้ำหวาน แชทบอท มารตรการสินเชื่อ{' '}
      </h1>

      <p className="mb-4">
        {' '}
        " <b>แชทบอท น้องน้ำหวาน </b> RAG
        มารถสื่อสารกับผู้ใช้ผ่านข้อความได้โดยอัตโนมัติ จะแนะนำในวันนี้คือ
        “น้องน้ำหวาน” ที่พัฒนาขึ้นโดยใช้เทคโนโลยี{' '}
        <b> RAG (Retrieval-Augmented Generation) </b> ที่ทำให้สามารถตอบคำถาม
        เกี่ยวกับเรื่องมาตราการสินเชื่อ หรือ สนทนาได้อย่างมีประสิทธิภาพ"
      </p>

      <h2 className="text-2xl font-bold font-semibold text-gray-800 mb-2">
        RAG (Retrieval-Augmented Generation) คืออะไร?
      </h2>
      <img
        src="https://python.langchain.com/assets/images/rag_retrieval_generation-1046a4668d6bb08786ef73c56d4f228a.png"
        className="w-1/2 mx-auto mb-4"
        alt="RAG (Retrieval-Augmented Generation)"
      />
      <p className="mb-4">
        RAG เป็นเทคนิครวมการค้นหาข้อมูลเอกสารเกี่ยวมารตาการสินเชื่อ{' '}
        <b> (retrieval) </b> เข้ากับการสร้างข้อความ <b> (generation) </b>โดย
        โดยใช้ model ภาษาขนาดใหญ่ <b> LLM ( Large language model </b>)
        การนำข้อมูลจากฐานข้อมูลหรือ เอกสารที่มีอยู่มาใช้เป็นข้อมูลเสริม
        ในการสร้างข้อความใหม่ ทำให้แชทบอทสามารถตอบสนองต่อคำถาม หรือ
        สนทนาได้อย่างมีธรรมชาติ และ มีความแม่นยำมากยิ่งขึ้น
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        วิธีการทำงานของน้องน้ำหวาน
      </h2>
      <p className="mb-4">
        น้องน้ำหวานทำงานโดยการรับคำถามจากผู้ใช้และใช้เทคนิค RAG
        ในการค้นหาข้อมูลที่เกี่ยวข้องจากฐานข้อมูลของระบบ
        จากนั้นจึงสร้างคำตอบที่เหมาะสมเพื่อตอบกลับผู้ใช้ ในกระบวนการนี้
        น้องน้ำหวานจะพยายามเข้าใจบริบทของคำถามและสร้างคำตอบที่สามารถตอบสนองได้โดยรวดเร็วและถูกต้อง
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        ฟีเจอร์เด่นของน้องน้ำหวาน
      </h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          <strong>การตอบคำถามที่หลากหลาย:</strong>{' '}
          น้องน้ำหวานสามารถตอบคำถามในหลากหลายหัวข้อ ในเอกสารที่มีอยู่
        </li>
        <li>
          <strong>เข้าใจบริบท:</strong>{' '}
          ฟีเจอร์นี้ช่วยให้น้องน้ำหวานสามารถเข้าใจและตีความคำถามได้ดีขึ้น
          ทำให้สามารถตอบที่ตรงตามความต้องการของผู้ใช้งาน{' '}
        </li>
        <li>
          <strong>เรียนรู้จากข้อมูลใหม่:</strong>{' '}
          น้องน้ำหวานสามารถอัปเดตข้อมูลได้เองจากข้อมูลใหม่ ๆ
          ที่มีการจัดเก็บในระบบ
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        ข้อดีและข้อจำกัด
      </h2>
      <p className="font-bold">ข้อดี:</p>
      <ul className="list-disc list-inside mb-4">
        <li>มีความสามารถในการถาม-ตอบอย่างมีประสิทธิภาพ</li>
        <li>สามารถทำงานได้ตลอด 24 ชั่วโมง</li>
        <li>ไม่ต้องใช้พนักงานเพิ่มในการตอบคำถาม</li>
      </ul>
      <p className="font-bold">ข้อจำกัด:</p>
      <ul className="list-disc list-inside mb-4">
        <li>อาจจะมีข้อผิดพลาดในการตีความคำถามบางประการ</li>
        <li>ไม่สามารถตอบคำถามที่ต้องการความเห็น หรือ ความรู้สึกส่วนบุคคลได้</li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">บทสรุป</h2>
      <p>
        น้องน้ำหวานเป็นแชทบอทที่พัฒนาขึ้นโดยเทคโนโลยี RAG
        มีความสามารถในการตอบคำถามและสนทนาได้ ด้วยฟีเจอร์ที่โดดเด่น และ
        วิธีการทำงานที่มีประสิทธิภาพ
        น้องน้ำหวานจึงเป็นเครื่องมือที่เหมาะสมในการตอบรับและบริการผู้ใช้งานอย่างมีคุณภาพ
      </p>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">ผู้พัฒนา</h2>
      <p> 👷‍♀️by: Jeerasak Ananta SS4 :</p>
    </div>
  );
};

export default About;
