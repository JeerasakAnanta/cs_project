# คู่มือการทดสอบ API ด้วย Postman สำหรับ LannaFinChat

## 📋 ภาพรวม
คู่มือนี้จะช่วยคุณทดสอบ API ของระบบ LannaFinChat ด้วย Postman โดยครอบคลุมทุก endpoints หลักของระบบ

## 🚀 การติดตั้งและตั้งค่า

### 1. นำเข้า Collection และ Environment
1. เปิด Postman
2. คลิก **Import** 
3. เลือกไฟล์ `LannaFinChat_API_Tests.postman_collection.json`
4. เลือกไฟล์ `LannaFinChat_Environment.postman_environment.json`
5. เลือก Environment "LannaFinChat Environment" ในมุมขวาบน

### 2. ตั้งค่า Environment Variables
ตรวจสอบว่า Environment variables ถูกตั้งค่าดังนี้:
- `base_url`: `http://localhost:8000` (หรือ URL ของเซิร์ฟเวอร์ของคุณ)
- `test_username`: `testuser`
- `test_password`: `testpassword123`
- `test_email`: `test@example.com`

## 🧪 ลำดับการทดสอบ

### Phase 1: การทดสอบพื้นฐาน
1. **1.1 Root Endpoint** - ทดสอบการเชื่อมต่อ API
2. **1.2 Login Status Check** - ตรวจสอบสถานะระบบ login

### Phase 2: การทดสอบ Authentication
1. **1.3 Register New User** - สร้างผู้ใช้ใหม่
2. **1.4 Login User** - เข้าสู่ระบบ (จะเก็บ token อัตโนมัติ)
3. **1.5 Refresh Token** - ทดสอบการรีเฟรช token
4. **1.6 Logout User** - ออกจากระบบ

### Phase 3: การทดสอบ Chat System
1. **2.1 Create New Conversation** - สร้างการสนทนาใหม่
2. **2.2 Get All Conversations** - ดึงรายการการสนทนาทั้งหมด
3. **2.3 Get Specific Conversation** - ดึงการสนทนาเฉพาะ
4. **2.4 Update Conversation Title** - อัปเดตชื่อการสนทนา
5. **2.5 Get Messages in Conversation** - ดึงข้อความในการสนทนา
6. **2.6 Send Message to Conversation** - ส่งข้อความใหม่
7. **2.7 Delete Conversation** - ลบการสนทนา

### Phase 4: การทดสอบ Anonymous และ Guest Chat
1. **3.1 Create Anonymous Conversation** - สร้างการสนทนาแบบไม่ระบุตัวตน
2. **3.2 Send Anonymous Message** - ส่งข้อความแบบไม่ระบุตัวตน
3. **4.1 Create Guest Conversation** - สร้างการสนทนาแบบ guest
4. **4.2 Send Guest Message** - ส่งข้อความแบบ guest

### Phase 5: การทดสอบ PDF Management
1. **5.1 List All PDFs** - รายการไฟล์ PDF ทั้งหมด
2. **5.2 Upload PDF File** - อัปโหลดไฟล์ PDF (ต้องเป็น admin)
3. **5.3 Delete PDF File** - ลบไฟล์ PDF (ต้องเป็น admin)

### Phase 6: การทดสอบ Feedback System
1. **6.1 Submit Message Feedback** - ส่ง feedback สำหรับข้อความ
2. **6.2 Get Feedback Statistics** - ดึงสถิติ feedback

### Phase 7: การทดสอบ Admin System
1. **7.1 Get Admin Statistics** - ดึงสถิติระบบ (ต้องเป็น admin)
2. **7.2 Get All Users** - ดึงรายการผู้ใช้ทั้งหมด (ต้องเป็น admin)
3. **7.3 Get All Conversations (Admin)** - ดึงการสนทนาทั้งหมด (ต้องเป็น admin)
4. **7.4 Get System Logs** - ดึง log ระบบ (ต้องเป็น admin)

### Phase 8: การทดสอบ Vector Management
1. **8.1 List Vector Collections** - รายการ vector collections
2. **8.2 Create Vector Collection** - สร้าง vector collection ใหม่
3. **8.3 Search Vector Documents** - ค้นหาเอกสารใน vector store
4. **8.4 Delete Vector Collection** - ลบ vector collection

### Phase 9: การทดสอบ Error Handling
1. **9.1 Test Invalid Authentication** - ทดสอบ token ที่ไม่ถูกต้อง
2. **9.2 Test Missing Authentication** - ทดสอบการไม่ส่ง token
3. **9.3 Test Invalid Endpoint** - ทดสอบ endpoint ที่ไม่มีอยู่
4. **9.4 Test Invalid JSON Body** - ทดสอบ JSON body ที่ไม่ถูกต้อง

## 🔧 การปรับแต่งการทดสอบ

### การเปลี่ยนข้อมูลทดสอบ
คุณสามารถแก้ไขข้อมูลทดสอบใน Environment variables:
- เปลี่ยน `test_username`, `test_password`, `test_email` สำหรับผู้ใช้ทดสอบ
- เปลี่ยน `base_url` สำหรับเซิร์ฟเวอร์ที่แตกต่างกัน

### การทดสอบแบบ Batch
1. เลือก Collection ทั้งหมด
2. คลิก **Run** 
3. เลือก Environment "LannaFinChat Environment"
4. คลิก **Run LannaFinChat API Tests**

### การทดสอบเฉพาะส่วน
คุณสามารถรันการทดสอบเฉพาะส่วนที่ต้องการ:
- เลือก Folder ที่ต้องการทดสอบ
- คลิกขวา → **Run folder**

## 📊 การตรวจสอบผลลัพธ์

### Status Codes ที่คาดหวัง
- `200` - สำเร็จ
- `201` - สร้างสำเร็จ
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### การตรวจสอบ Response
1. ตรวจสอบ Status Code
2. ตรวจสอบ Response Body
3. ตรวจสอบ Headers (โดยเฉพาะ Authorization)
4. ตรวจสอบ Response Time

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### 1. Authentication Error (401)
- ตรวจสอบว่าได้ login แล้ว
- ตรวจสอบว่า access_token ถูกเก็บใน Environment
- ลอง refresh token หรือ login ใหม่

### 2. Connection Error
- ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่
- ตรวจสอบ `base_url` ใน Environment
- ตรวจสอบ network connection

### 3. File Upload Error
- ตรวจสอบว่าเป็น admin user
- ตรวจสอบว่าไฟล์เป็น PDF
- ตรวจสอบขนาดไฟล์

### 4. Database Error
- ตรวจสอบว่า database เชื่อมต่อได้
- ตรวจสอบว่า tables ถูกสร้างแล้ว
- ตรวจสอบ logs ของเซิร์ฟเวอร์

## 📝 การบันทึกผลการทดสอบ

### การ Export Results
1. หลังรันการทดสอบเสร็จ
2. คลิก **Export Results**
3. เลือก format ที่ต้องการ (JSON, CSV)

### การสร้าง Test Report
1. ใช้ Newman (Command Line) สำหรับ CI/CD
2. สร้าง custom test scripts
3. บันทึกผลในระบบ tracking

## 🔄 การทดสอบแบบ Automated

### การใช้ Newman
```bash
# ติดตั้ง Newman
npm install -g newman

# รันการทดสอบ
newman run LannaFinChat_API_Tests.postman_collection.json \
  -e LannaFinChat_Environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

### การใช้ Postman CLI
```bash
# รันการทดสอบ
postman collection run LannaFinChat_API_Tests.postman_collection.json \
  --environment LannaFinChat_Environment.postman_environment.json
```

## 📞 การขอความช่วยเหลือ

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ logs ของเซิร์ฟเวอร์
2. ตรวจสอบ database connection
3. ตรวจสอบ environment variables
4. ลองทดสอบ endpoints ทีละตัว

---

**หมายเหตุ**: การทดสอบนี้ครอบคลุม API endpoints หลักของระบบ LannaFinChat หากมี endpoints เพิ่มเติมหรือเปลี่ยนแปลง โปรดอัปเดต collection ตามความเหมาะสม

