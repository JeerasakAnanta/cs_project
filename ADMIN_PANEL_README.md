# Admin Panel - ระบบสถิติระบบ

## ภาพรวม

Admin Panel ใหม่ได้ถูกพัฒนาขึ้นเพื่อให้ admin สามารถดูสถิติระบบทั้งหมดได้ในรูปแบบที่สวยงามและใช้งานง่าย โดยแสดงข้อมูลจากฐานข้อมูลแบบ real-time

## ฟีเจอร์หลัก

### 🎯 **สถิติระบบครบถ้วน**
- จำนวนผู้ใช้ทั้งหมด (active/inactive, role distribution)
- จำนวนการสนทนาทั้งหมด (registered + guest users)
- จำนวนข้อความทั้งหมด (user + bot messages)
- สถิติ feedback และความพึงพอใจ
- ข้อมูล machine separation

### 📊 **กราฟและ Charts สวยงาม**
- กราฟแท่งแสดงกิจกรรมรายวัน
- Pie chart แสดงการกระจายของ role
- Gauge chart แสดงอัตราความพึงพอใจ
- Trend indicators สำหรับข้อมูลต่างๆ

### 🔄 **Real-time Updates**
- ข้อมูลอัปเดตแบบ real-time จากฐานข้อมูล
- ปุ่มรีเฟรชสำหรับอัปเดตข้อมูล
- แสดงเวลาอัปเดตล่าสุด

## วิธีการใช้งาน

### 1. เข้าสู่ระบบ Admin Panel

```bash
# ไปที่หน้า Admin Panel
http://localhost:3000/admin

# เข้าสู่ระบบด้วย admin account
username: admin_username
password: admin_password
```

### 2. เลือกแท็บ "สถิติระบบ"

ใน Admin Panel จะมีแท็บใหม่ชื่อ "สถิติระบบ" ที่แสดง:
- 📊 สถิติระบบทั้งหมด
- 👥 สถิติผู้ใช้
- 💬 สถิติการสนทนา

### 3. ดูสถิติพื้นฐาน

#### การ์ดสถิติหลัก
- **ผู้ใช้ทั้งหมด**: จำนวนผู้ใช้ active/inactive
- **การสนทนาทั้งหมด**: แยกตาม registered และ guest
- **ข้อความทั้งหมด**: แยกตาม user และ bot
- **ความพึงพอใจ**: อัตรา satisfaction rate

#### สถิติรายละเอียด
- การกระจายของ role (user, admin)
- กิจกรรมล่าสุด 7 วัน
- สถิติรายวัน 7 วันล่าสุด
- ผู้ใช้ที่มีการสนทนามากที่สุด

### 4. ดูกราฟและ Charts

คลิกปุ่ม "แสดงกราฟ" เพื่อดู:
- **กราฟแท่ง**: กิจกรรมรายวัน
- **Pie Chart**: การกระจายของ role
- **Gauge Chart**: อัตราความพึงพอใจ
- **Trend Indicators**: แนวโน้มข้อมูลต่างๆ

### 5. รีเฟรชข้อมูล

คลิกปุ่ม "รีเฟรช" เพื่ออัปเดตข้อมูลล่าสุดจากฐานข้อมูล

## โครงสร้างข้อมูลที่แสดง

### 📈 **สถิติผู้ใช้**
```json
{
  "total_users": 150,
  "active_users": 142,
  "inactive_users": 8,
  "role_distribution": {
    "user": 140,
    "admin": 10
  }
}
```

### 💬 **สถิติการสนทนา**
```json
{
  "total_registered": 1250,
  "total_guest": 890,
  "total_all": 2140,
  "recent_total": 77
}
```

### 💭 **สถิติข้อความ**
```json
{
  "total_all": 26800,
  "user_messages": 13400,
  "bot_messages": 13400
}
```

### 👍 **สถิติ Feedback**
```json
{
  "total": 1250,
  "likes": 1100,
  "dislikes": 150,
  "satisfaction_rate": 88.0
}
```

## การปรับแต่ง

### แสดง/ซ่อนกราฟ
- คลิกปุ่ม "แสดงกราฟ" เพื่อดูกราฟและ charts
- คลิกปุ่ม "ซ่อนกราฟ" เพื่อซ่อนกราฟ

### รีเฟรชข้อมูล
- คลิกปุ่ม "รีเฟรช" เพื่ออัปเดตข้อมูลล่าสุด
- ข้อมูลจะถูกดึงจากฐานข้อมูลแบบ real-time

### การแสดงผล
- ข้อมูลแสดงในรูปแบบการ์ดสีสันสวยงาม
- ใช้ gradient colors และ animations
- Responsive design สำหรับทุกขนาดหน้าจอ

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเข้าถึง Admin Panel ได้**
   - ตรวจสอบว่าเป็น admin user
   - ตรวจสอบ JWT token
   - ตรวจสอบสิทธิ์การเข้าถึง

2. **ข้อมูลไม่แสดง**
   - ตรวจสอบการเชื่อมต่อฐานข้อมูล
   - ตรวจสอบ API endpoints
   - ดู console errors

3. **กราฟไม่แสดง**
   - คลิกปุ่ม "แสดงกราฟ"
   - ตรวจสอบข้อมูลในฐานข้อมูล
   - รีเฟรชหน้าเว็บ

### การ Debug

```bash
# ดู console errors ใน browser
F12 -> Console

# ตรวจสอบ Network requests
F12 -> Network

# ตรวจสอบ API responses
F12 -> Network -> Response
```

## การพัฒนาต่อ

### แนวคิดสำหรับอนาคต

1. **Real-time Updates**
   - WebSocket สำหรับข้อมูล real-time
   - Auto-refresh ทุก 30 วินาที
   - Push notifications

2. **Advanced Charts**
   - Line charts สำหรับแนวโน้ม
   - Heat maps สำหรับการใช้งาน
   - Interactive charts

3. **Export Features**
   - Export เป็น PDF
   - Export เป็น Excel
   - Scheduled reports

4. **Customization**
   - เลือกช่วงเวลาที่ต้องการดู
   - กำหนดประเภทข้อมูลที่ต้องการ
   - Save custom dashboards

## การติดตั้งและรัน

### 1. รัน Backend
```bash
cd chat_api
python -m uvicorn app.main:app --reload
```

### 2. รัน Frontend
```bash
cd frontend
npm run dev
```

### 3. เข้าถึง Admin Panel
```
http://localhost:3000/admin
```

## ความปลอดภัย

- **Authentication**: ต้องมี JWT token ที่ถูกต้อง
- **Authorization**: ต้องเป็น admin user เท่านั้น
- **Rate Limiting**: ป้องกันการเรียก API บ่อยเกินไป
- **Data Validation**: ตรวจสอบข้อมูลก่อนแสดงผล

## สรุป

Admin Panel ใหม่ให้ admin สามารถ:

✅ **ดูสถิติระบบทั้งหมด** ในรูปแบบที่สวยงาม  
✅ **วิเคราะห์ข้อมูล** ด้วยกราฟและ charts  
✅ **ติดตามแนวโน้ม** ของระบบ  
✅ **จัดการระบบ** ได้อย่างมีประสิทธิภาพ  

ระบบนี้จะช่วยให้ admin เข้าใจการใช้งานระบบได้ดีขึ้น และสามารถตัดสินใจในการพัฒนาต่อได้อย่างถูกต้อง
