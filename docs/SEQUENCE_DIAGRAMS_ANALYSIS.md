# การวิเคราะห์ระบบ LannaFinChat ด้วย Sequence Diagrams

## ภาพรวม (Overview)

เอกสารนี้เป็นการวิเคราะห์ระบบ LannaFinChat โดยใช้ Sequence Diagrams เพื่อแสดงลำดับการทำงานและการสื่อสารระหว่างส่วนประกอบต่างๆ ของระบบ ตาม Use Cases ที่วิเคราะห์ไว้

## 📋 ตารางอธิบาย Sequence Diagrams ภาษาไทย

| กลุ่ม Use Case | Use Case ID | ชื่อ Use Case | คำอธิบายลำดับการทำงาน | ผู้เข้าร่วม (Participants) | จุดสำคัญ |
|----------------|-------------|---------------|------------------------|----------------------------|----------|
| **Authentication** | UC1 | Login | 1. ผู้ใช้เข้าสู่หน้า Login<br/>2. ป้อน email และ password<br/>3. Frontend ส่งข้อมูลไป Auth Service<br/>4. Auth Service ตรวจสอบกับ Database<br/>5. หากถูกต้อง สร้าง session และส่ง token กลับ<br/>6. หากผิด แสดงข้อความผิดพลาด | User, Frontend, Auth Service, Database, Session Store | การตรวจสอบ credentials และการจัดการ session |
| **Authentication** | UC2 | Register | 1. ผู้ใช้เข้าสู่หน้า Register<br/>2. กรอกข้อมูลส่วนตัว<br/>3. Frontend ส่งข้อมูลไป Auth Service<br/>4. Auth Service ตรวจสอบ email ซ้ำ<br/>5. หากไม่ซ้ำ บันทึกข้อมูลและส่งอีเมลยืนยัน<br/>6. หากซ้ำ แสดงข้อความ "อีเมลนี้มีอยู่แล้ว" | User, Frontend, Auth Service, Database, Email Service | การตรวจสอบ email ซ้ำและการส่งอีเมลยืนยัน |
| **Authentication** | UC3 | Logout | 1. ผู้ใช้คลิกปุ่ม Logout<br/>2. Frontend ส่งคำขอไป Auth Service<br/>3. Auth Service ลบ session<br/>4. Frontend ล้าง local storage<br/>5. พาผู้ใช้ไปหน้าเริ่มต้น | User, Frontend, Auth Service, Session Store | การล้าง session และ local storage |
| **Authentication** | UC4 | Enable Guest Mode | 1. ผู้ใช้เลือก "ใช้งานโดยไม่ต้องเข้าสู่ระบบ"<br/>2. Frontend ขอ Machine ID จาก Machine Service<br/>3. Machine Service สร้าง Machine ID ใหม่<br/>4. บันทึก Machine ID ใน Local Storage<br/>5. เข้าสู่โหมด Guest | Guest User, Frontend, Machine Service, Local Storage | การสร้างและจัดเก็บ Machine ID |
| **Authentication** | UC5 | Disable Guest Mode | 1. ผู้ใช้เลือก "ปิด Guest Mode"<br/>2. Frontend ล้างข้อมูลชั่วคราว<br/>3. รีเซ็ตสถานะแอป<br/>4. กลับไปหน้าเริ่มต้น | Guest User, Frontend, Local Storage | การล้างข้อมูลชั่วคราวและรีเซ็ตสถานะ |
| **Chat System** | UC6-UC7 | Send Message & Receive Response | 1. ผู้ใช้พิมพ์ข้อความ<br/>2. Frontend ส่งไป Chat Service<br/>3. Chat Service บันทึกข้อความ<br/>4. ส่งข้อความไป OpenAI API<br/>5. OpenAI ประมวลผลและส่งคำตอบ<br/>6. Chat Service บันทึกคำตอบ<br/>7. แสดงคำตอบและปุ่มให้คะแนน | User, Frontend, Chat Service, OpenAI API, Database | การสื่อสารกับ AI และการบันทึกข้อมูล |
| **Chat System** | UC8 | Create Conversation | 1. ผู้ใช้คลิก "เริ่มการสนทนาใหม่"<br/>2. Frontend ส่งคำขอไป Chat Service<br/>3. Chat Service สร้าง conversation ใหม่<br/>4. Database ส่ง conversation ID กลับ<br/>5. อัปเดต UI และแสดงหน้าสนทนา | User, Frontend, Chat Service, Database | การสร้าง conversation session ใหม่ |
| **Chat System** | UC9 | View Conversation History | 1. ผู้ใช้คลิก "ประวัติการสนทนา"<br/>2. Frontend ขอรายการ conversations<br/>3. Chat Service ดึงข้อมูลจาก Database<br/>4. แสดงรายการให้ผู้ใช้เลือก<br/>5. เมื่อเลือกแล้ว ดึงข้อความในการสนทนานั้น | User, Frontend, Chat Service, Database | การดึงและแสดงประวัติการสนทนา |
| **Chat System** | UC10 | Clear Conversation History | 1. ผู้ใช้คลิก "ล้างประวัติ"<br/>2. แสดงข้อความยืนยัน<br/>3. ผู้ใช้ยืนยันการลบ<br/>4. Chat Service ลบข้อมูลจาก Database<br/>5. อัปเดต UI และแสดงข้อความสำเร็จ | User, Frontend, Chat Service, Database | การยืนยันและลบข้อมูลอย่างปลอดภัย |
| **Chat System** | UC11 | Export Conversation Data | 1. ผู้ใช้คลิก "ส่งออกข้อมูล"<br/>2. Chat Service ดึงข้อมูลทั้งหมด<br/>3. สร้างไฟล์ JSON/CSV<br/>4. ส่ง download link ให้ผู้ใช้<br/>5. เริ่มดาวน์โหลดไฟล์ | User, Frontend, Chat Service, Database, File System | การสร้างไฟล์ export และ download |
| **Chat System** | UC12 | Import Conversation Data | 1. ผู้ใช้เลือกไฟล์ข้อมูล<br/>2. Chat Service ตรวจสอบรูปแบบไฟล์<br/>3. หากถูกต้อง นำเข้าข้อมูลและอัปเดต UI<br/>4. หากผิด แสดงข้อความผิดพลาด | User, Frontend, Chat Service, Database | การตรวจสอบไฟล์และนำเข้าข้อมูล |
| **Document Management** | UC13 | Upload PDF Document | 1. ผู้ใช้เลือกไฟล์ PDF<br/>2. Document Service ตรวจสอบรูปแบบ<br/>3. บันทึกไฟล์ใน File System<br/>4. Vector Service ประมวลผลเอกสาร<br/>5. แยกข้อความและสร้าง embeddings<br/>6. บันทึก embeddings ใน Qdrant DB | User, Frontend, Document Service, File System, Vector Service, Qdrant DB | การประมวลผลเอกสารและสร้าง embeddings |
| **Document Management** | UC14 | View Document List | 1. ผู้ใช้คลิก "เอกสารของฉัน"<br/>2. Document Service ดึงรายการจาก Database<br/>3. แสดงรายการเอกสารพร้อมรายละเอียด | User, Frontend, Document Service, Database | การดึงและแสดงรายการเอกสาร |
| **Document Management** | UC15 | Delete Document | 1. ผู้ใช้เลือกเอกสารและคลิก "ลบ"<br/>2. แสดงข้อความยืนยัน<br/>3. Document Service ลบ embeddings จาก Qdrant<br/>4. ลบไฟล์จาก File System<br/>5. ลบข้อมูลจาก Database | User, Frontend, Document Service, Database, File System, Qdrant DB | การลบข้อมูลจากหลายแหล่งอย่างสอดคล้อง |
| **Document Management** | UC16 | Process Document Embeddings | 1. Document Service ส่งเอกสารไป Vector Service<br/>2. แยกข้อความจาก PDF<br/>3. แบ่งข้อความเป็น chunks<br/>4. สร้าง embedding สำหรับแต่ละ chunk<br/>5. บันทึกใน Qdrant DB และอัปเดตสถานะ | Document Service, Vector Service, OpenAI API, Qdrant DB, Database | การประมวลผลและสร้าง embeddings แบบ batch |
| **Document Management** | UC17 | Search Documents | 1. ผู้ใช้ป้อนคำค้นหา<br/>2. Vector Service แปลงเป็น embedding<br/>3. ค้นหา similar vectors ใน Qdrant<br/>4. ส่งผลการค้นหากลับ<br/>5. แสดงเอกสารที่ตรงกับคำค้นหา | User, Frontend, Document Service, Vector Service, Qdrant DB | การค้นหาด้วย vector similarity |
| **Document Management** | UC18 | View Document Details | 1. ผู้ใช้คลิกเลือกเอกสาร<br/>2. Document Service ดึงข้อมูลจาก Database<br/>3. ดึงเนื้อหาจาก File System<br/>4. แสดงรายละเอียดและเนื้อหาเอกสาร | User, Frontend, Document Service, Database, File System | การดึงและแสดงรายละเอียดเอกสาร |
| **System Management** | UC19 | Manage Users | 1. Admin เข้าสู่หน้าจัดการผู้ใช้<br/>2. System Service ดึงรายการผู้ใช้<br/>3. Admin เลือกการดำเนินการ (เพิ่ม/แก้ไข/ลบ)<br/>4. ดำเนินการกับ Database<br/>5. แสดงข้อความสำเร็จ | Admin, Frontend, System Service, Database | การจัดการผู้ใช้แบบ CRUD |
| **System Management** | UC20 | View System Statistics | 1. Admin เข้าสู่หน้าสถิติ<br/>2. System Service ดึงข้อมูลการใช้งาน<br/>3. ดึงข้อมูลประสิทธิภาพจาก Monitoring Service<br/>4. รวบรวมและประมวลผลข้อมูล<br/>5. แสดงกราฟและตาราง | Admin, Frontend, System Service, Database, Monitoring Service | การรวบรวมและแสดงสถิติระบบ |
| **System Management** | UC21 | Backup System Data | 1. Admin คลิก "สำรองข้อมูล"<br/>2. System Service ดึงข้อมูลทั้งหมด<br/>3. สร้างไฟล์สำรองใน File System<br/>4. ส่ง download link<br/>5. เริ่มดาวน์โหลดไฟล์สำรอง | Admin, Frontend, System Service, Database, File System | การสำรองข้อมูลและ download |
| **System Management** | UC22 | Restore System Data | 1. Admin เลือกไฟล์สำรอง<br/>2. System Service ตรวจสอบไฟล์<br/>3. หากถูกต้อง กู้คืนข้อมูลและรีสตาร์ทระบบ<br/>4. หากผิด แสดงข้อความผิดพลาด | Admin, Frontend, System Service, Database | การกู้คืนข้อมูลและรีสตาร์ทระบบ |
| **System Management** | UC23 | Configure System Settings | 1. Admin เข้าสู่หน้าตั้งค่า<br/>2. ดึงการตั้งค่าปัจจุบัน<br/>3. Admin แก้ไขการตั้งค่า<br/>4. บันทึกและใช้การตั้งค่าใหม่<br/>5. แสดงข้อความสำเร็จ | Admin, Frontend, System Service, Config Store | การจัดการการตั้งค่าระบบ |
| **System Management** | UC24 | Monitor System Performance | 1. Admin เข้าสู่หน้าติดตาม<br/>2. ดึงข้อมูลประสิทธิภาพ<br/>3. วิเคราะห์และตรวจสอบ threshold<br/>4. หากพบปัญหา สร้างการแจ้งเตือน<br/>5. แสดงข้อมูลพร้อมสถานะ | Admin, Frontend, System Service, Monitoring Service, Database | การติดตามและแจ้งเตือนประสิทธิภาพ |
| **Machine Management** | UC25 | Generate Machine ID | 1. System ขอสร้าง Machine ID<br/>2. Machine Service สร้าง unique ID<br/>3. บันทึกลงไฟล์และ Local Storage<br/>4. ส่ง Machine ID กลับ | System, Machine Service, Local Storage, File System | การสร้างและจัดเก็บ Machine ID |
| **Machine Management** | UC26 | View Machine Info | 1. ผู้ใช้คลิก "ข้อมูลเครื่อง"<br/>2. ดึง Machine ID จาก Local Storage<br/>3. อ่านข้อมูลจากไฟล์<br/>4. รวบรวมและแสดงข้อมูลเครื่อง | User, Frontend, Machine Service, Local Storage, File System | การดึงและแสดงข้อมูลเครื่อง |
| **Machine Management** | UC27 | Reset Machine ID | 1. ผู้ใช้คลิก "รีเซ็ต Machine ID"<br/>2. ยืนยันการรีเซ็ต<br/>3. ล้างข้อมูลเก่าและสร้าง ID ใหม่<br/>4. บันทึกและแสดงข้อความสำเร็จ | User, Frontend, Machine Service, Local Storage, File System | การรีเซ็ตและสร้าง Machine ID ใหม่ |
| **Machine Management** | UC28 | Export Machine Data | 1. ผู้ใช้คลิก "ส่งออกข้อมูลเครื่อง"<br/>2. ดึงข้อมูลจาก Local Storage และไฟล์<br/>3. รวบรวมและสร้างไฟล์ export<br/>4. ส่ง download link<br/>5. เริ่มดาวน์โหลด | User, Frontend, Machine Service, Local Storage, File System | การส่งออกข้อมูลเครื่อง |
| **Machine Management** | UC29 | Import Machine Data | 1. ผู้ใช้เลือกไฟล์ข้อมูลเครื่อง<br/>2. ตรวจสอบรูปแบบไฟล์<br/>3. หากถูกต้อง นำเข้าข้อมูลและบันทึก<br/>4. หากผิด แสดงข้อความผิดพลาด | User, Frontend, Machine Service, Local Storage, File System | การนำเข้าข้อมูลเครื่อง |
| **Feedback System** | UC30 | Rate Response Quality | 1. ผู้ใช้ให้คะแนนคำตอบ (1-5 ดาว)<br/>2. Frontend ส่งไป Feedback Service<br/>3. บันทึกคะแนนและ context<br/>4. แสดงข้อความขอบคุณ | User, Frontend, Feedback Service, Database | การให้คะแนนและบันทึกข้อมูล |
| **Feedback System** | UC31 | Submit Feedback | 1. ผู้ใช้คลิก "ส่งข้อเสนอแนะ"<br/>2. แสดงฟอร์มข้อเสนอแนะ<br/>3. ผู้ใช้กรอกข้อเสนอแนะ<br/>4. บันทึกและแสดงข้อความขอบคุณ | User, Frontend, Feedback Service, Database | การส่งข้อเสนอแนะ |
| **Feedback System** | UC32 | View Feedback Statistics | 1. Admin เข้าสู่หน้าสถิติข้อเสนอแนะ<br/>2. ดึงข้อมูลคะแนนและข้อเสนอแนะ<br/>3. วิเคราะห์และสร้างสถิติ<br/>4. แสดงกราฟและรายงาน | Admin, Frontend, Feedback Service, Database | การวิเคราะห์และแสดงสถิติข้อเสนอแนะ |
| **Vector Database** | UC33 | Create Vector Collection | 1. System ขอสร้าง collection ใหม่<br/>2. Vector Service สร้าง collection ใน Qdrant<br/>3. ตั้งค่า schema และ parameters<br/>4. บันทึกข้อมูล collection | System, Vector Service, Qdrant DB | การสร้างและตั้งค่า vector collection |
| **Vector Database** | UC34 | Update Embeddings | 1. System ขอ update embeddings<br/>2. ตรวจสอบเอกสารที่เปลี่ยนแปลง<br/>3. สร้าง embedding ใหม่สำหรับแต่ละเอกสาร<br/>4. อัปเดตใน Qdrant และล้าง embeddings เก่า | System, Vector Service, OpenAI API, Qdrant DB | การอัปเดตและจัดการ embeddings |
| **Vector Database** | UC35 | Search Similar Documents | 1. Chat Service ขอค้นหาเอกสารที่เกี่ยวข้อง<br/>2. แปลงคำค้นหาเป็น embedding<br/>3. ค้นหา similar vectors และคำนวณ similarity<br/>4. จัดเรียงและส่งผลการค้นหา | Chat Service, Vector Service, OpenAI API, Qdrant DB | การค้นหาด้วย vector similarity |
| **Vector Database** | UC36 | Manage Vector Database | 1. Admin เข้าสู่การจัดการ Vector DB<br/>2. ตรวจสอบสถานะ collections<br/>3. Admin เลือกการดำเนินการ<br/>4. ดำเนินการ (สร้าง/ลบ/optimize)<br/>5. แสดงข้อความสำเร็จ | Admin, System Service, Vector Service, Qdrant DB | การจัดการ vector database |

## 🔍 จุดสำคัญของแต่ละกลุ่ม

### 🔐 Authentication Group
- **การจัดการ Session**: ระบบใช้ session store เพื่อจัดการการเข้าสู่ระบบ
- **Guest Mode**: สร้าง Machine ID เพื่อแยกแยะผู้ใช้แต่ละเครื่อง
- **Security**: มีการตรวจสอบ credentials และการล้างข้อมูลอย่างปลอดภัย

### 💬 Chat System Group
- **AI Integration**: การสื่อสารกับ OpenAI API เพื่อประมวลผลข้อความ
- **Data Persistence**: บันทึกข้อมูลการสนทนาอย่างสมบูรณ์
- **Import/Export**: รองรับการนำเข้าและส่งออกข้อมูลการสนทนา

### 📄 Document Management Group
- **Vector Processing**: การประมวลผลเอกสารเป็น embeddings
- **Multi-step Operations**: การอัปโหลดและลบเอกสารต้องจัดการหลายระบบ
- **Search Functionality**: การค้นหาด้วย vector similarity

### ⚙️ System Management Group
- **Admin Operations**: การจัดการระบบโดยผู้ดูแลระบบ
- **Monitoring**: การติดตามประสิทธิภาพและสร้างการแจ้งเตือน
- **Backup/Restore**: การสำรองและกู้คืนข้อมูลระบบ

### 🖥️ Machine Management Group
- **Local Storage Management**: การจัดการข้อมูลใน browser และไฟล์
- **Unique Identification**: การสร้างและจัดการ Machine ID
- **Data Portability**: การนำเข้าและส่งออกข้อมูลเครื่อง

### 📝 Feedback System Group
- **Quality Assessment**: การให้คะแนนและรับข้อเสนอแนะ
- **Analytics**: การวิเคราะห์และสร้างสถิติ
- **Continuous Improvement**: ลูปการปรับปรุงระบบ

### 🗄️ Vector Database Group
- **Vector Operations**: การจัดการ vector embeddings
- **Similarity Search**: การค้นหาความคล้ายกัน
- **Performance Optimization**: การ optimize ประสิทธิภาพ

## 📊 ลักษณะการสื่อสารระหว่างระบบ

### 🔄 แบบ Synchronous
- การเข้าสู่ระบบ (Login)
- การอัปโหลดเอกสาร
- การค้นหาข้อมูล

### ⚡ แบบ Asynchronous
- การประมวลผล embeddings
- การสำรองข้อมูล
- การส่งอีเมลยืนยัน

### 🔁 แบบ Batch Processing
- การอัปเดต embeddings
- การส่งออกข้อมูล
- การวิเคราะห์สถิติ

## 🎯 ข้อสังเกตสำคัญ

1. **Error Handling**: ทุก sequence มีการจัดการข้อผิดพลาดอย่างชัดเจน
2. **Data Consistency**: การลบข้อมูลจะดำเนินการในหลายระบบอย่างสอดคล้อง
3. **User Experience**: มีการแสดงข้อความยืนยันและสถานะการทำงาน
4. **Security**: การตรวจสอบสิทธิ์และการล้างข้อมูลอย่างเหมาะสม
5. **Scalability**: การแยกส่วนประกอบทำให้ระบบสามารถขยายได้

---

*เอกสารนี้แสดงลำดับการทำงานของระบบ LannaFinChat ในรูปแบบ Sequence Diagrams เพื่อให้เข้าใจการสื่อสารและการทำงานร่วมกันของส่วนประกอบต่างๆ ในระบบ*
