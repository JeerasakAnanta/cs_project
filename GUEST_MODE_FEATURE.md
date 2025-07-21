# Guest Mode Feature

## ภาพรวม (Overview)

ระบบได้เพิ่ม feature "Guest Mode" ที่อนุญาตให้ผู้ใช้สามารถใช้งานแอปพลิเคชันได้โดยไม่ต้องเข้าสู่ระบบ โดยประวัติการสนทนาจะถูกเก็บในเครื่องของผู้ใช้ (localStorage) แทนที่จะเก็บในฐานข้อมูล

## คุณสมบัติ (Features)

### 1. การใช้งานแบบผู้เยี่ยมชม (Guest Mode)
- ผู้ใช้สามารถใช้งานแอปได้โดยไม่ต้อง login
- ประวัติการสนทนาจะถูกเก็บใน localStorage ของเบราว์เซอร์
- สามารถสร้างการสนทนาใหม่และส่งข้อความได้เหมือนผู้ใช้ที่ login แล้ว

### 2. การเก็บประวัติในเครื่อง (Local Storage)
- ประวัติการสนทนาทั้งหมดจะถูกเก็บใน localStorage
- ข้อมูลจะไม่หายเมื่อรีเฟรชหน้าเว็บ
- ข้อมูลจะหายเมื่อล้าง cache หรือเปลี่ยนเบราว์เซอร์

### 3. การเข้าสู่ระบบเพื่อเก็บประวัติ (Login to Save History)
- ผู้ใช้สามารถ login ได้ตลอดเวลาเพื่อเก็บประวัติในฐานข้อมูล
- เมื่อ login แล้ว guest mode จะถูกปิดอัตโนมัติ
- ประวัติใน localStorage จะยังคงอยู่ (สามารถเพิ่ม feature ย้ายข้อมูลได้ในอนาคต)

## การใช้งาน (Usage)

### สำหรับผู้ใช้ (For Users)

1. **เริ่มใช้งานแบบผู้เยี่ยมชม**
   - ไปที่หน้า login
   - คลิกปุ่ม "ใช้งานแบบผู้เยี่ยมชม"
   - เริ่มใช้งานได้ทันที

2. **การใช้งานปกติ**
   - ส่งข้อความและรับคำตอบจาก AI
   - สร้างการสนทนาใหม่
   - ดูประวัติการสนทนา

3. **การเข้าสู่ระบบ**
   - คลิกปุ่ม "เข้าสู่ระบบ" ในแถบแจ้งเตือน guest mode
   - หรือไปที่หน้า login และ login ปกติ

### สำหรับนักพัฒนา (For Developers)

#### Frontend Changes

1. **AuthContext.tsx**
   - เพิ่ม `isGuestMode()`, `enableGuestMode()`, `disableGuestMode()`
   - จัดการสถานะ guest mode ใน localStorage

2. **GuestRoute.tsx**
   - Component ใหม่ที่อนุญาตให้เข้าถึงได้ทั้ง guest mode และ authenticated mode

3. **GuestMode.tsx**
   - Component แสดงสถานะ guest mode และปุ่ม login

4. **GuestChatService.ts**
   - Service สำหรับจัดการประวัติการสนทนาใน localStorage

5. **AnonymousChatService.ts**
   - Service สำหรับเรียก API สำหรับ anonymous users

#### Backend Changes

1. **anonymous_router.py**
   - Router ใหม่สำหรับ anonymous users
   - Endpoints: `/chat/anonymous/message`, `/chat/anonymous/conversations`

2. **schemas.py**
   - เพิ่ม schemas สำหรับ anonymous users

3. **main.py**
   - เพิ่ม anonymous router เข้าไปใน application

## API Endpoints

### Anonymous Endpoints

```
POST /chat/anonymous/message
- Send a message and get bot response without authentication
- Body: { "content": "message" }
- Response: { "message": "bot_response" }

POST /chat/anonymous/conversations
- Create a new anonymous conversation
- Body: { "title": "conversation_title" }
- Response: AnonymousConversation object

GET /chat/anonymous/conversations/{conversation_id}
- Get an anonymous conversation by ID
- Response: AnonymousConversation object

POST /chat/anonymous/conversations/{conversation_id}/messages
- Add a message to an anonymous conversation
- Body: { "content": "message" }
- Response: { "message": "bot_response" }

DELETE /chat/anonymous/conversations/{conversation_id}
- Delete an anonymous conversation
- Response: { "message": "Conversation deleted successfully" }
```

## การจัดเก็บข้อมูล (Data Storage)

### Guest Mode (LocalStorage)
```javascript
// Key: 'guest_conversations'
// Value: Array of GuestConversation objects
{
  id: string,
  title: string,
  messages: [
    {
      id: string,
      text: string,
      sender: 'user' | 'bot',
      timestamp: number
    }
  ],
  createdAt: number,
  updatedAt: number
}
```

### Authenticated Mode (Database)
- ใช้ฐานข้อมูล PostgreSQL เหมือนเดิม
- ตาราง `conversations` และ `messages`

## ความปลอดภัย (Security)

1. **Anonymous API**
   - ไม่ต้องการ authentication
   - ใช้ in-memory storage (ใน production ควรใช้ Redis)
   - มี rate limiting (สามารถเพิ่มได้)

2. **Data Privacy**
   - ข้อมูล guest mode เก็บในเครื่องผู้ใช้เท่านั้น
   - ไม่ส่งข้อมูลไปยังเซิร์ฟเวอร์
   - ผู้ใช้ควบคุมข้อมูลเอง

## การพัฒนาต่อ (Future Enhancements)

1. **Data Migration**
   - เพิ่ม feature ย้ายข้อมูลจาก localStorage ไปยังฐานข้อมูลเมื่อ login

2. **Export/Import**
   - เพิ่ม feature export/import ประวัติการสนทนา

3. **Persistent Storage**
   - ใช้ IndexedDB แทน localStorage สำหรับข้อมูลขนาดใหญ่

4. **Sync Across Devices**
   - เพิ่ม feature sync ข้อมูลระหว่างอุปกรณ์ (ต้อง login)

## การทดสอบ (Testing)

1. **Guest Mode Flow**
   - ทดสอบการใช้งานโดยไม่ login
   - ทดสอบการสร้างการสนทนาใหม่
   - ทดสอบการส่งข้อความและรับคำตอบ

2. **Data Persistence**
   - ทดสอบว่าข้อมูลยังคงอยู่หลังรีเฟรชหน้า
   - ทดสอบว่าข้อมูลหายเมื่อล้าง cache

3. **Login Integration**
   - ทดสอบการ login จาก guest mode
   - ทดสอบว่าการทำงานปกติหลัง login

## การ Deploy

1. **Frontend**
   - Build และ deploy ตามปกติ
   - ไม่มีการเปลี่ยนแปลงใน build process

2. **Backend**
   - Deploy ไฟล์ใหม่: `anonymous_router.py`
   - อัปเดต `main.py` และ `schemas.py`
   - Restart application

## หมายเหตุ (Notes)

- Guest mode เหมาะสำหรับผู้ใช้ที่ต้องการทดลองใช้งานก่อนสมัครสมาชิก
- ข้อมูลใน localStorage มีข้อจำกัดด้านขนาด (ประมาณ 5-10MB)
- ใน production ควรพิจารณาใช้ Redis สำหรับ anonymous conversations
- สามารถเพิ่ม analytics เพื่อติดตามการใช้งาน guest mode 