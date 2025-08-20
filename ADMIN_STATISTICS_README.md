# ระบบสถิติสำหรับ Admin

## ภาพรวม
ระบบสถิติใหม่นี้ให้ admin สามารถดูข้อมูลสถิติของระบบทั้งหมดได้ รวมถึง:
- จำนวนผู้ใช้ทั้งหมด (ผู้ใช้ที่ลงทะเบียน)
- จำนวนการสนทนาทั้งหมด (ทั้งผู้ใช้ที่ลงทะเบียนและ guest)
- จำนวนข้อความทั้งหมด
- สถิติ feedback และความพึงพอใจ
- ข้อมูลการใช้งานล่าสุด

## API Endpoints ที่เพิ่มใหม่

### 1. `/admin/statistics/` - สถิติระบบรวม
**GET** - ดึงข้อมูลสถิติทั้งหมดของระบบ

**ข้อมูลที่ได้:**
- จำนวนผู้ใช้ทั้งหมด, ผู้ใช้ที่ active/inactive
- การกระจายของ role (user, admin)
- จำนวนการสนทนาทั้งหมด (registered + guest)
- จำนวนข้อความทั้งหมด (user + bot)
- สถิติ feedback (like/dislike)
- จำนวนเครื่องที่ใช้งาน (machine separation)

### 2. `/admin/statistics/users/` - สถิติผู้ใช้
**GET** - ดึงข้อมูลสถิติเฉพาะผู้ใช้

**ข้อมูลที่ได้:**
- จำนวนผู้ใช้ทั้งหมด, active, inactive
- การกระจายของ role
- ผู้ใช้ที่มีการสนทนามากที่สุด (top 10)

### 3. `/admin/statistics/conversations/` - สถิติการสนทนา
**GET** - ดึงข้อมูลสถิติการสนทนา

**ข้อมูลที่ได้:**
- จำนวนการสนทนาทั้งหมด (registered + guest)
- การสนทนาใน 30 วันล่าสุด
- สถิติรายวัน 7 วันล่าสุด

## วิธีการใช้งาน

### 1. เริ่มต้นระบบ
```bash
# ไปที่โฟลเดอร์ chat_api
cd chat_api

# รันระบบ
python -m uvicorn app.main:app --reload
```

### 2. เข้าสู่ระบบเป็น Admin
```bash
# ใช้ endpoint login เพื่อเข้าสู่ระบบ
POST /login/
{
  "username": "admin_username",
  "password": "admin_password"
}

# เก็บ JWT token ที่ได้
```

### 3. เรียกใช้ API สถิติ
```bash
# เรียกดูสถิติระบบทั้งหมด
GET /admin/statistics/
Authorization: Bearer <your_jwt_token>

# เรียกดูสถิติผู้ใช้
GET /admin/statistics/users/
Authorization: Bearer <your_jwt_token>

# เรียกดูสถิติการสนทนา
GET /admin/statistics/conversations/
Authorization: Bearer <your_jwt_token>
```

## ตัวอย่างการใช้งาน

### ดูจำนวนผู้ใช้ทั้งหมด
```javascript
const response = await fetch('/admin/statistics/', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const stats = await response.json();
console.log(`จำนวนผู้ใช้ทั้งหมด: ${stats.users.total}`);
console.log(`ผู้ใช้ที่ active: ${stats.users.active}`);
```

### ดูจำนวนการสนทนาทั้งหมด
```javascript
const stats = await getSystemStats();
console.log(`การสนทนาทั้งหมด: ${stats.conversations.total_all}`);
console.log(`การสนทนาของผู้ใช้ที่ลงทะเบียน: ${stats.conversations.total_registered}`);
console.log(`การสนทนาของ guest: ${stats.conversations.total_guest}`);
```

### ดูสถิติข้อความ
```javascript
const stats = await getSystemStats();
console.log(`ข้อความทั้งหมด: ${stats.messages.total_all}`);
console.log(`ข้อความของผู้ใช้: ${stats.messages.user_messages_registered + stats.messages.user_messages_guest}`);
console.log(`ข้อความของ bot: ${stats.messages.bot_messages_registered + stats.messages.bot_messages_guest}`);
```

## การทดสอบ

### 1. รัน Test Script
```bash
cd chat_api
python test_admin_statistics.py
```

### 2. ทดสอบด้วย curl
```bash
# ทดสอบการเข้าถึงโดยไม่มี token
curl -X GET "http://localhost:8000/admin/statistics/"

# ทดสอบการเข้าถึงด้วย admin token
curl -X GET "http://localhost:8000/admin/statistics/" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. ทดสอบด้วย Postman
- Import collection ที่มี endpoints ใหม่
- ตั้งค่า Authorization header ด้วย Bearer token
- ทดสอบแต่ละ endpoint

## โครงสร้างข้อมูล

### สถิติระบบรวม
```json
{
  "users": {
    "total": 150,
    "active": 142,
    "inactive": 8,
    "role_distribution": {"user": 140, "admin": 10}
  },
  "conversations": {
    "total_registered": 1250,
    "total_guest": 890,
    "total_all": 2140
  },
  "messages": {
    "total_registered": 15600,
    "total_guest": 11200,
    "total_all": 26800
  },
  "feedbacks": {
    "total": 1250,
    "likes": 1100,
    "dislikes": 150,
    "satisfaction_rate": 88.0
  }
}
```

## ความปลอดภัย

- **Authentication**: ต้องมี JWT token ที่ถูกต้อง
- **Authorization**: ต้องเป็น admin user เท่านั้น
- **Rate Limiting**: ควรตั้งค่า rate limit สำหรับ endpoints เหล่านี้
- **Logging**: ระบบจะ log การเข้าถึงทั้งหมด

## การปรับแต่ง

### เพิ่มสถิติใหม่
```python
# ใน router_admin.py เพิ่ม endpoint ใหม่
@router.get("/statistics/custom/")
def get_custom_statistics(db: Session = Depends(get_db)):
    # คำนวณสถิติที่ต้องการ
    pass
```

### ปรับแต่งการคำนวณ
```python
# ปรับแต่งการคำนวณใน endpoints ที่มีอยู่
# เช่น เปลี่ยนจาก 7 วันเป็น 30 วัน
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **401 Unauthorized**
   - ตรวจสอบ JWT token
   - ตรวจสอบว่าเป็น admin user

2. **500 Internal Server Error**
   - ตรวจสอบการเชื่อมต่อฐานข้อมูล
   - ตรวจสอบ log files

3. **ข้อมูลไม่ถูกต้อง**
   - ตรวจสอบ models ในฐานข้อมูล
   - ตรวจสอบการ query

### การ Debug
```bash
# ดู log ของระบบ
tail -f chat_api/log/app.log

# ทดสอบการเชื่อมต่อฐานข้อมูล
python -c "from app.utils.database import engine; print(engine.execute('SELECT 1').scalar())"
```

## การพัฒนาต่อ

### แนวคิดสำหรับอนาคต
- เพิ่มกราฟและ charts
- เพิ่มการ export ข้อมูลเป็น CSV/Excel
- เพิ่มการแจ้งเตือนเมื่อสถิติผิดปกติ
- เพิ่ม dashboard แบบ real-time

### การเพิ่ม Features ใหม่
1. สร้าง endpoint ใหม่ใน `router_admin.py`
2. เพิ่ม test cases ใน `test_admin_statistics.py`
3. อัปเดต documentation
4. ทดสอบการทำงาน

## ติดต่อและสนับสนุน

หากมีปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ log files
- ดู documentation ใน `ADMIN_STATISTICS_API.md`
- ทดสอบด้วย test script
- ตรวจสอบการทำงานของฐานข้อมูล
