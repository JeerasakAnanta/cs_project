# Guest Mode PostgreSQL Logging Implementation

## ภาพรวม (Overview)

ระบบได้เพิ่มการเก็บ logs บทสนทนาของ Guest mode ลงในฐานข้อมูล PostgreSQL โดยไม่สามารถลบได้ (soft delete) เพื่อให้สามารถติดตามและวิเคราะห์การใช้งานของผู้เยี่ยมชมได้

**คุณสมบัติพิเศษ:** Title ของบทสนทนาจะใช้ข้อความแรกที่ผู้ใช้พิมพ์ แทนที่จะเป็น "Guest Conversation - [วันที่เวลา]"

## คุณสมบัติหลัก (Key Features)

### 1. การเก็บข้อมูลใน PostgreSQL
- บทสนทนาทั้งหมดของ Guest mode จะถูกเก็บในฐานข้อมูล PostgreSQL
- ข้อมูลจะไม่หายเมื่อรีเฟรชหน้าเว็บหรือปิดเบราว์เซอร์
- ข้อมูลจะถูกเก็บถาวรในฐานข้อมูล

### 2. Title ตามข้อความของผู้ใช้
- Title ของบทสนทนาจะใช้ข้อความแรกที่ผู้ใช้พิมพ์
- หากข้อความยาวเกิน 50 ตัวอักษร จะตัดและเพิ่ม "..."
- ไม่ใช้ "Guest Conversation - [วันที่เวลา]" อีกต่อไป

### 3. Soft Delete (ไม่สามารถลบได้)
- การลบบทสนทนาจะเป็นการ "soft delete" เท่านั้น
- ข้อมูลจะยังคงอยู่ในฐานข้อมูล แต่จะถูกทำเครื่องหมายว่า `is_deleted = true`
- ผู้ดูแลระบบสามารถดูข้อมูลทั้งหมดได้

### 4. การติดตามและวิเคราะห์
- มีระบบสถิติการใช้งาน Guest mode
- สามารถติดตามจำนวนบทสนทนาและข้อความทั้งหมด
- ข้อมูลสามารถนำไปใช้ในการวิเคราะห์พฤติกรรมผู้ใช้

## การเปลี่ยนแปลงใน Backend

### 1. Database Models (`chat_api/app/database/models.py`)

#### GuestConversation Model
```python
class GuestConversation(Base):
    __tablename__ = "guest_conversations"

    id = Column(String, primary_key=True, index=True)  # UUID string
    title = Column(String, default="Guest Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)  # Soft delete flag

    messages = relationship("GuestMessage", back_populates="conversation", cascade="all, delete-orphan")
```

#### GuestMessage Model
```python
class GuestMessage(Base):
    __tablename__ = "guest_messages"

    id = Column(String, primary_key=True, index=True)  # UUID string
    conversation_id = Column(String, ForeignKey("guest_conversations.id"))
    sender = Column(String)  # "user" or "bot"
    content = Column(Text)  # Use Text for longer messages
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("GuestConversation", back_populates="messages")
```

### 2. CRUD Operations (`chat_api/app/chat/guest_crud.py`)

#### ฟังก์ชันหลัก:
- `create_guest_conversation()` - สร้างบทสนทนาใหม่
- `get_guest_conversation()` - ดึงบทสนทนาตาม ID
- `get_all_guest_conversations()` - ดึงบทสนทนาทั้งหมด (ไม่รวมที่ลบแล้ว)
- `add_guest_message()` - เพิ่มข้อความในบทสนทนา
- `get_guest_messages()` - ดึงข้อความทั้งหมดในบทสนทนา
- `soft_delete_guest_conversation()` - Soft delete บทสนทนา
- `update_guest_conversation_title()` - อัปเดตชื่อบทสนทนา
- `get_guest_conversation_stats()` - ดึงสถิติการใช้งาน

### 3. API Router (`chat_api/app/chat/guest_router.py`)

#### Endpoints:
```
POST /chat/guest/message
- ส่งข้อความและรับคำตอบจาก bot (บันทึกลง PostgreSQL)

POST /chat/guest/conversations
- สร้างบทสนทนาใหม่

GET /chat/guest/conversations
- ดึงบทสนทนาทั้งหมด

GET /chat/guest/conversations/{conversation_id}
- ดึงบทสนทนาตาม ID

POST /chat/guest/conversations/{conversation_id}/messages
- เพิ่มข้อความในบทสนทนา

GET /chat/guest/conversations/{conversation_id}/messages
- ดึงข้อความทั้งหมดในบทสนทนา

PUT /chat/guest/conversations/{conversation_id}
- อัปเดตชื่อบทสนทนา

DELETE /chat/guest/conversations/{conversation_id}
- Soft delete บทสนทนา

GET /chat/guest/stats
- ดึงสถิติการใช้งาน

# Admin endpoints
GET /chat/guest/admin/conversations/all
- ดึงบทสนทนาทั้งหมดรวมที่ลบแล้ว (สำหรับ admin)

GET /chat/guest/admin/stats/detailed
- ดึงสถิติรายละเอียด (สำหรับ admin)
```

### 4. Schemas (`chat_api/app/chat/schemas.py`)

#### Guest Conversation Schemas:
```python
class GuestMessageBase(BaseModel):
    sender: str
    content: str

class GuestMessage(GuestMessageBase):
    id: str
    conversation_id: str
    timestamp: datetime

class GuestConversationBase(BaseModel):
    title: str = "Guest Conversation"

class GuestConversation(GuestConversationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    messages: List[GuestMessage] = []

class GuestConversationStats(BaseModel):
    total_conversations: int
    total_messages: int
```

## การเปลี่ยนแปลงใน Frontend

### 1. New Service (`frontend/src/services/GuestPostgreSQLService.ts`)

#### คุณสมบัติ:
- เชื่อมต่อกับ API `/chat/guest`
- จัดการบทสนทนาและข้อความทั้งหมด
- รองรับการสร้าง, อ่าน, อัปเดต, และ soft delete
- มีระบบ error handling

#### ฟังก์ชันหลัก:
```typescript
class GuestPostgreSQLService {
  // Conversation methods
  async sendMessage(content: string): Promise<{ message: string; conversation_id: string }>
  async createConversation(title: string): Promise<GuestConversation>
  async getConversations(): Promise<GuestConversation[]>
  async getConversation(conversationId: string): Promise<GuestConversation>
  async addMessage(conversationId: string, content: string): Promise<{ message: string }>
  async getMessages(conversationId: string): Promise<GuestMessage[]>
  async updateConversationTitle(conversationId: string, title: string): Promise<GuestConversation>
  async deleteConversation(conversationId: string): Promise<{ message: string }>
  async getStats(): Promise<GuestConversationStats>
}
```

### 2. Updated App Component (`frontend/src/App.tsx`)

#### การเปลี่ยนแปลง:
- เปลี่ยนจาก `guestChatService` เป็น `guestPostgreSQLService`
- อัปเดตฟังก์ชัน `handleGuestSendMessage()` ให้ทำงานกับ PostgreSQL
- อัปเดตฟังก์ชัน `handleSelectConversation()` ให้โหลดข้อมูลจาก PostgreSQL
- อัปเดตฟังก์ชัน `handleConversationDeleted()` ให้ใช้ soft delete

### 3. Updated Chatbot Component (`frontend/src/components/Chatbot.tsx`)

#### การเปลี่ยนแปลง:
- ลบ feedback buttons และ modal ออก
- ลบ feedback-related imports และ state
- ลบ feedback submission functions
- ปรับปรุง UI ให้เรียบง่ายขึ้น

## การทำงานของระบบ (System Flow)

### 1. การส่งข้อความใน Guest Mode
1. ผู้ใช้ส่งข้อความ
2. ระบบสร้างบทสนทนาใหม่ (ถ้ายังไม่มี) โดยใช้ข้อความแรกเป็น title
3. บันทึกข้อความของผู้ใช้ลง PostgreSQL
4. ส่งข้อความไปยัง RAG system เพื่อรับคำตอบ
5. บันทึกคำตอบของ bot ลง PostgreSQL
6. อัปเดต UI แสดงข้อความใหม่

### 2. การสร้าง Title ของบทสนทนา
1. ใช้ข้อความแรกที่ผู้ใช้พิมพ์เป็น title
2. หากข้อความยาวเกิน 50 ตัวอักษร จะตัดและเพิ่ม "..."
3. ตัวอย่าง: "สวัสดีครับ" → title: "สวัสดีครับ"
4. ตัวอย่าง: "ขอทราบขั้นตอนการเบิกค่าใช้จ่ายในการเดินทางไปราชการอย่างละเอียด" → title: "ขอทราบขั้นตอนการเบิกค่าใช้จ่ายในการเดินทางไปราชการ..."

### 3. การโหลดบทสนทนา
1. ผู้ใช้เลือกบทสนทนา
2. ระบบดึงข้อมูลจาก PostgreSQL
3. แสดงข้อความทั้งหมดในบทสนทนา
4. จัดรูปแบบข้อความของ bot (markdown, links)

### 4. การลบบทสนทนา
1. ผู้ใช้คลิกลบบทสนทนา
2. ระบบเรียก soft delete API
3. ข้อมูลยังคงอยู่ในฐานข้อมูล แต่ `is_deleted = true`
4. อัปเดต UI ลบบทสนทนาออกจากรายการ

## ความปลอดภัย (Security)

### 1. Data Privacy
- ข้อมูล Guest mode ถูกเก็บในฐานข้อมูล PostgreSQL
- ไม่มีการเก็บข้อมูลส่วนตัวของผู้ใช้
- ข้อมูลสามารถใช้สำหรับการวิเคราะห์และปรับปรุงระบบ

### 2. Access Control
- API endpoints ไม่ต้องการ authentication
- Admin endpoints สามารถเพิ่ม authentication ได้ในอนาคต
- ข้อมูลที่ลบแล้วยังคงอยู่ในฐานข้อมูลเพื่อการตรวจสอบ

## การติดตั้งและใช้งาน (Installation & Usage)

### 1. Database Setup
```bash
# สร้างตารางในฐานข้อมูล
cd chat_api
uv run python create_guest_tables.py

# ตรวจสอบและแก้ไข schema (ถ้าจำเป็น)
uv run python check_and_fix_db.py
```

### 2. Start Backend Server
```bash
cd chat_api
uv run python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Test API Endpoints
```bash
# ส่งข้อความ
curl -X POST http://localhost:8001/chat/guest/message \
  -H "Content-Type: application/json" \
  -d '{"content": "สวัสดีครับ"}'

# ดึงสถิติ
curl -X GET http://localhost:8001/chat/guest/stats

# สร้างบทสนทนาใหม่
curl -X POST http://localhost:8001/chat/guest/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Conversation"}'
```

## การพัฒนาต่อ (Future Enhancements)

### 1. Analytics Dashboard
- สร้างหน้า dashboard สำหรับดูสถิติ Guest mode
- แสดงกราฟการใช้งานตามเวลา
- วิเคราะห์คำถามที่พบบ่อย

### 2. Data Export
- เพิ่มฟีเจอร์ export ข้อมูล Guest mode
- Export เป็น CSV, JSON, หรือ Excel
- กำหนดช่วงเวลาที่ต้องการ export

### 3. Advanced Filtering
- กรองบทสนทนาตามวันที่
- ค้นหาข้อความในบทสนทนา
- กรองตามความยาวของบทสนทนา

### 4. Admin Authentication
- เพิ่ม authentication สำหรับ admin endpoints
- จำกัดสิทธิ์การเข้าถึงข้อมูล
- Audit log สำหรับการเข้าถึงข้อมูล

## หมายเหตุ (Notes)

- ระบบ Guest mode PostgreSQL logging ทำงานควบคู่กับระบบเดิม
- ข้อมูลจะถูกเก็บถาวรในฐานข้อมูล
- Soft delete หมายความว่าข้อมูลไม่หายไปจริง แต่จะไม่แสดงใน UI
- สามารถใช้ข้อมูลนี้เพื่อปรับปรุงระบบและวิเคราะห์พฤติกรรมผู้ใช้
- ระบบรองรับการใช้งานจำนวนมากและมีประสิทธิภาพสูง 

# Guest Mode API Endpoints

## Guest Conversation Endpoints

POST /chat/guest/message
- ส่งข้อความและรับคำตอบจาก bot

POST /chat/guest/conversations
- สร้างบทสนทนาใหม่

GET /chat/guest/conversations
- ดึงบทสนทนาทั้งหมด

GET /chat/guest/conversations/{conversation_id}
- ดึงบทสนทนาตาม ID

POST /chat/guest/conversations/{conversation_id}/messages
- เพิ่มข้อความในบทสนทนา

GET /chat/guest/conversations/{conversation_id}/messages
- ดึงข้อความทั้งหมดในบทสนทนา

PUT /chat/guest/conversations/{conversation_id}
- อัปเดตชื่อบทสนทนา

DELETE /chat/guest/conversations/{conversation_id}
- Soft delete บทสนทนา

GET /chat/guest/stats
- ดึงสถิติการใช้งาน

# Admin endpoints
GET /chat/guest/admin/conversations/all
- ดึงบทสนทนาทั้งหมดรวมที่ลบแล้ว (สำหรับ admin)

GET /chat/guest/admin/stats/detailed
- ดึงสถิติรายละเอียด (สำหรับ admin) 