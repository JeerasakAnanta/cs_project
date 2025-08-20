# ขอบเขตของโครงงาน LannaFinChat

## ภาพรวมโครงการ (Project Overview)

**LannaFinChat** เป็นระบบแชตบอตอัจฉริยะสำหรับตอบคำถามจากเอกสาร โดยใช้เทคนิค RAG (Retrieval Augmented Generation) และ LLM (Large Language Models) พัฒนาขึ้นเพื่อเป็นส่วนหนึ่งของโครงงานระดับปริญญาตรี สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา (RMUTL)

## 🎯 วัตถุประสงค์หลัก (Main Objectives)

1. **พัฒนาระบบแชตบอตอัจฉริยะ** สำหรับตอบคำถามจากเอกสารคู่มือปฏิบัติงานการเบิกจ่ายค่าใช้จ่ายของ มทร.ล้านนา
2. **สร้างระบบจัดการเอกสาร** ที่สามารถประมวลผลและจัดทำดัชนีเอกสาร PDF
3. **พัฒนาเว็บอินเทอร์เฟซ** ที่ใช้งานง่ายสำหรับการโต้ตอบกับแชตบอต
4. **สร้างระบบ API** ที่รองรับการใช้งานผ่าน FastAPI และ Swagger
5. **พัฒนาระบบฐานข้อมูลเวกเตอร์** ด้วย Qdrant สำหรับการค้นหาข้อมูลที่เกี่ยวข้อง

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

### ระบบหลัก (Core Systems)

#### 1. **Frontend Web Application**
- **เทคโนโลยี**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS
- **คุณสมบัติ**:
  - หน้าแชตหลัก (`/`)
  - รายการเอกสาร (`/pdflist`)
  - จัดการเอกสาร (`/management`)
  - อัปโหลด PDF (`/upload`)
  - ข้อมูลเกี่ยวกับระบบ (`/about`)

#### 2. **Backend API Services**
- **Chat API** (Port 8003)
  - FastAPI-based chatbot service
  - OpenAI GPT-4o-mini integration
  - RAG implementation with LangChain
  - Conversation history management

- **PDF Management API** (Port 8004)
  - PDF upload and processing
  - Document embedding generation
  - Vector database management
  - File management operations

#### 3. **Vector Database**
- **Qdrant Vector Database** (Port 6333)
  - Document embeddings storage
  - Similarity search functionality
  - Collection management

#### 4. **Database System**
- **PostgreSQL** สำหรับเก็บข้อมูลผู้ใช้และประวัติการสนทนา
- **Alembic** สำหรับ database migration

## 🔧 เทคโนโลยีที่ใช้ (Technologies Used)

### Frontend Technologies
- **React 18** - UI Framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing

### Backend Technologies
- **FastAPI** - Web framework
- **Python 3.12.3** - Programming language
- **LangChain** - LLM framework
- **OpenAI API** - LLM service (GPT-4o-mini)
- **Uvicorn** - ASGI server

### Database & Storage
- **PostgreSQL** - Relational database
- **Qdrant** - Vector database
- **Alembic** - Database migration

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy

## 🌟 คุณสมบัติหลัก (Core Features)

### 1. **ระบบแชตบอตอัจฉริยะ**
- การตอบคำถามจากเอกสารด้วย RAG
- การจัดการประวัติการสนทนา
- การสร้างการสนทนาใหม่
- การล้างประวัติการสนทนา

### 2. **ระบบจัดการเอกสาร**
- อัปโหลดไฟล์ PDF
- การประมวลผลเอกสาร
- การสร้าง embeddings
- การจัดการไฟล์ในระบบ

### 3. **ระบบผู้ใช้**
- **Guest Mode**: ใช้งานโดยไม่ต้องเข้าสู่ระบบ
- **User Authentication**: ระบบเข้าสู่ระบบ
- **Machine Separation**: แยกประวัติตามเครื่อง
- **Data Export/Import**: ส่งออกและนำเข้าข้อมูล

### 4. **ระบบฐานข้อมูลเวกเตอร์**
- การจัดเก็บ embeddings
- การค้นหาข้อมูลที่เกี่ยวข้อง
- การจัดการ collections
- การทำ re-embedding

## 🔐 ระบบความปลอดภัย (Security Features)

### 1. **การยืนยันตัวตน**
- JWT-based authentication
- Guest mode สำหรับผู้ใช้ทั่วไป
- Machine ID separation

### 2. **การจัดการข้อมูล**
- การแยกข้อมูลตามเครื่อง
- การเข้ารหัสข้อมูลสำคัญ
- การลบข้อมูลแบบ soft delete

### 3. **การเข้าถึง API**
- API key management
- Rate limiting
- CORS configuration

## 📊 การจัดการข้อมูล (Data Management)

### 1. **ประเภทข้อมูล**
- **เอกสาร PDF**: คู่มือปฏิบัติงาน
- **Embeddings**: เวกเตอร์ของเอกสาร
- **ประวัติการสนทนา**: ข้อความและคำตอบ
- **ข้อมูลผู้ใช้**: ข้อมูลการเข้าสู่ระบบ

### 2. **การจัดเก็บข้อมูล**
- **Local Storage**: สำหรับ Guest Mode
- **PostgreSQL**: สำหรับข้อมูลผู้ใช้และประวัติ
- **Qdrant**: สำหรับ embeddings
- **File System**: สำหรับไฟล์ PDF

### 3. **การสำรองข้อมูล**
- Export/Import functionality
- Database backup
- File backup

## 🚀 การติดตั้งและใช้งาน (Installation & Usage)

### ข้อกำหนดระบบ (System Requirements)
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: ขั้นต่ำ 4GB (แนะนำ 8GB)
- **Storage**: ขั้นต่ำ 20GB
- **CPU**: 2+ cores
- **Network**: การเชื่อมต่ออินเทอร์เน็ตที่เสถียร

### การติดตั้ง (Installation)
1. **ติดตั้ง Docker และ Docker Compose**
2. **โคลนโปรเจกต์**
3. **ตั้งค่าตัวแปรสภาพแวดล้อม**
4. **รันระบบด้วย Docker Compose**

### การเข้าถึงระบบ (Access Points)
- **Web UI**: http://localhost:8002
- **Chat API**: http://localhost:8003
- **PDF Management**: http://localhost:8004
- **Qdrant**: http://localhost:6333

## 🔄 การพัฒนาและปรับปรุง (Development & Enhancement)

### ฟีเจอร์ที่พัฒนาครั้งล่าสุด
1. **Guest Mode**: ใช้งานโดยไม่ต้องเข้าสู่ระบบ
2. **Machine Separation**: แยกประวัติตามเครื่อง
3. **Auto-scroll**: การเลื่อนหน้าจออัตโนมัติ
4. **Loading Indicators**: ตัวบ่งชี้การโหลด
5. **Input Area Fixes**: การแก้ไขพื้นที่ป้อนข้อมูล

### การปรับปรุงที่กำลังพัฒนา
1. **Feedback System**: ระบบให้คะแนนคำตอบ
2. **Enhanced UI/UX**: ปรับปรุงอินเทอร์เฟซ
3. **Performance Optimization**: การปรับปรุงประสิทธิภาพ
4. **Error Handling**: การจัดการข้อผิดพลาด

## 📈 การติดตามและวิเคราะห์ (Monitoring & Analytics)

### ระบบ Logging
- Application logs
- Error tracking
- Performance monitoring
- User activity tracking

### การวิเคราะห์ข้อมูล
- Conversation statistics
- User behavior analysis
- System performance metrics
- Error rate monitoring

## 🧪 การทดสอบ (Testing)

### ประเภทการทดสอบ
1. **Unit Testing**: การทดสอบฟังก์ชัน
2. **Integration Testing**: การทดสอบการทำงานร่วมกัน
3. **End-to-End Testing**: การทดสอบระบบทั้งหมด
4. **Performance Testing**: การทดสอบประสิทธิภาพ

### เครื่องมือการทดสอบ
- pytest สำหรับ Python
- Jest สำหรับ React
- Docker testing environment

## 📚 เอกสารและคู่มือ (Documentation)

### เอกสารที่มี
1. **README.md**: คู่มือการติดตั้งและใช้งาน
2. **DEPLOYMENT.md**: คู่มือการติดตั้งระบบ
3. **API Documentation**: เอกสาร API
4. **Feature Documentation**: เอกสารฟีเจอร์ต่างๆ

### การบำรุงรักษาเอกสาร
- การอัปเดตเอกสารอย่างสม่ำเสมอ
- การเพิ่มตัวอย่างการใช้งาน
- การอธิบายการแก้ไขปัญหา

## 👥 ทีมพัฒนา (Development Team)

### ผู้พัฒนา
- **เจียระศักดิ์ อนันตะ** - นักศึกษาวิทยาการคอมพิวเตอร์ RMUTL
- **ผู้เข้าร่วมโครงการ Super AI Engineer Season 4**

### การติดต่อ
- **อีเมล**: jeerasakananta@gmail.com
- **GitHub**: https://github.com/JeerasakAnanta/cs_project

## 📅 Timeline และ Roadmap

### เวลาการพัฒนา
- **เริ่มต้น**: 1 ธันวาคม 2567
- **ระยะเวลา**: 1 ปีการศึกษา
- **สถานะปัจจุบัน**: อยู่ในขั้นตอนการพัฒนาและทดสอบ

### แผนการพัฒนาต่อ
1. **การปรับปรุงประสิทธิภาพ**
2. **การเพิ่มฟีเจอร์ใหม่**
3. **การขยายฐานข้อมูลเอกสาร**
4. **การปรับปรุง UI/UX**

## 🎓 วัตถุประสงค์ทางการศึกษา (Educational Objectives)

### การเรียนรู้ที่ได้รับ
1. **การพัฒนา AI/ML Applications**
2. **การใช้งาน LLM และ RAG**
3. **การพัฒนา Full-stack Applications**
4. **การจัดการฐานข้อมูลเวกเตอร์**
5. **การใช้งาน Docker และ DevOps**

### ทักษะที่พัฒนา
- **Programming**: Python, TypeScript, React
- **AI/ML**: LangChain, OpenAI API, Vector Databases
- **DevOps**: Docker, Docker Compose, Deployment
- **Database**: PostgreSQL, Qdrant, Alembic
- **Web Development**: FastAPI, React, Tailwind CSS

---

*เอกสารนี้สรุปขอบเขตของโครงงาน LannaFinChat ซึ่งเป็นระบบแชตบอตอัจฉริยะสำหรับตอบคำถามจากเอกสาร โดยใช้เทคนิค RAG และ LLM พัฒนาขึ้นเพื่อการศึกษาในระดับปริญญาตรี สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา* 