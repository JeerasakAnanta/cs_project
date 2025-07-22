# Guest Mode Machine Separation Feature

## ภาพรวม (Overview)

ระบบได้เพิ่มฟีเจอร์การแยกประวัติการสนทนาของ Guest Mode ตามเครื่องแต่ละเครื่อง โดยใช้ Machine Identifier เพื่อให้แต่ละเครื่องเก็บประวัติของตัวเอง ไม่แชร์กัน

## คุณสมบัติหลัก (Key Features)

### 1. Machine Identifier System
- **Server-Generated ID**: สร้าง Machine ID จากเซิร์ฟเวอร์
- **Client Fallback**: หากไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ จะสร้าง ID จาก browser fingerprinting
- **Persistent Storage**: เก็บ Machine ID ใน localStorage เพื่อใช้ต่อเนื่อง

### 2. Database Separation
- **machine_id Column**: เพิ่มฟิลด์ `machine_id` ในตาราง `guest_conversations`
- **Query Filtering**: กรองข้อมูลตาม Machine ID
- **Security**: ตรวจสอบ Machine ID ก่อนเข้าถึงข้อมูล

### 3. Frontend Management
- **Machine Info Panel**: แสดงข้อมูล Machine ID และสถิติ
- **Export/Import**: ส่งออกและนำเข้าข้อมูล
- **Reset Function**: รีเซ็ต Machine ID ใหม่

## การเปลี่ยนแปลงใน Backend

### 1. Database Models (`chat_api/app/database/models.py`)
```python
class GuestConversation(Base):
    __tablename__ = "guest_conversations"
    
    id = Column(String, primary_key=True, index=True)
    machine_id = Column(String, index=True)  # Machine identifier
    title = Column(String, default="Guest Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
```

### 2. CRUD Operations (`chat_api/app/chat/guest_crud.py`)
```python
def create_guest_conversation(db: Session, title: str, machine_id: str = None):
    """Create conversation with machine identifier"""

def get_guest_conversations(db: Session, machine_id: str = None):
    """Get conversations for specific machine"""

def get_guest_conversation_stats(db: Session, machine_id: str = None):
    """Get stats for specific machine"""
```

### 3. API Endpoints (`chat_api/app/chat/guest_router.py`)
```python
@router.post("/machine-id")
async def generate_new_machine_id():
    """Generate new machine identifier"""

@router.get("/conversations")
async def get_guest_conversations(x_machine_id: Optional[str] = Header(None)):
    """Get conversations for machine"""

@router.get("/stats")
async def get_guest_stats(x_machine_id: Optional[str] = Header(None)):
    """Get stats for machine"""
```

## การเปลี่ยนแปลงใน Frontend

### 1. GuestPostgreSQLService (`frontend/src/services/GuestPostgreSQLService.ts`)
```typescript
class GuestPostgreSQLService {
  private machineId: string | null = null;
  
  private async initializeMachineId(): Promise<void> {
    // Get from localStorage or generate new
  }
  
  private generateClientMachineId(): string {
    // Browser fingerprinting fallback
  }
  
  async exportConversations(): Promise<string> {
    // Export data with machine ID
  }
  
  async importConversations(importData: string): Promise<void> {
    // Import data to current machine
  }
}
```

### 2. GuestMachineInfo Component (`frontend/src/components/GuestMachineInfo.tsx`)
- แสดง Machine ID
- สถิติการใช้งาน
- ปุ่ม Export/Import
- ปุ่ม Reset Machine ID

### 3. Configuration (`frontend/src/config.ts`)
```typescript
export const GUEST_MODE_CONFIG = {
  MACHINE_ID_KEY: 'guest_machine_id',
  GUEST_MODE_KEY: 'guestMode',
  AUTO_ENTRY_ENABLED: true,
  MAX_TITLE_LENGTH: 50,
  EXPORT_FILENAME: 'guest_conversations_backup.json',
};
```

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

## การติดตั้ง (Installation)

### 1. Database Migration
```bash
# Run migration to add machine_id column
cd chat_api
alembic upgrade head
```

### 2. Restart Services
```bash
# Restart backend
docker-compose restart backend

# Or if running locally
cd chat_api
uvicorn app.main:app --reload
```

## การใช้งาน (Usage)

### 1. ดูข้อมูลเครื่อง
- คลิกปุ่ม "แสดง ข้อมูลเครื่อง" ในหน้า chat
- ดู Machine ID และสถิติการใช้งาน

### 2. ส่งออกข้อมูล
- คลิกปุ่ม "ส่งออกข้อมูล"
- ไฟล์ JSON จะถูกดาวน์โหลด

### 3. นำเข้าข้อมูล
- คลิกปุ่ม "นำเข้าข้อมูล"
- เลือกไฟล์ JSON ที่ส่งออกไว้
- ข้อมูลจะถูกนำเข้าไปยังเครื่องปัจจุบัน

### 4. รีเซ็ต Machine ID
- คลิกปุ่ม "รีเซ็ต" ในส่วน Machine ID
- ยืนยันการดำเนินการ
- Machine ID ใหม่จะถูกสร้าง

## ความปลอดภัย (Security)

### 1. Data Isolation
- ข้อมูลแยกตาม Machine ID
- ไม่สามารถเข้าถึงข้อมูลของเครื่องอื่น
- ตรวจสอบ Machine ID ในทุก API call

### 2. Privacy Protection
- Machine ID ไม่มีข้อมูลส่วนตัว
- ใช้ browser fingerprinting เป็น fallback
- ข้อมูลไม่ถูกแชร์ระหว่างเครื่อง

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