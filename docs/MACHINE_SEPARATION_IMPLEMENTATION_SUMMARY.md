# Machine Separation Implementation Summary

## ภาพรวมการเปลี่ยนแปลง (Overview of Changes)

ระบบได้เพิ่มฟีเจอร์การแยกประวัติการสนทนาของ Guest Mode ตามเครื่องแต่ละเครื่อง โดยใช้ Machine Identifier เพื่อให้แต่ละเครื่องเก็บประวัติของตัวเอง ไม่แชร์กัน

## ไฟล์ที่เปลี่ยนแปลง (Files Modified)

### Backend Changes

#### 1. `chat_api/app/database/models.py`
- เพิ่มฟิลด์ `machine_id` ใน `GuestConversation` model
- สร้าง index สำหรับ `machine_id` เพื่อประสิทธิภาพการค้นหา

#### 2. `chat_api/app/chat/guest_crud.py`
- อัปเดต `create_guest_conversation()` ให้รองรับ `machine_id`
- อัปเดต `get_guest_conversations()` ให้กรองตาม `machine_id`
- อัปเดต `get_guest_conversation_stats()` ให้รองรับ `machine_id`
- เพิ่มฟังก์ชัน `delete_guest_conversation()` สำหรับ soft delete

#### 3. `chat_api/app/chat/schemas.py`
- เพิ่ม schemas ใหม่สำหรับ Guest Mode
- รองรับ `machine_id` ในทุก schemas ที่เกี่ยวข้อง
- เพิ่ม `GuestStatsResponse` สำหรับสถิติ

#### 4. `chat_api/app/chat/guest_router.py`
- เพิ่ม endpoint `/machine-id` สำหรับสร้าง Machine ID ใหม่
- อัปเดตทุก endpoints ให้รองรับ `X-Machine-ID` header
- เพิ่มการตรวจสอบ Machine ID เพื่อความปลอดภัย
- เพิ่ม endpoint `/stats` สำหรับดูสถิติ

#### 5. `chat_api/alembic/versions/add_machine_id_to_guest_conversations.py` (ใหม่)
- Migration script สำหรับเพิ่มฟิลด์ `machine_id`
- สร้าง index สำหรับประสิทธิภาพ

### Frontend Changes

#### 1. `frontend/src/config.ts` (ใหม่)
- ไฟล์ config สำหรับการตั้งค่าต่างๆ
- กำหนดค่าสำหรับ Guest Mode
- ตั้งค่าสำหรับ Export/Import

#### 2. `frontend/src/services/GuestPostgreSQLService.ts`
- เพิ่มระบบ Machine ID management
- รองรับ browser fingerprinting เป็น fallback
- เพิ่มฟังก์ชัน Export/Import
- เพิ่มฟังก์ชัน Reset Machine ID

#### 3. `frontend/src/components/GuestMachineInfo.tsx` (ใหม่)
- Component แสดงข้อมูล Machine ID
- แสดงสถิติการใช้งาน
- ปุ่ม Export/Import ข้อมูล
- ปุ่ม Reset Machine ID

#### 4. `frontend/src/App.tsx`
- เพิ่ม import `GuestMachineInfo`
- เพิ่ม state `showMachineInfo`
- แสดง Machine Info panel ใน Guest Mode
- เพิ่มปุ่มแสดง/ซ่อนข้อมูลเครื่อง

### Scripts

#### 1. `run_migration.sh` (ใหม่)
- Script สำหรับรัน database migration
- ตรวจสอบและติดตั้ง dependencies
- แสดงสถานะ migration

#### 2. `GUEST_MODE_MACHINE_SEPARATION.md` (ใหม่)
- เอกสารอธิบายฟีเจอร์
- คู่มือการใช้งาน
- การทดสอบ

## การทำงานของระบบ (System Flow)

### 1. การเริ่มต้นใช้งาน
1. ผู้ใช้เปิดแอปครั้งแรก
2. ระบบตรวจสอบ Machine ID ใน localStorage
3. หากไม่มี จะสร้างใหม่จากเซิร์ฟเวอร์
4. หากไม่สามารถเชื่อมต่อได้ จะสร้างจาก browser fingerprinting

### 2. การเก็บประวัติ
1. ทุกการสนทนาจะถูกเก็บพร้อม Machine ID
2. การดึงข้อมูลจะกรองตาม Machine ID
3. ข้อมูลจะไม่แชร์กันระหว่างเครื่อง

### 3. การจัดการข้อมูล
1. **Export**: ส่งออกข้อมูลพร้อม Machine ID
2. **Import**: นำเข้าข้อมูลไปยัง Machine ID ปัจจุบัน
3. **Reset**: สร้าง Machine ID ใหม่ (ไม่สามารถเข้าถึงข้อมูลเก่าได้)

## API Endpoints ใหม่

### Guest Mode Endpoints
```
POST /chat/guest/machine-id
- สร้าง Machine ID ใหม่

GET /chat/guest/conversations
- ดึงการสนทนาตาม Machine ID

POST /chat/guest/conversations
- สร้างการสนทนาใหม่พร้อม Machine ID

GET /chat/guest/conversations/{id}
- ดึงการสนทนาตาม ID (ตรวจสอบ Machine ID)

POST /chat/guest/conversations/{id}/messages
- เพิ่มข้อความพร้อมตรวจสอบ Machine ID

DELETE /chat/guest/conversations/{id}
- ลบการสนทนา (ตรวจสอบ Machine ID)

GET /chat/guest/stats
- ดึงสถิติตาม Machine ID
```

## การติดตั้ง (Installation)

### 1. รัน Migration
```bash
# รัน migration script
./run_migration.sh
```

### 2. Restart Services
```bash
# Restart backend
docker-compose restart backend

# หรือรัน locally
cd chat_api
uvicorn app.main:app --reload
```

### 3. ตรวจสอบการทำงาน
1. เปิดแอปใน Guest Mode
2. คลิกปุ่ม "แสดง ข้อมูลเครื่อง"
3. ตรวจสอบว่า Machine ID ถูกสร้าง
4. ทดสอบส่งข้อความและดูว่าถูกเก็บในฐานข้อมูล

## การทดสอบ (Testing)

### 1. ทดสอบการแยกข้อมูล
1. เปิดแอปในเครื่อง A
2. สร้างการสนทนาและส่งข้อความ
3. เปิดแอปในเครื่อง B
4. ตรวจสอบว่าไม่เห็นข้อมูลจากเครื่อง A

### 2. ทดสอบ Export/Import
1. ส่งออกข้อมูลจากเครื่อง A
2. นำเข้าข้อมูลในเครื่อง B
3. ตรวจสอบว่าข้อมูลถูกนำเข้าสำเร็จ

### 3. ทดสอบ Reset Machine ID
1. รีเซ็ต Machine ID
2. ตรวจสอบว่าไม่สามารถเข้าถึงข้อมูลเก่าได้
3. ตรวจสอบว่า Machine ID ใหม่ถูกสร้าง

## ความปลอดภัย (Security)

### 1. Data Isolation
- ข้อมูลแยกตาม Machine ID
- ไม่สามารถเข้าถึงข้อมูลของเครื่องอื่น
- ตรวจสอบ Machine ID ในทุก API call

### 2. Privacy Protection
- Machine ID ไม่มีข้อมูลส่วนตัว
- ใช้ browser fingerprinting เป็น fallback
- ข้อมูลไม่ถูกแชร์ระหว่างเครื่อง

## การพัฒนาต่อ (Future Enhancements)

### 1. Advanced Fingerprinting
- เพิ่มข้อมูล hardware fingerprinting
- ใช้ canvas fingerprinting
- เพิ่มความแม่นยำในการระบุเครื่อง

### 2. Data Sync
- เพิ่มฟีเจอร์ sync ข้อมูลระหว่างเครื่อง
- ใช้ cloud storage สำหรับ backup
- รองรับการเข้าสู่ระบบเพื่อ sync

### 3. Analytics
- เพิ่ม analytics สำหรับการใช้งาน
- ติดตามพฤติกรรมผู้ใช้
- สร้างรายงานการใช้งาน

## หมายเหตุ (Notes)

- Machine ID จะถูกเก็บใน localStorage และจะหายเมื่อล้าง cache
- การรีเซ็ต Machine ID จะทำให้ไม่สามารถเข้าถึงข้อมูลเก่าได้
- ข้อมูลที่ส่งออกสามารถนำเข้าไปยังเครื่องอื่นได้
- ระบบรองรับการทำงานแบบ offline ด้วย browser fingerprinting
- ข้อมูลเก่าที่ไม่มี machine_id จะยังคงทำงานได้ปกติ (backward compatibility) 