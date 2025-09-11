# ตัวอย่างการใช้งานแบบประเมินความพึงพอใจ LannaFinChat

## ไฟล์ที่สร้างขึ้น

### 1. SatisfactionSurvey.tsx

คอมโพเนนต์หลักของแบบประเมินความพึงพอใจ

**คุณสมบัติ:**

- การประเมินแบบดาว (1-5 ดาว)
- การประเมินรายละเอียดแต่ละด้าน
- การเลือกคุณสมบัติที่ประทับใจ
- คำถามแนะนำให้ผู้อื่น
- ช่องข้อเสนอแนะและความคิดเห็น
- การตรวจสอบความถูกต้องของข้อมูล
- การแสดงข้อความสำเร็จ/ข้อผิดพลาด

### 2. SurveyButton.tsx

คอมโพเนนต์ปุ่มสำหรับเปิดแบบประเมิน

**คุณสมบัติ:**

- รองรับ 2 รูปแบบ: ปุ่มธรรมดา และปุ่มลอย (FAB)
- สามารถกำหนดตำแหน่งได้
- มี tooltip แสดงคำอธิบาย
- การจัดการการเปิด/ปิด modal

### 3. SurveyDemo.tsx

หน้าแสดงตัวอย่างการใช้งานแบบประเมิน

**คุณสมบัติ:**

- แสดงคุณสมบัติของแบบประเมิน
- ตัวอย่างการใช้งานทั้งสองรูปแบบ
- คำแนะนำการใช้งาน
- ประโยชน์ของการประเมิน

## วิธีการใช้งาน

### 1. การใช้งานพื้นฐาน

```typescript
import SurveyButton from './components/SurveyButton';

// ปุ่มธรรมดา
<SurveyButton variant="button" />

// ปุ่มลอย
<SurveyButton variant="fab" position="fixed" />
```

### 2. การใช้งานแบบกำหนดเอง

```typescript
import React, { useState } from 'react';
import SatisfactionSurvey from './components/SatisfactionSurvey';

const MyComponent = () => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: any) => {
    // ส่งข้อมูลไปยัง API
    console.log('Survey data:', data);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        เปิดแบบประเมิน
      </button>

      <SatisfactionSurvey
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};
```

### 3. การเพิ่มในหน้า Chatbot

ปุ่มแบบประเมินได้ถูกเพิ่มในหน้า Chatbot แล้ว โดยจะแสดงเป็นปุ่มลอยที่มุมขวาล่างของหน้าจอ

## โครงสร้างข้อมูล

```typescript
interface SurveyData {
  overallSatisfaction: number; // ความพึงพอใจโดยรวม (1-5)
  easeOfUse: number; // ความง่ายในการใช้งาน (1-5)
  responseSpeed: number; // ความเร็วในการตอบสนอง (1-5)
  accuracy: number; // ความแม่นยำของข้อมูล (1-5)
  helpfulness: number; // ประโยชน์ที่ได้รับ (1-5)
  userInterface: number; // การออกแบบส่วนติดต่อผู้ใช้ (1-5)
  features: string[]; // คุณสมบัติที่ประทับใจ
  improvements: string; // ข้อเสนอแนะเพื่อการปรับปรุง
  recommendToOthers: string; // จะแนะนำให้ผู้อื่นหรือไม่
  additionalComments: string; // ความคิดเห็นเพิ่มเติม
  timestamp: Date; // เวลาที่ส่งแบบประเมิน
}
```

## การทดสอบ

### 1. ทดสอบการเปิดแบบประเมิน

- ไปที่หน้า Chatbot
- คลิกปุ่มลอยที่มุมขวาล่าง
- ตรวจสอบว่า modal เปิดขึ้นมา

### 2. ทดสอบการกรอกแบบประเมิน

- ให้คะแนนความพึงพอใจโดยรวม
- กรอกข้อมูลในส่วนต่างๆ
- คลิก "ส่งแบบประเมิน"
- ตรวจสอบข้อความสำเร็จ

### 3. ทดสอบหน้า Demo

- ไปที่ `/survey-demo`
- ดูตัวอย่างการใช้งาน
- ทดสอบปุ่มต่างๆ

## การปรับแต่ง

### 1. เปลี่ยนสีธีม

```typescript
// ใน SatisfactionSurvey.tsx
<Dialog
  PaperProps={{
    style: {
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)'
    }
  }}
>
```

### 2. เพิ่มคุณสมบัติใหม่

```typescript
const featureOptions = [
  // เพิ่มคุณสมบัติใหม่
  { value: 'new_feature', label: 'คุณสมบัติใหม่', icon: <NewIcon /> }
];
```

### 3. เปลี่ยนข้อความ

```typescript
const getRatingLabel = (value: number) => {
  const labels = {
    1: 'ข้อความใหม่สำหรับ 1 ดาว',
    // ...
  };
  return labels[value] || '';
};
```

## การเชื่อมต่อกับ Backend

### 1. สร้าง API Endpoint

```python
# ใน FastAPI backend
@app.post("/api/survey")
async def submit_survey(survey_data: SurveyData):
    # บันทึกข้อมูลลงฐานข้อมูล
    return {"message": "Survey submitted successfully"}
```

### 2. ส่งข้อมูลจาก Frontend

```typescript
const handleSubmit = async (data: SurveyData) => {
  try {
    const response = await fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // แสดงข้อความสำเร็จ
    }
  } catch (error) {
    // จัดการข้อผิดพลาด
  }
};
```

## หมายเหตุ

- แบบประเมินนี้ใช้ภาษาไทยทั้งหมด
- รองรับการใช้งานทั้งในโหมด Guest และ Authenticated
- มีการตรวจสอบความถูกต้องของข้อมูลก่อนส่ง
- ใช้ Material-UI และ Tailwind CSS สำหรับการออกแบบ
- รองรับการใช้งานบนอุปกรณ์มือถือ
