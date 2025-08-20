# การวิเคราะห์ระบบ LannaFinChat ด้วย Use Case Diagram

## ภาพรวม (Overview)

เอกสารนี้เป็นการวิเคราะห์ระบบ LannaFinChat โดยใช้ Use Case Diagram เพื่อแสดงความสัมพันธ์ระหว่างผู้ใช้ (Actors) และฟังก์ชันการทำงานของระบบ (Use Cases) ต่างๆ

## 🎭 Actors (ตัวแสดง)

### 1. **Guest User (ผู้ใช้ทั่วไป)**
- ผู้ใช้ที่เข้าถึงระบบโดยไม่ต้องเข้าสู่ระบบ
- สามารถใช้งานฟีเจอร์พื้นฐานได้
- ประวัติการสนทนาจะถูกเก็บในเครื่อง

### 2. **Authenticated User (ผู้ใช้ที่เข้าสู่ระบบ)**
- ผู้ใช้ที่ลงทะเบียนและเข้าสู่ระบบแล้ว
- สามารถใช้งานฟีเจอร์ทั้งหมดได้
- ประวัติการสนทนาจะถูกเก็บในฐานข้อมูล

### 3. **System Administrator (ผู้ดูแลระบบ)**
- ผู้ดูแลระบบที่มีสิทธิ์สูงสุด
- สามารถจัดการผู้ใช้ เอกสาร และระบบได้
- เข้าถึงฟีเจอร์การจัดการระบบ

### 4. **External Systems (ระบบภายนอก)**
- OpenAI API (สำหรับ LLM)
- Qdrant Vector Database
- PostgreSQL Database

## 📋 ตารางการอธิบาย Use Cases

| Use Case Name | Scenario | Brief Description | Actors | Related Use Case | Stakeholders | Precondition | Flow of Events | Exception |
|---------------|----------|-------------------|--------|------------------|--------------|--------------|----------------|-----------|
| **UC1: Login** | ผู้ใช้ต้องการเข้าสู่ระบบ | ระบบตรวจสอบข้อมูลการเข้าสู่ระบบและอนุญาตให้เข้าถึงฟีเจอร์เพิ่มเติม | Authenticated User | UC26 (View Machine Info) | ผู้ใช้, ระบบ | มีบัญชีผู้ใช้ | 1. ผู้ใช้ป้อนอีเมลและรหัสผ่าน<br>2. ระบบตรวจสอบข้อมูล<br>3. ระบบสร้าง session<br>4. ระบบแสดงหน้าหลัก | ข้อมูลไม่ถูกต้อง, ระบบไม่พร้อมใช้งาน |
| **UC2: Register** | ผู้ใช้ใหม่ต้องการสร้างบัญชี | ระบบสร้างบัญชีผู้ใช้ใหม่และยืนยันข้อมูล | Guest User | UC1 (Login) | ผู้ใช้ใหม่, ระบบ | ไม่มีบัญชีผู้ใช้ | 1. ผู้ใช้ป้อนข้อมูลส่วนตัว<br>2. ระบบตรวจสอบข้อมูล<br>3. ระบบส่งอีเมลยืนยัน<br>4. ระบบสร้างบัญชี | ข้อมูลไม่ครบถ้วน, อีเมลซ้ำ |
| **UC3: Logout** | ผู้ใช้ต้องการออกจากระบบ | ระบบล้าง session และกลับไปยังหน้าเริ่มต้น | Authenticated User | - | ผู้ใช้, ระบบ | เข้าสู่ระบบแล้ว | 1. ผู้ใช้คลิกปุ่มออกจากระบบ<br>2. ระบบล้าง session<br>3. ระบบแสดงหน้าเริ่มต้น | - |
| **UC4: Enable Guest Mode** | ผู้ใช้ต้องการใช้งานแบบไม่เข้าสู่ระบบ | ระบบเปิดโหมดผู้ใช้ทั่วไปและสร้าง Machine ID | Guest User | UC25 (Generate Machine ID) | ผู้ใช้ทั่วไป, ระบบ | ระบบพร้อมใช้งาน | 1. ผู้ใช้เลือก Guest Mode<br>2. ระบบสร้าง Machine ID<br>3. ระบบเปิดฟีเจอร์พื้นฐาน | ระบบไม่พร้อมใช้งาน |
| **UC5: Disable Guest Mode** | ผู้ใช้ต้องการปิดโหมดผู้ใช้ทั่วไป | ระบบปิดโหมดผู้ใช้ทั่วไปและล้างข้อมูลชั่วคราว | Guest User | - | ผู้ใช้ทั่วไป, ระบบ | ใช้งานใน Guest Mode | 1. ผู้ใช้เลือกปิด Guest Mode<br>2. ระบบล้างข้อมูลชั่วคราว<br>3. ระบบแสดงหน้าเริ่มต้น | - |
| **UC6: Send Message** | ผู้ใช้ต้องการส่งข้อความ | ระบบรับข้อความและส่งไปยัง LLM เพื่อประมวลผล | Guest User, Authenticated User | UC7 (Receive Response) | ผู้ใช้, ระบบ, LLM | มีการสนทนาที่เปิดอยู่ | 1. ผู้ใช้พิมพ์ข้อความ<br>2. ระบบตรวจสอบข้อความ<br>3. ระบบส่งไปยัง LLM<br>4. ระบบบันทึกข้อความ | ข้อความว่าง, ระบบไม่พร้อม |
| **UC7: Receive Response** | ระบบได้รับคำตอบจาก LLM | ระบบแสดงคำตอบและบันทึกลงในประวัติการสนทนา | Guest User, Authenticated User | UC30 (Rate Response Quality) | ผู้ใช้, ระบบ, LLM | ได้รับคำตอบจาก LLM | 1. ระบบได้รับคำตอบจาก LLM<br>2. ระบบแสดงคำตอบ<br>3. ระบบบันทึกลงประวัติ<br>4. ระบบขอคะแนนคุณภาพ | คำตอบไม่สมบูรณ์, ระบบขัดข้อง |
| **UC8: Create Conversation** | ผู้ใช้ต้องการเริ่มการสนทนาใหม่ | ระบบสร้างการสนทนาใหม่และเตรียมพร้อมสำหรับการแชต | Guest User, Authenticated User | UC9 (View Conversation History) | ผู้ใช้, ระบบ | ระบบพร้อมใช้งาน | 1. ผู้ใช้คลิกสร้างการสนทนาใหม่<br>2. ระบบสร้าง session ใหม่<br>3. ระบบแสดงหน้าสนทนา<br>4. ระบบโหลดประวัติ (ถ้ามี) | ระบบไม่พร้อมใช้งาน |
| **UC9: View Conversation History** | ผู้ใช้ต้องการดูประวัติการสนทนา | ระบบแสดงประวัติการสนทนาทั้งหมดของผู้ใช้ | Guest User, Authenticated User | - | ผู้ใช้, ระบบ | มีประวัติการสนทนา | 1. ผู้ใช้คลิกดูประวัติ<br>2. ระบบดึงข้อมูลประวัติ<br>3. ระบบแสดงรายการสนทนา<br>4. ผู้ใช้เลือกสนทนา | ไม่มีประวัติการสนทนา |
| **UC10: Clear Conversation History** | ผู้ใช้ต้องการล้างประวัติการสนทนา | ระบบลบประวัติการสนทนาทั้งหมดหรือบางส่วน | Guest User, Authenticated User | - | ผู้ใช้, ระบบ | มีประวัติการสนทนา | 1. ผู้ใช้เลือกล้างประวัติ<br>2. ระบบยืนยันการลบ<br>3. ระบบลบข้อมูล<br>4. ระบบแสดงข้อความยืนยัน | ไม่มีประวัติให้ลบ |
| **UC11: Export Conversation Data** | ผู้ใช้ต้องการส่งออกข้อมูลการสนทนา | ระบบสร้างไฟล์ข้อมูลการสนทนาให้ผู้ใช้ดาวน์โหลด | Guest User, Authenticated User | - | ผู้ใช้, ระบบ | มีข้อมูลการสนทนา | 1. ผู้ใช้เลือกส่งออกข้อมูล<br>2. ระบบสร้างไฟล์<br>3. ระบบให้ดาวน์โหลด<br>4. ระบบบันทึกการส่งออก | ไม่มีข้อมูลให้ส่งออก |
| **UC12: Import Conversation Data** | ผู้ใช้ต้องการนำเข้าข้อมูลการสนทนา | ระบบนำเข้าข้อมูลการสนทนาจากไฟล์ | Guest User, Authenticated User | - | ผู้ใช้, ระบบ | มีไฟล์ข้อมูลการสนทนา | 1. ผู้ใช้เลือกไฟล์<br>2. ระบบตรวจสอบไฟล์<br>3. ระบบนำเข้าข้อมูล<br>4. ระบบแสดงผลลัพธ์ | ไฟล์ไม่ถูกต้อง, ข้อมูลเสียหาย |
| **UC13: Upload PDF Document** | ผู้ใช้ต้องการอัปโหลดเอกสาร PDF | ระบบรับไฟล์ PDF และประมวลผลเพื่อสร้าง embeddings | Authenticated User, System Administrator | UC16 (Process Document Embeddings) | ผู้ใช้, ระบบ, Vector DB | มีไฟล์ PDF | 1. ผู้ใช้เลือกไฟล์ PDF<br>2. ระบบตรวจสอบไฟล์<br>3. ระบบอัปโหลดไฟล์<br>4. ระบบประมวลผลเอกสาร | ไฟล์เสียหาย, ขนาดไฟล์เกิน |
| **UC14: View Document List** | ผู้ใช้ต้องการดูรายการเอกสาร | ระบบแสดงรายการเอกสารทั้งหมดของผู้ใช้ | Authenticated User, System Administrator | - | ผู้ใช้, ระบบ | มีเอกสารในระบบ | 1. ผู้ใช้คลิกดูรายการเอกสาร<br>2. ระบบดึงข้อมูลเอกสาร<br>3. ระบบแสดงรายการ<br>4. ผู้ใช้เลือกเอกสาร | ไม่มีเอกสารในระบบ |
| **UC15: Delete Document** | ผู้ใช้ต้องการลบเอกสาร | ระบบลบเอกสารและ embeddings ที่เกี่ยวข้อง | Authenticated User, System Administrator | UC34 (Update Embeddings) | ผู้ใช้, ระบบ, Vector DB | มีเอกสารในระบบ | 1. ผู้ใช้เลือกเอกสาร<br>2. ระบบยืนยันการลบ<br>3. ระบบลบเอกสาร<br>4. ระบบลบ embeddings | เอกสารไม่พบ, ไม่มีสิทธิ์ลบ |
| **UC16: Process Document Embeddings** | ระบบประมวลผลเอกสารเพื่อสร้าง embeddings | ระบบแยกข้อความและสร้าง embeddings สำหรับการค้นหา | System Administrator, External Systems | UC35 (Search Similar Documents) | ระบบ, Vector DB, LLM | มีเอกสารใหม่ | 1. ระบบแยกข้อความจากเอกสาร<br>2. ระบบสร้าง embeddings<br>3. ระบบบันทึกลง Vector DB<br>4. ระบบยืนยันการประมวลผล | เอกสารเสียหาย, Vector DB ไม่พร้อม |
| **UC17: Search Documents** | ผู้ใช้ต้องการค้นหาเอกสาร | ระบบค้นหาเอกสารตามคำค้นหา | Authenticated User, System Administrator | UC35 (Search Similar Documents) | ผู้ใช้, ระบบ, Vector DB | มีเอกสารในระบบ | 1. ผู้ใช้ป้อนคำค้นหา<br>2. ระบบค้นหาใน Vector DB<br>3. ระบบแสดงผลลัพธ์<br>4. ผู้ใช้เลือกเอกสาร | ไม่พบเอกสารที่ตรงกัน |
| **UC18: View Document Details** | ผู้ใช้ต้องการดูรายละเอียดเอกสาร | ระบบแสดงรายละเอียดและเนื้อหาของเอกสาร | Authenticated User, System Administrator | - | ผู้ใช้, ระบบ | มีเอกสารในระบบ | 1. ผู้ใช้เลือกเอกสาร<br>2. ระบบดึงข้อมูลเอกสาร<br>3. ระบบแสดงรายละเอียด<br>4. ระบบแสดงเนื้อหา | เอกสารไม่พบ |
| **UC19: Manage Users** | ผู้ดูแลระบบต้องการจัดการผู้ใช้ | ระบบจัดการบัญชีผู้ใช้ทั้งหมดในระบบ | System Administrator | - | ผู้ดูแลระบบ, ระบบ | เข้าสู่ระบบเป็นผู้ดูแล | 1. ผู้ดูแลเข้าถึงหน้าจัดการผู้ใช้<br>2. ระบบแสดงรายการผู้ใช้<br>3. ผู้ดูแลเลือกการดำเนินการ<br>4. ระบบดำเนินการตามที่เลือก | ไม่มีสิทธิ์เข้าถึง |
| **UC20: View System Statistics** | ผู้ดูแลระบบต้องการดูสถิติระบบ | ระบบแสดงสถิติการใช้งานและประสิทธิภาพระบบ | System Administrator | UC32 (View Feedback Statistics) | ผู้ดูแลระบบ, ระบบ | เข้าสู่ระบบเป็นผู้ดูแล | 1. ผู้ดูแลเข้าถึงหน้าสถิติ<br>2. ระบบดึงข้อมูลสถิติ<br>3. ระบบแสดงกราฟและตาราง<br>4. ผู้ดูแลวิเคราะห์ข้อมูล | ไม่มีข้อมูลสถิติ |
| **UC21: Backup System Data** | ผู้ดูแลระบบต้องการสำรองข้อมูล | ระบบสร้างไฟล์สำรองข้อมูลทั้งหมด | System Administrator | - | ผู้ดูแลระบบ, ระบบ | เข้าสู่ระบบเป็นผู้ดูแล | 1. ผู้ดูแลเลือกการสำรองข้อมูล<br>2. ระบบสร้างไฟล์สำรอง<br>3. ระบบดาวน์โหลดไฟล์<br>4. ระบบยืนยันการสำรอง | ระบบไม่พร้อม, ข้อมูลเสียหาย |
| **UC22: Restore System Data** | ผู้ดูแลระบบต้องการกู้คืนข้อมูล | ระบบกู้คืนข้อมูลจากไฟล์สำรอง | System Administrator | - | ผู้ดูแลระบบ, ระบบ | มีไฟล์สำรองข้อมูล | 1. ผู้ดูแลเลือกไฟล์สำรอง<br>2. ระบบตรวจสอบไฟล์<br>3. ระบบกู้คืนข้อมูล<br>4. ระบบยืนยันการกู้คืน | ไฟล์เสียหาย, ข้อมูลไม่เข้ากัน |
| **UC23: Configure System Settings** | ผู้ดูแลระบบต้องการตั้งค่าระบบ | ระบบปรับแต่งการตั้งค่าต่างๆ ของระบบ | System Administrator | - | ผู้ดูแลระบบ, ระบบ | เข้าสู่ระบบเป็นผู้ดูแล | 1. ผู้ดูแลเข้าถึงหน้าตั้งค่า<br>2. ระบบแสดงการตั้งค่าปัจจุบัน<br>3. ผู้ดูแลแก้ไขการตั้งค่า<br>4. ระบบบันทึกการตั้งค่า | ไม่มีสิทธิ์เข้าถึง |
| **UC24: Monitor System Performance** | ผู้ดูแลระบบต้องการติดตามประสิทธิภาพ | ระบบแสดงข้อมูลประสิทธิภาพและสถานะระบบ | System Administrator | - | ผู้ดูแลระบบ, ระบบ | เข้าสู่ระบบเป็นผู้ดูแล | 1. ผู้ดูแลเข้าถึงหน้าติดตาม<br>2. ระบบดึงข้อมูลประสิทธิภาพ<br>3. ระบบแสดงกราฟและตาราง<br>4. ระบบแจ้งเตือนหากมีปัญหา | ระบบไม่พร้อมให้ข้อมูล |
| **UC25: Generate Machine ID** | ระบบสร้าง Machine ID สำหรับ Guest Mode | ระบบสร้างรหัสเฉพาะสำหรับเครื่องผู้ใช้ | Guest User, System Administrator | - | ผู้ใช้, ระบบ | ระบบพร้อมใช้งาน | 1. ระบบตรวจสอบ Machine ID ปัจจุบัน<br>2. ระบบสร้าง Machine ID ใหม่<br>3. ระบบบันทึก Machine ID<br>4. ระบบยืนยันการสร้าง | ระบบไม่พร้อมใช้งาน |
| **UC26: View Machine Info** | ผู้ใช้ต้องการดูข้อมูลเครื่อง | ระบบแสดงข้อมูล Machine ID และข้อมูลเครื่อง | Guest User, Authenticated User, System Administrator | - | ผู้ใช้, ระบบ | มี Machine ID | 1. ระบบดึงข้อมูล Machine ID<br>2. ระบบดึงข้อมูลเครื่อง<br>3. ระบบแสดงข้อมูล<br>4. ผู้ใช้ตรวจสอบข้อมูล | ไม่มี Machine ID |
| **UC27: Reset Machine ID** | ผู้ใช้ต้องการรีเซ็ต Machine ID | ระบบสร้าง Machine ID ใหม่และล้างข้อมูลเก่า | Guest User, System Administrator | UC25 (Generate Machine ID) | ผู้ใช้, ระบบ | มี Machine ID ปัจจุบัน | 1. ระบบยืนยันการรีเซ็ต<br>2. ระบบล้างข้อมูลเก่า<br>3. ระบบสร้าง Machine ID ใหม่<br>4. ระบบยืนยันการรีเซ็ต | ไม่มี Machine ID ปัจจุบัน |
| **UC28: Export Machine Data** | ผู้ใช้ต้องการส่งออกข้อมูลเครื่อง | ระบบสร้างไฟล์ข้อมูลเครื่องให้ดาวน์โหลด | Guest User, System Administrator | - | ผู้ใช้, ระบบ | มีข้อมูลในเครื่อง | 1. ผู้ใช้เลือกส่งออกข้อมูล<br>2. ระบบสร้างไฟล์ข้อมูล<br>3. ระบบให้ดาวน์โหลด<br>4. ระบบยืนยันการส่งออก | ไม่มีข้อมูลให้ส่งออก |
| **UC29: Import Machine Data** | ผู้ใช้ต้องการนำเข้าข้อมูลเครื่อง | ระบบนำเข้าข้อมูลเครื่องจากไฟล์ | Guest User, System Administrator | - | ผู้ใช้, ระบบ | มีไฟล์ข้อมูลเครื่อง | 1. ผู้ใช้เลือกไฟล์ข้อมูล<br>2. ระบบตรวจสอบไฟล์<br>3. ระบบนำเข้าข้อมูล<br>4. ระบบแสดงผลลัพธ์ | ไฟล์ไม่ถูกต้อง, ข้อมูลเสียหาย |
| **UC30: Rate Response Quality** | ผู้ใช้ให้คะแนนคุณภาพคำตอบ | ระบบรับคะแนนและบันทึกเพื่อปรับปรุงคุณภาพ | Guest User, Authenticated User, System Administrator | UC31 (Submit Feedback) | ผู้ใช้, ระบบ, LLM | ได้รับคำตอบจากแชตบอต | 1. ระบบขอคะแนนคุณภาพ<br>2. ผู้ใช้ให้คะแนน<br>3. ระบบบันทึกคะแนน<br>4. ระบบขอบคุณผู้ใช้ | ไม่ได้รับคำตอบ |
| **UC31: Submit Feedback** | ผู้ใช้ส่งข้อเสนอแนะ | ระบบรับข้อเสนอแนะและบันทึกเพื่อการปรับปรุง | Guest User, Authenticated User, System Administrator | - | ผู้ใช้, ระบบ | ผู้ใช้ต้องการส่งข้อเสนอแนะ | 1. ผู้ใช้เลือกส่งข้อเสนอแนะ<br>2. ระบบแสดงฟอร์ม<br>3. ผู้ใช้กรอกข้อเสนอแนะ<br>4. ระบบบันทึกและขอบคุณ | ข้อเสนอแนะว่างเปล่า |
| **UC32: View Feedback Statistics** | ผู้ดูแลระบบดูสถิติข้อเสนอแนะ | ระบบแสดงสถิติและรายงานข้อเสนอแนะ | System Administrator | UC20 (View System Statistics) | ผู้ดูแลระบบ, ระบบ | มีข้อเสนอแนะในระบบ | 1. ผู้ดูแลเข้าถึงหน้าสถิติ<br>2. ระบบดึงข้อมูลข้อเสนอแนะ<br>3. ระบบแสดงสถิติ<br>4. ผู้ดูแลวิเคราะห์ข้อมูล | ไม่มีข้อเสนอแนะ |
| **UC33: Create Vector Collection** | ระบบสร้าง collection ในฐานข้อมูลเวกเตอร์ | ระบบสร้าง collection ใหม่สำหรับเก็บ embeddings | System Administrator, External Systems | - | ระบบ, Vector DB | ระบบฐานข้อมูลเวกเตอร์พร้อม | 1. ระบบตรวจสอบ collection ที่มี<br>2. ระบบสร้าง collection ใหม่<br>3. ระบบยืนยันการสร้าง<br>4. ระบบบันทึกข้อมูล collection | Vector DB ไม่พร้อม |
| **UC34: Update Embeddings** | ระบบอัปเดต embeddings ในฐานข้อมูลเวกเตอร์ | ระบบปรับปรุง embeddings เมื่อมีเอกสารใหม่ | System Administrator, External Systems | - | ระบบ, Vector DB | มีเอกสารใหม่หรือเปลี่ยนแปลง | 1. ระบบตรวจสอบเอกสารใหม่<br>2. ระบบสร้าง embeddings ใหม่<br>3. ระบบอัปเดตใน Vector DB<br>4. ระบบยืนยันการอัปเดต | Vector DB ไม่พร้อม, เอกสารเสียหาย |
| **UC35: Search Similar Documents** | ระบบค้นหาเอกสารที่คล้ายกัน | ระบบใช้ embeddings ค้นหาเอกสารที่เกี่ยวข้อง | External Systems | - | ระบบ, Vector DB, LLM | มี embeddings ในฐานข้อมูล | 1. ระบบรับคำค้นหา<br>2. ระบบแปลงเป็น embedding<br>3. ระบบค้นหาใน Vector DB<br>4. ระบบส่งผลลัพธ์กลับ | ไม่มี embeddings, Vector DB ไม่พร้อม |
| **UC36: Manage Vector Database** | ระบบจัดการฐานข้อมูลเวกเตอร์ | ระบบดูแลและจัดการฐานข้อมูลเวกเตอร์ | System Administrator, External Systems | - | ระบบ, Vector DB | เข้าถึงฐานข้อมูลเวกเตอร์ได้ | 1. ระบบตรวจสอบสถานะ Vector DB<br>2. ระบบดำเนินการจัดการ<br>3. ระบบยืนยันการดำเนินการ<br>4. ระบบบันทึกล็อก | Vector DB ไม่พร้อม, ไม่มีสิทธิ์เข้าถึง |

## 📊 Use Case Diagram
graph TB
    %% Actors
    GU[Guest User]
    AU[Authenticated User]
    SA[System Administrator]
    ES[External Systems]
    
    %% Use Cases - Authentication
    UC1[Login]
    UC2[Register]
    UC3[Logout]
    UC4[Enable Guest Mode]
    UC5[Disable Guest Mode]
    
    %% Use Cases - Chat System
    UC6[Send Message]
    UC7[Receive Response]
    UC8[Create Conversation]
    UC9[View Conversation History]
    UC10[Clear Conversation History]
    UC11[Export Conversation Data]
    UC12[Import Conversation Data]
    
    %% Use Cases - Document Management
    UC13[Upload PDF Document]
    UC14[View Document List]
    UC15[Delete Document]
    UC16[Process Document Embeddings]
    UC17[Search Documents]
    UC18[View Document Details]
    
    %% Use Cases - System Management
    UC19[Manage Users]
    UC20[View System Statistics]
    UC21[Backup System Data]
    UC22[Restore System Data]
    UC23[Configure System Settings]
    UC24[Monitor System Performance]
    
    %% Use Cases - Machine Management
    UC25[Generate Machine ID]
    UC26[View Machine Info]
    UC27[Reset Machine ID]
    UC28[Export Machine Data]
    UC29[Import Machine Data]
    
    %% Use Cases - Feedback System
    UC30[Rate Response Quality]
    UC31[Submit Feedback]
    UC32[View Feedback Statistics]
    
    %% Use Cases - Vector Database
    UC33[Create Vector Collection]
    UC34[Update Embeddings]
    UC35[Search Similar Documents]
    UC36[Manage Vector Database]
    
    %% Relationships - Guest User
    GU --> UC4
    GU --> UC6
    GU --> UC7
    GU --> UC8
    GU --> UC9
    GU --> UC10
    GU --> UC11
    GU --> UC12
    GU --> UC25
    GU --> UC26
    GU --> UC27
    GU --> UC28
    GU --> UC29
    GU --> UC30
    GU --> UC31
    
    %% Relationships - Authenticated User
    AU --> UC1
    AU --> UC2
    AU --> UC3
    AU --> UC6
    AU --> UC7
    AU --> UC8
    AU --> UC9
    AU --> UC10
    AU --> UC11
    AU --> UC12
    AU --> UC13
    AU --> UC14
    AU --> UC15
    AU --> UC17
    AU --> UC18
    AU --> UC30
    AU --> UC31
    
    %% Relationships - System Administrator
    SA --> UC1
    SA --> UC2
    SA --> UC3
    SA --> UC6
    SA --> UC7
    SA --> UC8
    SA --> UC9
    SA --> UC10
    SA --> UC11
    SA --> UC12
    SA --> UC13
    SA --> UC14
    SA --> UC15
    SA --> UC16
    SA --> UC17
    SA --> UC18
    SA --> UC19
    SA --> UC20
    SA --> UC21
    SA --> UC22
    SA --> UC23
    SA --> UC24
    SA --> UC25
    SA --> UC26
    SA --> UC27
    SA --> UC28
    SA --> UC29
    SA --> UC30
    SA --> UC31
    SA --> UC32
    SA --> UC33
    SA --> UC34
    SA --> UC35
    SA --> UC36
    
    %% Relationships - External Systems
    ES --> UC7
    ES --> UC16
    ES --> UC35
    ES --> UC36
    
    %% Include Relationships
    UC6 -.-> UC7
    UC8 -.-> UC9
    UC13 -.-> UC16
    UC16 -.-> UC35
    UC7 -.-> UC30
    UC30 -.-> UC31
    
    %% Extend Relationships
    UC4 -.-> UC25
    UC1 -.-> UC26
    UC15 -.-> UC34
    UC32 -.-> UC20
    
    %% Generalization
    GU -.-> AU
    AU -.-> SA
```

## 📋 รายละเอียด Use Cases

### 🔐 Authentication Use Cases

#### UC1: Login
- **Actor**: Authenticated User, System Administrator
- **Description**: ผู้ใช้เข้าสู่ระบบด้วย username และ password
- **Preconditions**: ผู้ใช้ต้องมีบัญชีในระบบ
- **Postconditions**: ผู้ใช้เข้าสู่ระบบสำเร็จและสามารถใช้งานฟีเจอร์ได้

#### UC2: Register
- **Actor**: Authenticated User, System Administrator
- **Description**: ผู้ใช้สร้างบัญชีใหม่ในระบบ
- **Preconditions**: ผู้ใช้ยังไม่มีบัญชีในระบบ
- **Postconditions**: บัญชีใหม่ถูกสร้างและผู้ใช้สามารถเข้าสู่ระบบได้

#### UC3: Logout
- **Actor**: Authenticated User, System Administrator
- **Description**: ผู้ใช้ออกจากระบบ
- **Preconditions**: ผู้ใช้เข้าสู่ระบบอยู่
- **Postconditions**: ผู้ใช้ออกจากระบบและไม่สามารถเข้าถึงฟีเจอร์ที่ต้อง authentication

#### UC4: Enable Guest Mode
- **Actor**: Guest User
- **Description**: เปิดใช้งานโหมดผู้เยี่ยมชม
- **Preconditions**: ผู้ใช้ยังไม่ได้เข้าสู่ระบบ
- **Postconditions**: ผู้ใช้สามารถใช้งานระบบได้โดยไม่ต้องเข้าสู่ระบบ

#### UC5: Disable Guest Mode
- **Actor**: Guest User
- **Description**: ปิดใช้งานโหมดผู้เยี่ยมชม
- **Preconditions**: ผู้ใช้อยู่ในโหมดผู้เยี่ยมชม
- **Postconditions**: ผู้ใช้ต้องเข้าสู่ระบบเพื่อใช้งานต่อ

### 💬 Chat System Use Cases

#### UC6: Send Message
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ส่งข้อความไปยังแชตบอต
- **Preconditions**: ผู้ใช้อยู่ในหน้าแชต
- **Postconditions**: ข้อความถูกส่งและรอการตอบกลับ

#### UC7: Receive Response
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: รับคำตอบจากแชตบอต
- **Preconditions**: ข้อความถูกส่งไปยังแชตบอต
- **Postconditions**: คำตอบถูกแสดงและสามารถให้คะแนนได้

#### UC8: Create Conversation
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: สร้างการสนทนาใหม่
- **Preconditions**: ผู้ใช้อยู่ในหน้าแชต
- **Postconditions**: การสนทนาใหม่ถูกสร้างและพร้อมใช้งาน

#### UC9: View Conversation History
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ดูประวัติการสนทนา
- **Preconditions**: มีการสนทนาในระบบ
- **Postconditions**: ประวัติการสนทนาถูกแสดง

#### UC10: Clear Conversation History
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ล้างประวัติการสนทนา
- **Preconditions**: มีประวัติการสนทนา
- **Postconditions**: ประวัติการสนทนาถูกลบ

#### UC11: Export Conversation Data
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ส่งออกข้อมูลการสนทนา
- **Preconditions**: มีข้อมูลการสนทนา
- **Postconditions**: ไฟล์ข้อมูลการสนทนาถูกดาวน์โหลด

#### UC12: Import Conversation Data
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: นำเข้าข้อมูลการสนทนา
- **Preconditions**: มีไฟล์ข้อมูลการสนทนา
- **Postconditions**: ข้อมูลการสนทนาถูกนำเข้าและแสดง

### 📄 Document Management Use Cases

#### UC13: Upload PDF Document
- **Actor**: Authenticated User, System Administrator
- **Description**: อัปโหลดเอกสาร PDF
- **Preconditions**: มีไฟล์ PDF ที่ต้องการอัปโหลด
- **Postconditions**: เอกสารถูกอัปโหลดและประมวลผล

#### UC14: View Document List
- **Actor**: Authenticated User, System Administrator
- **Description**: ดูรายการเอกสารทั้งหมด
- **Preconditions**: มีเอกสารในระบบ
- **Postconditions**: รายการเอกสารถูกแสดง

#### UC15: Delete Document
- **Actor**: Authenticated User, System Administrator
- **Description**: ลบเอกสารจากระบบ
- **Preconditions**: มีเอกสารในระบบ
- **Postconditions**: เอกสารถูกลบและ embeddings ถูกอัปเดต

#### UC16: Process Document Embeddings
- **Actor**: System Administrator, External Systems
- **Description**: ประมวลผลเอกสารเพื่อสร้าง embeddings
- **Preconditions**: มีเอกสารใหม่ที่อัปโหลด
- **Postconditions**: embeddings ถูกสร้างและเก็บในฐานข้อมูลเวกเตอร์

#### UC17: Search Documents
- **Actor**: Authenticated User, System Administrator
- **Description**: ค้นหาเอกสารในระบบ
- **Preconditions**: มีเอกสารในระบบ
- **Postconditions**: ผลการค้นหาเอกสารถูกแสดง

#### UC18: View Document Details
- **Actor**: Authenticated User, System Administrator
- **Description**: ดูรายละเอียดเอกสาร
- **Preconditions**: มีเอกสารในระบบ
- **Postconditions**: รายละเอียดเอกสารถูกแสดง

### ⚙️ System Management Use Cases

#### UC19: Manage Users
- **Actor**: System Administrator
- **Description**: จัดการผู้ใช้ในระบบ
- **Preconditions**: ผู้ดูแลระบบเข้าสู่ระบบ
- **Postconditions**: การจัดการผู้ใช้สำเร็จ

#### UC20: View System Statistics
- **Actor**: System Administrator
- **Description**: ดูสถิติระบบ
- **Preconditions**: ผู้ดูแลระบบเข้าสู่ระบบ
- **Postconditions**: สถิติระบบถูกแสดง

#### UC21: Backup System Data
- **Actor**: System Administrator
- **Description**: สำรองข้อมูลระบบ
- **Preconditions**: ผู้ดูแลระบบเข้าสู่ระบบ
- **Postconditions**: ข้อมูลระบบถูกสำรอง

#### UC22: Restore System Data
- **Actor**: System Administrator
- **Description**: กู้คืนข้อมูลระบบ
- **Preconditions**: มีไฟล์สำรองข้อมูล
- **Postconditions**: ข้อมูลระบบถูกกู้คืน

#### UC23: Configure System Settings
- **Actor**: System Administrator
- **Description**: ตั้งค่าระบบ
- **Preconditions**: ผู้ดูแลระบบเข้าสู่ระบบ
- **Postconditions**: การตั้งค่าระบบถูกบันทึก

#### UC24: Monitor System Performance
- **Actor**: System Administrator
- **Description**: ติดตามประสิทธิภาพระบบ
- **Preconditions**: ผู้ดูแลระบบเข้าสู่ระบบ
- **Postconditions**: ข้อมูลประสิทธิภาพระบบถูกแสดง

### 🖥️ Machine Management Use Cases

#### UC25: Generate Machine ID
- **Actor**: Guest User, System Administrator
- **Description**: สร้าง Machine ID ใหม่
- **Preconditions**: ระบบพร้อมใช้งาน
- **Postconditions**: Machine ID ใหม่ถูกสร้างและเก็บ

#### UC26: View Machine Info
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ดูข้อมูลเครื่อง
- **Preconditions**: มี Machine ID
- **Postconditions**: ข้อมูลเครื่องถูกแสดง

#### UC27: Reset Machine ID
- **Actor**: Guest User, System Administrator
- **Description**: รีเซ็ต Machine ID
- **Preconditions**: มี Machine ID ปัจจุบัน
- **Postconditions**: Machine ID ใหม่ถูกสร้างและไม่สามารถเข้าถึงข้อมูลเก่าได้

#### UC28: Export Machine Data
- **Actor**: Guest User, System Administrator
- **Description**: ส่งออกข้อมูลเครื่อง
- **Preconditions**: มีข้อมูลในเครื่อง
- **Postconditions**: ไฟล์ข้อมูลเครื่องถูกดาวน์โหลด

#### UC29: Import Machine Data
- **Actor**: Guest User, System Administrator
- **Description**: นำเข้าข้อมูลเครื่อง
- **Preconditions**: มีไฟล์ข้อมูลเครื่อง
- **Postconditions**: ข้อมูลเครื่องถูกนำเข้าและแสดง

### 📝 Feedback System Use Cases

#### UC30: Rate Response Quality
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ให้คะแนนคุณภาพคำตอบ
- **Preconditions**: ได้รับคำตอบจากแชตบอต
- **Postconditions**: คะแนนถูกบันทึกและส่งไปยังระบบ

#### UC31: Submit Feedback
- **Actor**: Guest User, Authenticated User, System Administrator
- **Description**: ส่งข้อเสนอแนะ
- **Preconditions**: ผู้ใช้ต้องการส่งข้อเสนอแนะ
- **Postconditions**: ข้อเสนอแนะถูกส่งและบันทึก

#### UC32: View Feedback Statistics
- **Actor**: System Administrator
- **Description**: ดูสถิติข้อเสนอแนะ
- **Preconditions**: มีข้อเสนอแนะในระบบ
- **Postconditions**: สถิติข้อเสนอแนะถูกแสดง

### 🗄️ Vector Database Use Cases

#### UC33: Create Vector Collection
- **Actor**: System Administrator, External Systems
- **Description**: สร้าง collection ในฐานข้อมูลเวกเตอร์             
- **Preconditions**: ระบบฐานข้อมูลเวกเตอร์พร้อมใช้งาน
- **Postconditions**: Collection ใหม่ถูกสร้าง

#### UC34: Update Embeddings
- **Actor**: System Administrator, External Systems
- **Description**: อัปเดต embeddings ในฐานข้อมูลเวกเตอร์
- **Preconditions**: มีเอกสารใหม่หรือเปลี่ยนแปลง
- **Postconditions**: Embeddings ถูกอัปเดต

#### UC35: Search Similar Documents
- **Actor**: External Systems
- **Description**: ค้นหาเอกสารที่คล้ายกัน
- **Preconditions**: มี embeddings ในฐานข้อมูล
- **Postconditions**: เอกสารที่คล้ายกันถูกส่งกลับ

#### UC36: Manage Vector Database
- **Actor**: System Administrator, External Systems
- **Description**: จัดการฐานข้อมูลเวกเตอร์
- **Preconditions**: เข้าถึงฐานข้อมูลเวกเตอร์ได้
- **Postconditions**: การจัดการฐานข้อมูลเวกเตอร์สำเร็จ

## 🔗 ความสัมพันธ์ระหว่าง Use Cases

### Include Relationships (ความสัมพันธ์แบบรวม)
- **UC6 includes UC7**: การส่งข้อความรวมการรับคำตอบ
- **UC8 includes UC9**: การสร้างการสนทนารวมการดูประวัติ
- **UC13 includes UC16**: การอัปโหลดเอกสารรวมการประมวลผล embeddings
- **UC16 includes UC35**: การประมวลผล embeddings รวมการค้นหาเอกสารที่คล้ายกัน
- **UC7 includes UC30**: การรับคำตอบรวมการให้คะแนน
- **UC30 includes UC31**: การให้คะแนนรวมการส่งข้อเสนอแนะ

### Extend Relationships (ความสัมพันธ์แบบขยาย)
- **UC4 extends UC25**: การเปิด Guest Mode ขยายด้วยการสร้าง Machine ID
- **UC1 extends UC26**: การเข้าสู่ระบบขยายด้วยการดูข้อมูลเครื่อง
- **UC15 extends UC34**: การลบเอกสารขยายด้วยการอัปเดต embeddings
- **UC32 extends UC20**: การดูสถิติข้อเสนอแนะขยายด้วยการดูสถิติระบบ

### Generalization Relationships (ความสัมพันธ์แบบทั่วไป)
- **Guest User generalizes to Authenticated User**: ผู้ใช้ทั่วไปเป็นส่วนหนึ่งของผู้ใช้ที่เข้าสู่ระบบ
- **Authenticated User generalizes to System Administrator**: ผู้ใช้ที่เข้าสู่ระบบเป็นส่วนหนึ่งของผู้ดูแลระบบ

## 📊 สรุปการวิเคราะห์

### 🎯 กลุ่ม Use Cases หลัก
1. **Authentication Group**: การยืนยันตัวตนและการจัดการผู้ใช้
2. **Chat System Group**: ระบบแชตและการสนทนา
3. **Document Management Group**: การจัดการเอกสารและ embeddings
4. **System Management Group**: การจัดการระบบและการติดตาม
5. **Machine Management Group**: การจัดการข้อมูลตามเครื่อง
6. **Feedback System Group**: ระบบข้อเสนอแนะและการประเมิน
7. **Vector Database Group**: การจัดการฐานข้อมูลเวกเตอร์

### 🔍 จุดเด่นของระบบ
- **Flexibility**: รองรับทั้ง Guest Mode และ Authenticated Mode
- **Scalability**: ใช้ฐานข้อมูลเวกเตอร์สำหรับการค้นหาข้อมูล
- **User Experience**: ระบบที่ใช้งานง่ายและมีฟีเจอร์ครบถ้วน
- **Security**: การแยกข้อมูลตามเครื่องและการจัดการสิทธิ์
- **Feedback Loop**: ระบบรับข้อเสนอแนะเพื่อปรับปรุงคุณภาพ

### 📈 การพัฒนาต่อ
- การเพิ่มฟีเจอร์การวิเคราะห์ข้อมูล
- การปรับปรุงประสิทธิภาพการค้นหา
- การเพิ่มการรองรับเอกสารประเภทอื่น
- การพัฒนาระบบการแจ้งเตือน
- การเพิ่มฟีเจอร์การทำงานร่วมกัน

---

*เอกสารนี้เป็นการวิเคราะห์ระบบ LannaFinChat โดยใช้ Use Case Diagram เพื่อแสดงความสัมพันธ์ระหว่างผู้ใช้และฟังก์ชันการทำงานของระบบ ซึ่งจะช่วยในการพัฒนาและปรับปรุงระบบต่อไป* 