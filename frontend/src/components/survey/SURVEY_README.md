# แบบประเมินความพึงพอใจ LannaFinChat

## ภาพรวม

แบบประเมินความพึงพอใจสำหรับระบบ LannaFinChat ที่ออกแบบมาเพื่อรวบรวมความคิดเห็นและข้อเสนอแนะจากผู้ใช้ เพื่อนำไปปรับปรุงบริการให้ดียิ่งขึ้น

## คุณสมบัติ

### 1. การประเมินแบบดาว (Star Rating)

- ให้คะแนนความพึงพอใจโดยรวม 1-5 ดาว
- แสดงคำอธิบายระดับความพึงพอใจ
- จำเป็นต้องให้คะแนนก่อนส่งแบบประเมิน

### 2. การประเมินรายละเอียด

- ความง่ายในการใช้งาน
- ความเร็วในการตอบสนอง
- ความแม่นยำของข้อมูล
- ประโยชน์ที่ได้รับ
- การออกแบบส่วนติดต่อผู้ใช้

### 3. การเลือกคุณสมบัติ

- เลือกคุณสมบัติที่ประทับใจได้หลายข้อ
- แสดงผลการเลือกด้วย Chip
- มีไอคอนประกอบแต่ละคุณสมบัติ

### 4. คำถามแนะนำ

- จะแนะนำให้ผู้อื่นหรือไม่
- มีตัวเลือก: จะแนะนำ / อาจจะแนะนำ / ไม่แนะนำ
- แสดงไอคอนประกอบ

### 5. ข้อเสนอแนะและความคิดเห็น

- ช่องข้อเสนอแนะเพื่อการปรับปรุง
- ช่องความคิดเห็นเพิ่มเติม
- รองรับการพิมพ์หลายบรรทัด

## การติดตั้งและใช้งาน

### 1. นำเข้า Component

```typescript
import SatisfactionSurvey from './components/SatisfactionSurvey';
import SurveyButton from './components/SurveyButton';
```

### 2. การใช้งานแบบพื้นฐาน

```typescript
import React, { useState } from 'react';
import SurveyButton from './components/SurveyButton';

const App = () => {
  return (
    <div>
      <h1>LannaFinChat</h1>
      {/* ปุ่มแบบประเมิน */}
      <SurveyButton variant="button" />

      {/* ปุ่มลอย */}
      <SurveyButton variant="fab" position="fixed" />
    </div>
  );
};
```

### 3. การใช้งานแบบกำหนดเอง

```typescript
import React, { useState } from 'react';
import SatisfactionSurvey from './components/SatisfactionSurvey';

const CustomSurvey = () => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: any) => {
    // ส่งข้อมูลไปยัง API
    fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
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

## โครงสร้างข้อมูล

### SurveyData Interface

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

## การปรับแต่ง

### 1. เปลี่ยนธีมสี

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
  // เพิ่มคุณสมบัติใหม่ที่นี่
  { value: 'new_feature', label: 'คุณสมบัติใหม่', icon: <NewIcon /> }
];
```

### 3. เปลี่ยนข้อความ

```typescript
const getRatingLabel = (value: number) => {
  const labels = {
    1: 'ข้อความใหม่สำหรับ 1 ดาว',
    2: 'ข้อความใหม่สำหรับ 2 ดาว',
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

## การทดสอบ

### 1. ทดสอบการเปิด/ปิด Modal

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SatisfactionSurvey from './SatisfactionSurvey';

test('opens and closes survey modal', () => {
  const onClose = jest.fn();
  render(<SatisfactionSurvey open={true} onClose={onClose} />);

  fireEvent.click(screen.getByText('ยกเลิก'));
  expect(onClose).toHaveBeenCalled();
});
```

### 2. ทดสอบการส่งข้อมูล

```typescript
test('submits survey data', () => {
  const onSubmit = jest.fn();
  render(<SatisfactionSurvey open={true} onClose={() => {}} onSubmit={onSubmit} />);

  // ให้คะแนน
  fireEvent.click(screen.getByLabelText('5 stars'));

  // ส่งแบบประเมิน
  fireEvent.click(screen.getByText('ส่งแบบประเมิน'));

  expect(onSubmit).toHaveBeenCalled();
});
```

## การปรับปรุงในอนาคต

1. **การวิเคราะห์ข้อมูล**: เพิ่มการแสดงผลสถิติและกราฟ
2. **การแจ้งเตือน**: ส่งการแจ้งเตือนเมื่อได้รับแบบประเมินใหม่
3. **การแปลภาษา**: รองรับหลายภาษา
4. **การปรับแต่งธีม**: ให้ผู้ใช้เลือกธีมสีได้
5. **การส่งออกข้อมูล**: ส่งออกข้อมูลเป็น Excel หรือ PDF

## การสนับสนุน

หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมพัฒนา LannaFinChat
