# Guest Mode Implementation Summary

## ภาพรวมการเปลี่ยนแปลง (Overview of Changes)

ระบบได้เพิ่ม feature "Guest Mode" ที่อนุญาตให้ผู้ใช้สามารถใช้งานแอปพลิเคชันได้โดยไม่ต้องเข้าสู่ระบบ โดยประวัติการสนทนาจะถูกเก็บในเครื่องของผู้ใช้ (localStorage) แทนที่จะเก็บในฐานข้อมูล

## ไฟล์ที่เปลี่ยนแปลง (Files Modified)

### Frontend Changes

#### 1. `frontend/src/contexts/AuthContext.tsx`
- เพิ่ม `isGuestMode()`, `enableGuestMode()`, `disableGuestMode()`
- จัดการสถานะ guest mode ใน localStorage
- ปิด guest mode อัตโนมัติเมื่อ login

#### 2. `frontend/src/components/GuestRoute.tsx` (ใหม่)
- Component ใหม่ที่อนุญาตให้เข้าถึงได้ทั้ง guest mode และ authenticated mode
- แทนที่ PrivateRoute สำหรับหน้า chat

#### 3. `frontend/src/components/GuestMode.tsx` (ใหม่)
- Component แสดงสถานะ guest mode และปุ่ม login
- แสดงแถบแจ้งเตือนเมื่ออยู่ใน guest mode

#### 4. `frontend/src/services/GuestChatService.ts` (ใหม่)
- Service สำหรับจัดการประวัติการสนทนาใน localStorage
- ฟังก์ชัน: createConversation, getConversation, addMessage, deleteConversation
- รองรับ export/import ข้อมูล

#### 5. `frontend/src/services/AnonymousChatService.ts` (ใหม่)
- Service สำหรับเรียก API สำหรับ anonymous users
- ส่งข้อความและรับคำตอบจาก bot โดยไม่ต้อง authentication

#### 6. `frontend/src/App.tsx`
- เพิ่มการรองรับ guest mode ใน AppContent
- แยก logic สำหรับ guest mode และ authenticated mode
- ใช้ useCallback เพื่อป้องกัน infinite loop
- แสดง GuestMode component เมื่ออยู่ใน guest mode

#### 7. `frontend/src/components/Login.tsx`
- เพิ่มปุ่ม "ใช้งานแบบผู้เยี่ยมชม"
- เพิ่มฟังก์ชัน `handleGuestMode()`
- ปรับปรุง UI ให้มี separator และปุ่ม guest mode

#### 8. `frontend/src/components/Navbar.tsx`
- รองรับ conversation ID แบบ string (สำหรับ guest mode)
- แยก logic การลบ conversation สำหรับ guest mode และ authenticated mode
- เพิ่มการตรวจสอบ `isGuestMode()`

### Backend Changes

#### 1. `chat_api/app/chat/anonymous_router.py` (ใหม่)
- Router ใหม่สำหรับ anonymous users
- Endpoints:
  - `POST /chat/anonymous/message` - ส่งข้อความและรับคำตอบ
  - `POST /chat/anonymous/conversations` - สร้างการสนทนาใหม่
  - `GET /chat/anonymous/conversations/{id}` - ดึงการสนทนา
  - `POST /chat/anonymous/conversations/{id}/messages` - เพิ่มข้อความ
  - `DELETE /chat/anonymous/conversations/{id}` - ลบการสนทนา

#### 2. `chat_api/app/chat/schemas.py`
- เพิ่ม schemas สำหรับ anonymous users:
  - `AnonymousMessageCreate`
  - `AnonymousConversationCreate`
  - `AnonymousConversation`

#### 3. `chat_api/app/main.py`
- เพิ่ม anonymous router เข้าไปใน application
- import `router_anonymous` และ include ใน app

## การแก้ไขปัญหา (Bug Fixes)

### 1. Infinite Recursion ใน GuestChatService
**ปัญหา:** Method `getConversations()` เรียกตัวเองซ้ำๆ ไปเรื่อยๆ
**การแก้ไข:**
- เปลี่ยนชื่อ private method เป็น `getConversationsFromStorage()`
- แก้ไข public method `getConversations()` ให้เรียก private method
- อัปเดตการเรียกใช้ในทุก method ของ class

### 2. Infinite Loop ใน useEffect
**ปัญหา:** useEffect เรียก `guestChatService.getConversations()` ซ้ำๆ
**การแก้ไข:**
- ใช้ `useCallback` สำหรับ `fetchGuestConversations` และ `fetchAuthenticatedConversations`
- แยก logic การ fetch conversations ออกจาก useEffect

## การทำงานของระบบ (System Flow)

### Guest Mode Flow
1. ผู้ใช้คลิก "ใช้งานแบบผู้เยี่ยมชม" ในหน้า login
2. ระบบเรียก `enableGuestMode()` และ redirect ไปหน้า chat
3. แสดง GuestMode component แจ้งเตือนสถานะ
4. ผู้ใช้สามารถส่งข้อความได้โดยไม่ต้อง login
5. ข้อความจะถูกเก็บใน localStorage
6. Bot response จะถูกเก็บใน localStorage เช่นกัน

### Authenticated Mode Flow
1. ผู้ใช้ login ปกติ
2. ระบบปิด guest mode อัตโนมัติ
3. ข้อมูลจะถูกเก็บในฐานข้อมูล PostgreSQL
4. ใช้ API endpoints ปกติที่ต้องการ authentication

## การทดสอบ (Testing)

### ทดสอบ Guest Mode
1. เปิดแอปและคลิก "ใช้งานแบบผู้เยี่ยมชม"
2. ส่งข้อความและตรวจสอบว่าตอบกลับมา
3. สร้างการสนทนาใหม่
4. รีเฟรชหน้าและตรวจสอบว่าข้อมูลยังคงอยู่
5. ลบการสนทนาและตรวจสอบว่าหายไป

### ทดสอบ Login จาก Guest Mode
1. อยู่ใน guest mode
2. คลิกปุ่ม "เข้าสู่ระบบ"
3. login ปกติ
4. ตรวจสอบว่า guest mode ถูกปิด
5. ตรวจสอบว่าการทำงานปกติ

## ความปลอดภัย (Security)

1. **Anonymous API**
   - ไม่ต้องการ authentication
   - ใช้ in-memory storage (ใน production ควรใช้ Redis)
   - ข้อมูลไม่ถูกเก็บในฐานข้อมูล

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

4. **Rate Limiting**
   - เพิ่ม rate limiting สำหรับ anonymous API

5. **Analytics**
   - เพิ่ม analytics เพื่อติดตามการใช้งาน guest mode

## หมายเหตุ (Notes)

- Guest mode เหมาะสำหรับผู้ใช้ที่ต้องการทดลองใช้งานก่อนสมัครสมาชิก
- ข้อมูลใน localStorage มีข้อจำกัดด้านขนาด (ประมาณ 5-10MB)
- ใน production ควรพิจารณาใช้ Redis สำหรับ anonymous conversations
- ระบบรองรับการใช้งานทั้ง guest mode และ authenticated mode ในเวลาเดียวกัน 