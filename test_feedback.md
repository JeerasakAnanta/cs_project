# Test Guide: Feedback Functionality

## การทดสอบปุ่ม Feedback

### 1. ทดสอบในโหมด Guest
1. เปิดแอปพลิเคชัน
2. ส่งข้อความและรอคำตอบจาก bot
3. **ตรวจสอบ**: ไม่ควรเห็นปุ่ม feedback ใต้คำตอบของ bot
4. **ผลลัพธ์ที่คาดหวัง**: ไม่มีปุ่ม feedback แสดง

### 2. ทดสอบในโหมด Authenticated User
1. เข้าสู่ระบบด้วยบัญชีผู้ใช้
2. ส่งข้อความและรอคำตอบจาก bot
3. **ตรวจสอบ**: ควรเห็นปุ่ม "ชอบ" และ "ไม่ชอบ" ใต้คำตอบของ bot
4. **ผลลัพธ์ที่คาดหวัง**: มีปุ่ม feedback แสดง (สีเขียวสำหรับชอบ, สีแดงสำหรับไม่ชอบ)

### 3. ทดสอบการคลิกปุ่ม Feedback
1. คลิกปุ่ม "ชอบ" หรือ "ไม่ชอบ"
2. **ตรวจสอบ**: Modal ควรเปิดขึ้นมา
3. **ผลลัพธ์ที่คาดหวัง**: 
   - Modal แสดงข้อความ "คุณชอบ/ไม่ชอบคำตอบนี้หรือไม่?"
   - มีช่อง textarea สำหรับความคิดเห็น
   - มีปุ่ม "ยกเลิก" และ "ส่ง Feedback"

### 4. ทดสอบการส่ง Feedback
1. กรอกความคิดเห็นในช่อง textarea (ไม่บังคับ)
2. คลิกปุ่ม "ส่ง Feedback"
3. **ตรวจสอบ**: ควรได้รับข้อความแจ้งเตือน "ส่ง Feedback สำเร็จ"
4. **ผลลัพธ์ที่คาดหวัง**: 
   - Modal ปิด
   - แสดง alert สีเขียว "ส่ง Feedback สำเร็จ"
   - ข้อความหายไปหลังจาก 4 วินาที

### 5. ทดสอบการยกเลิก Feedback
1. คลิกปุ่ม feedback อีกครั้ง
2. คลิกปุ่ม "ยกเลิก"
3. **ตรวจสอบ**: Modal ควรปิดโดยไม่ส่ง feedback
4. **ผลลัพธ์ที่คาดหวัง**: Modal ปิด, ไม่มีการส่งข้อมูล

### 6. ทดสอบ Error Cases
1. ลบ token จาก localStorage
2. ลองส่ง feedback
3. **ตรวจสอบ**: ควรได้รับข้อความแจ้งเตือน error
4. **ผลลัพธ์ที่คาดหวัง**: แสดง alert สีแดง "เกิดข้อผิดพลาด"

## การตรวจสอบใน Database

### 1. ตรวจสอบตาราง feedbacks
```sql
SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 10;
```

### 2. ตรวจสอบ feedback ที่เกี่ยวข้องกับ message
```sql
SELECT f.*, m.content as message_content 
FROM feedbacks f 
JOIN messages m ON f.message_id = m.id 
ORDER BY f.created_at DESC;
```

## การตรวจสอบ API

### 1. ทดสอบ Feedback Endpoint
```bash
# ส่ง feedback
curl -X POST "http://localhost:8000/chat/feedback/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": 1,
    "feedback_type": "like",
    "comment": "คำตอบดีมาก"
  }'
```

### 2. ตรวจสอบ Response
```json
{
  "id": 1,
  "message_id": 1,
  "feedback_type": "like",
  "comment": "คำตอบดีมาก",
  "created_at": "2025-01-XX..."
}
```

## ปัญหาที่อาจเกิดขึ้น

### 1. ปุ่ม Feedback ไม่แสดง
- **สาเหตุ**: ผู้ใช้อยู่ในโหมด guest หรือ message ไม่มี ID
- **วิธีแก้**: เข้าสู่ระบบและตรวจสอบว่า message มี ID เป็นตัวเลข

### 2. ไม่สามารถส่ง Feedback ได้
- **สาเหตุ**: Token หมดอายุหรือไม่มี token
- **วิธีแก้**: ออกจากระบบและเข้าสู่ระบบใหม่

### 3. Modal ไม่เปิด
- **สาเหตุ**: JavaScript error หรือ CSS issue
- **วิธีแก้**: ตรวจสอบ console ใน browser developer tools

### 4. API Error
- **สาเหตุ**: Backend ไม่ทำงานหรือ database error
- **วิธีแก้**: ตรวจสอบ backend logs และ database connection

## การตรวจสอบ Logs

### 1. Frontend Logs
- เปิด browser developer tools
- ดูที่ Console tab
- ตรวจสอบ network requests

### 2. Backend Logs
```bash
# ดู logs ของ backend
tail -f chat_api/log/app.log
```

## สรุป

ปุ่ม feedback ควรทำงานได้ตามที่คาดหวัง:
- ✅ แสดงเฉพาะสำหรับผู้ใช้ที่เข้าสู่ระบบ
- ✅ เปิด modal เมื่อคลิก
- ✅ ส่งข้อมูลไปยัง backend สำเร็จ
- ✅ แสดงข้อความแจ้งเตือนที่เหมาะสม
- ✅ ไม่แสดงในโหมด guest 