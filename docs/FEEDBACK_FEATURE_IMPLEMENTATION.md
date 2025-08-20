# Feedback Feature Implementation

## ภาพรวม (Overview)

ได้เพิ่มปุ่ม feedback (ชอบ/ไม่ชอบ) สำหรับคำตอบของ bot ในหน้า Chatbot เพื่อให้ผู้ใช้สามารถให้ feedback กับคำตอบที่ได้รับ

## คุณสมบัติ (Features)

### 1. ปุ่ม Feedback
- **ปุ่ม "ชอบ"** (ThumbsUp icon) - สีเขียว
- **ปุ่ม "ไม่ชอบ"** (ThumbsDown icon) - สีแดง
- แสดงเฉพาะในข้อความของ bot ที่มี message ID

### 2. Modal สำหรับ Feedback
- เปิดเมื่อคลิกปุ่ม feedback
- มีช่องให้แสดงความคิดเห็นเพิ่มเติม (ไม่บังคับ)
- ปุ่ม "ยกเลิก" และ "ส่ง Feedback"

### 3. การจัดการ Authentication
- เฉพาะผู้ใช้ที่เข้าสู่ระบบเท่านั้นที่สามารถให้ feedback ได้
- ผู้ใช้ในโหมด Guest จะได้รับข้อความแจ้งเตือนให้เข้าสู่ระบบ

## การทำงาน (How it works)

### 1. Frontend (Chatbot.tsx)
```typescript
// State management
const [feedbackModal, setFeedbackModal] = useState<{
  isOpen: boolean;
  messageId: number | null;
  feedbackType: 'like' | 'dislike' | null;
}>({
  isOpen: false,
  messageId: null,
  feedbackType: null,
});
const [feedbackComment, setFeedbackComment] = useState('');

// Feedback handling
const handleFeedback = (messageId: number, feedbackType: 'like' | 'dislike') => {
  if (isGuestMode()) {
    // Show alert for guest users
    return;
  }
  setFeedbackModal({ isOpen: true, messageId, feedbackType });
};

// Submit feedback to backend
const submitFeedback = async () => {
  const response = await fetch(`${BACKEND_API}/chat/feedback/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      message_id: feedbackModal.messageId,
      feedback_type: feedbackModal.feedbackType,
      comment: feedbackComment.trim() || null,
    }),
  });
};
```

### 2. Backend API
- **Endpoint**: `POST /chat/feedback/`
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "message_id": 123,
    "feedback_type": "like" | "dislike",
    "comment": "ความคิดเห็นเพิ่มเติม (optional)"
  }
  ```

### 3. Database Schema
```sql
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    feedback_type VARCHAR(10), -- 'like' or 'dislike'
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## UI/UX Design

### 1. ปุ่ม Feedback
- ใช้สีเขียวสำหรับ "ชอบ" และสีแดงสำหรับ "ไม่ชอบ"
- มี hover effects และ transitions
- แสดงใต้ข้อความของ bot พร้อม border separator

### 2. Modal Design
- ใช้ backdrop blur effect
- มีปุ่มปิด (X) ที่มุมขวาบน
- ช่อง textarea สำหรับความคิดเห็น
- ปุ่ม "ยกเลิก" และ "ส่ง Feedback"

### 3. Alert Messages
- ใช้ CustomAlert component
- แสดงข้อความสำเร็จ/ผิดพลาด
- Auto-dismiss หลังจาก 4 วินาที

## การใช้งาน (Usage)

### สำหรับผู้ใช้ทั่วไป
1. ส่งข้อความและรอคำตอบจาก bot
2. คลิกปุ่ม "ชอบ" หรือ "ไม่ชอบ" ใต้คำตอบ
3. กรอกความคิดเห็นเพิ่มเติม (ถ้าต้องการ)
4. คลิก "ส่ง Feedback"

### สำหรับผู้ใช้ในโหมด Guest
1. จะเห็นปุ่ม feedback แต่ไม่สามารถใช้งานได้
2. จะได้รับข้อความแจ้งเตือนให้เข้าสู่ระบบ

## การทดสอบ (Testing)

### 1. Test Cases
- [ ] ผู้ใช้ที่เข้าสู่ระบบสามารถให้ feedback ได้
- [ ] ผู้ใช้ในโหมด Guest ไม่สามารถให้ feedback ได้
- [ ] Modal เปิดและปิดได้ตามปกติ
- [ ] การส่ง feedback สำเร็จ
- [ ] การจัดการ error cases

### 2. API Testing
```bash
# Test feedback endpoint
curl -X POST "http://localhost:8000/chat/feedback/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": 1,
    "feedback_type": "like",
    "comment": "คำตอบดีมาก"
  }'
```

## การปรับปรุงในอนาคต (Future Improvements)

1. **Feedback Analytics**: แสดงสถิติ feedback ในหน้า Admin
2. **Feedback History**: ให้ผู้ใช้ดูประวัติ feedback ของตัวเอง
3. **Auto-feedback**: ระบบให้ feedback อัตโนมัติตามพฤติกรรมผู้ใช้
4. **Feedback Categories**: เพิ่มหมวดหมู่ feedback (เช่น ความถูกต้อง, ความชัดเจน, ความเร็ว)

## ไฟล์ที่แก้ไข (Modified Files)

1. `frontend/src/components/Chatbot.tsx` - เพิ่ม feedback functionality
2. `FEEDBACK_FEATURE_IMPLEMENTATION.md` - เอกสารนี้

## ไฟล์ Backend ที่เกี่ยวข้อง (Related Backend Files)

1. `chat_api/app/chat/feedback_router.py` - API endpoints
2. `chat_api/app/chat/feedback_crud.py` - Database operations
3. `chat_api/app/chat/feedback_schemas.py` - Pydantic models
4. `chat_api/app/database/models.py` - Database models 