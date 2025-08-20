# การวิเคราะห์ระบบ LannaFinChat ด้วย Activity Diagrams

## ภาพรวม (Overview)

เอกสารนี้เป็นการวิเคราะห์ระบบ LannaFinChat โดยใช้ Activity Diagrams เพื่อแสดงลำดับการทำงานและขั้นตอนการประมวลผลของแต่ละระบบย่อย โดยเน้นการแสดง flow การทำงานที่ชัดเจนและเข้าใจง่าย

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

### ระบบหลัก (Core Systems)

1. **Frontend Web Application** - React + TypeScript + Tailwind CSS
2. **Backend API Services** - FastAPI + Python
3. **Vector Database** - Qdrant
4. **Relational Database** - PostgreSQL
5. **AI Service** - OpenAI GPT-4o-mini
6. **File Storage** - Local File System

---

## 🔐 ระบบ Authentication (Authentication System)

### Activity Diagram: User Login Flow

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้เข้าสู่หน้า Login]
    B --> C[ป้อน Email และ Password]
    C --> D{ตรวจสอบข้อมูล}
    D -->|ไม่ครบถ้วน| E[แสดงข้อความกรุณากรอกข้อมูลให้ครบถ้วน]
    E --> C
    D -->|ครบถ้วน| F[Frontend ส่งข้อมูลไปยัง Auth Service]
    F --> G[Auth Service ตรวจสอบกับ Database]
    G --> H{ข้อมูลถูกต้องหรือไม่}
    H -->|ไม่ถูกต้อง| I[แสดงข้อความ Email หรือ Password ไม่ถูกต้อง]
    I --> C
    H -->|ถูกต้อง| J[สร้าง Session และ Token]
    J --> K[บันทึก Session ใน Database]
    K --> L[ส่ง Token กลับไปยัง Frontend]
    L --> M[Frontend เก็บ Token ใน Local Storage]
    M --> N[Redirect ไปยังหน้าหลัก]
    N --> O[แสดงหน้าหลักพร้อมข้อมูลผู้ใช้]
    O --> P[สิ้นสุด]
```

### Activity Diagram: Guest Mode Activation

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้เลือกใช้งานโดยไม่ต้องเข้าสู่ระบบ]
    B --> C[Frontend ขอ Machine ID จาก Machine Service]
    C --> D[Machine Service ตรวจสอบ Machine ID ที่มีอยู่]
    D --> E{มี Machine ID อยู่แล้วหรือไม่}
    E -->|ใช่| F[ดึง Machine ID ที่มีอยู่]
    E -->|ไม่| G[สร้าง Machine ID ใหม่]
    G --> H[บันทึก Machine ID ในไฟล์]
    F --> I[บันทึก Machine ID ใน Local Storage]
    H --> I
    I --> J[เข้าสู่โหมด Guest]
    J --> K[แสดงฟีเจอร์พื้นฐาน]
    K --> L[สิ้นสุด]
```

---

## 💬 ระบบแชต (Chat System)

### Activity Diagram: Send Message & Receive Response

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้พิมพ์ข้อความ]
    B --> C{ข้อความว่างเปล่าหรือไม่}
    C -->|ใช่| D[แสดงข้อความกรุณาพิมพ์ข้อความ]
    D --> B
    C -->|ไม่| E[Frontend ส่งข้อความไปยัง Chat Service]
    E --> F[Chat Service บันทึกข้อความใน Database]
    F --> G[Chat Service ส่งข้อความไปยัง OpenAI API]
    G --> H{OpenAI API พร้อมใช้งานหรือไม่}
    H -->|ไม่| I[แสดงข้อความระบบไม่พร้อมใช้งาน]
    I --> J[สิ้นสุด]
    H -->|ใช่| K[OpenAI ประมวลผลข้อความ]
    K --> L[OpenAI ส่งคำตอบกลับ]
    L --> M[Chat Service บันทึกคำตอบใน Database]
    M --> N[Frontend แสดงคำตอบ]
    N --> O[แสดงปุ่มให้คะแนนคุณภาพ]
    O --> P[ผู้ใช้ให้คะแนน]
    P --> Q[บันทึกคะแนนใน Feedback System]
    Q --> R[สิ้นสุด]
```

### Activity Diagram: Conversation Management

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้เลือกการดำเนินการ]
    B --> C{เลือกการดำเนินการใด}
    
    C -->|สร้างการสนทนาใหม่| D[คลิกเริ่มการสนทนาใหม่]
    C -->|ดูประวัติ| E[คลิกประวัติการสนทนา]
    C -->|ล้างประวัติ| F[คลิกล้างประวัติ]
    C -->|ส่งออกข้อมูล| G[คลิกส่งออกข้อมูล]
    
    D --> H[Chat Service สร้าง Conversation ใหม่]
    H --> I[Database ส่ง Conversation ID กลับ]
    I --> J[อัปเดต UI และแสดงหน้าสนทนา]
    J --> K[สิ้นสุด]
    
    E --> L[Chat Service ดึงรายการ Conversations]
    L --> M[แสดงรายการให้ผู้ใช้เลือก]
    M --> N[เมื่อเลือกแล้ว ดึงข้อความในการสนทนานั้น]
    N --> O[แสดงประวัติการสนทนา]
    O --> K
    
    F --> P[แสดงข้อความยืนยันการลบ]
    P --> Q{ผู้ใช้ยืนยันหรือไม่}
    Q -->|ไม่| K
    Q -->|ใช่| R[Chat Service ลบข้อมูลจาก Database]
    R --> S[อัปเดต UI และแสดงข้อความสำเร็จ]
    S --> K
    
    G --> T[Chat Service ดึงข้อมูลทั้งหมด]
    T --> U[สร้างไฟล์ JSON/CSV]
    U --> V[ส่ง Download Link ให้ผู้ใช้]
    V --> W[เริ่มดาวน์โหลดไฟล์]
    W --> K
```

---

## 📄 ระบบจัดการเอกสาร (Document Management System)

### Activity Diagram: PDF Upload & Processing

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้เลือกไฟล์ PDF]
    B --> C{ไฟล์ถูกต้องหรือไม่}
    C -->|ไม่| D[แสดงข้อความไฟล์ไม่ถูกต้อง]
    D --> B
    C -->|ใช่| E[ตรวจสอบขนาดไฟล์]
    E --> F{ขนาดไฟล์เกินขีดจำกัดหรือไม่}
    F -->|ใช่| G[แสดงข้อความไฟล์มีขนาดใหญ่เกินไป]
    G --> B
    F -->|ไม่| H[Document Service รับไฟล์]
    H --> I[บันทึกไฟล์ใน File System]
    I --> J[บันทึกข้อมูลเอกสารใน Database]
    J --> K[Vector Service เริ่มประมวลผลเอกสาร]
    K --> L[แยกข้อความจาก PDF]
    L --> M[แบ่งข้อความเป็น Chunks]
    M --> N[สร้าง Embedding สำหรับแต่ละ Chunk]
    N --> O[บันทึก Embeddings ใน Qdrant DB]
    O --> P[อัปเดตสถานะเอกสารเป็นเสร็จสิ้น]
    P --> Q[แสดงข้อความอัปโหลดสำเร็จ]
    Q --> R[สิ้นสุด]
```

### Activity Diagram: Document Search & Retrieval

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้ป้อนคำค้นหา]
    B --> C{คำค้นหาว่างเปล่าหรือไม่}
    C -->|ใช่| D[แสดงข้อความกรุณาป้อนคำค้นหา]
    D --> B
    C -->|ไม่| E[Vector Service แปลงคำค้นหาเป็น Embedding]
    E --> F[ค้นหา Similar Vectors ใน Qdrant]
    F --> G{พบเอกสารที่เกี่ยวข้องหรือไม่}
    G -->|ไม่| H[แสดงข้อความไม่พบเอกสารที่เกี่ยวข้อง]
    H --> I[สิ้นสุด]
    G -->|ใช่| J[คำนวณ Similarity Score]
    J --> K[จัดเรียงตาม Score]
    K --> L[ดึงข้อมูลเอกสารจาก Database]
    L --> M[แสดงรายการเอกสารที่ตรงกับคำค้นหา]
    M --> N[ผู้ใช้เลือกเอกสาร]
    N --> O[แสดงรายละเอียดและเนื้อหาเอกสาร]
    O --> P[สิ้นสุด]
```

### Activity Diagram: Document Deletion

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้เลือกเอกสารและคลิกลบ]
    B --> C[แสดงข้อความยืนยันการลบ]
    C --> D{ผู้ใช้ยืนยันหรือไม่}
    D -->|ไม่| E[ยกเลิกการลบ]
    E --> F[สิ้นสุด]
    D -->|ใช่| G[Document Service เริ่มกระบวนการลบ]
    G --> H[ลบ Embeddings จาก Qdrant DB]
    H --> I[ลบไฟล์จาก File System]
    I --> J[ลบข้อมูลจาก Database]
    J --> K{การลบสำเร็จทั้งหมดหรือไม่}
    K -->|ไม่| L[แสดงข้อความเกิดข้อผิดพลาดในการลบ]
    L --> M[สิ้นสุด]
    K -->|ใช่| N[อัปเดต UI]
    N --> O[แสดงข้อความลบเอกสารสำเร็จ]
    O --> P[สิ้นสุด]
```

---

## ⚙️ ระบบจัดการระบบ (System Management)

### Activity Diagram: User Management

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[Admin เข้าสู่หน้าจัดการผู้ใช้]
    B --> C[System Service ดึงรายการผู้ใช้จาก Database]
    C --> D[แสดงรายการผู้ใช้]
    D --> E[Admin เลือกการดำเนินการ]
    E --> F{เลือกการดำเนินการใด}
    
    F -->|เพิ่มผู้ใช้| G[แสดงฟอร์มเพิ่มผู้ใช้]
    F -->|แก้ไขผู้ใช้| H[แสดงฟอร์มแก้ไขผู้ใช้]
    F -->|ลบผู้ใช้| I[แสดงข้อความยืนยันการลบ]
    
    G --> J[Admin กรอกข้อมูลผู้ใช้]
    J --> K[ตรวจสอบข้อมูล]
    K --> L{ข้อมูลถูกต้องหรือไม่}
    L -->|ไม่| M[แสดงข้อความข้อมูลไม่ถูกต้อง]
    M --> J
    L -->|ใช่| N[บันทึกข้อมูลใน Database]
    N --> O[แสดงข้อความเพิ่มผู้ใช้สำเร็จ]
    O --> P[สิ้นสุด]
    
    H --> Q[Admin แก้ไขข้อมูล]
    Q --> R[ตรวจสอบข้อมูล]
    R --> S{ข้อมูลถูกต้องหรือไม่}
    S -->|ไม่| T[แสดงข้อความข้อมูลไม่ถูกต้อง]
    T --> Q
    S -->|ใช่| U[อัปเดตข้อมูลใน Database]
    U --> V[แสดงข้อความแก้ไขผู้ใช้สำเร็จ]
    V --> P
    
    I --> W{Admin ยืนยันหรือไม่}
    W -->|ไม่| P
    W -->|ใช่| X[ลบข้อมูลจาก Database]
    X --> Y[แสดงข้อความลบผู้ใช้สำเร็จ]
    Y --> P
```

### Activity Diagram: System Backup & Restore

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[Admin เลือกการดำเนินการ]
    B --> C{เลือกการดำเนินการใด}
    
    C -->|สำรองข้อมูล| D[คลิกสำรองข้อมูล]
    C -->|กู้คืนข้อมูล| E[คลิกกู้คืนข้อมูล]
    
    D --> F[System Service เริ่มกระบวนการสำรอง]
    F --> G[ดึงข้อมูลจาก Database]
    G --> H[ดึงข้อมูลจาก File System]
    H --> I[ดึงข้อมูลจาก Qdrant DB]
    I --> J[สร้างไฟล์สำรองใน File System]
    J --> K[ส่ง Download Link]
    K --> L[เริ่มดาวน์โหลดไฟล์สำรอง]
    L --> M[แสดงข้อความสำรองข้อมูลสำเร็จ]
    M --> N[สิ้นสุด]
    
    E --> O[Admin เลือกไฟล์สำรอง]
    O --> P[System Service ตรวจสอบไฟล์]
    P --> Q{ไฟล์ถูกต้องหรือไม่}
    Q -->|ไม่| R[แสดงข้อความไฟล์ไม่ถูกต้อง]
    R --> N
    Q -->|ใช่| S[เริ่มกระบวนการกู้คืน]
    S --> T[กู้คืนข้อมูลใน Database]
    T --> U[กู้คืนข้อมูลใน File System]
    U --> V[กู้คืนข้อมูลใน Qdrant DB]
    V --> W[รีสตาร์ทระบบ]
    W --> X[แสดงข้อความกู้คืนข้อมูลสำเร็จ]
    X --> N
```

---

## 🖥️ ระบบจัดการเครื่อง (Machine Management)

### Activity Diagram: Machine ID Generation & Management

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ระบบต้องการ Machine ID]
    B --> C[ตรวจสอบ Machine ID ที่มีอยู่]
    C --> D{มี Machine ID อยู่แล้วหรือไม่}
    D -->|ใช่| E[ดึง Machine ID ที่มีอยู่]
    D -->|ไม่| F[Machine Service สร้าง Machine ID ใหม่]
    F --> G[สร้าง Unique Identifier]
    G --> H[บันทึกลงไฟล์ this.machineId]
    H --> I[บันทึกใน Local Storage]
    E --> J[ส่ง Machine ID กลับ]
    I --> J
    J --> K[สิ้นสุด]
```

### Activity Diagram: Machine Data Export/Import

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้เลือกการดำเนินการ]
    B --> C{เลือกการดำเนินการใด}
    
    C -->|ส่งออกข้อมูล| D[คลิกส่งออกข้อมูลเครื่อง]
    C -->|นำเข้าข้อมูล| E[คลิกนำเข้าข้อมูลเครื่อง]
    
    D --> F[ดึงข้อมูลจาก Local Storage]
    F --> G[ดึงข้อมูลจากไฟล์ this.machineId]
    G --> H[รวบรวมข้อมูลเครื่อง]
    H --> I[สร้างไฟล์ Export]
    I --> J[ส่ง Download Link]
    J --> K[เริ่มดาวน์โหลด]
    K --> L[สิ้นสุด]
    
    E --> M[ผู้ใช้เลือกไฟล์ข้อมูลเครื่อง]
    M --> N[ตรวจสอบรูปแบบไฟล์]
    N --> O{ไฟล์ถูกต้องหรือไม่}
    O -->|ไม่| P[แสดงข้อความไฟล์ไม่ถูกต้อง]
    P --> L
    O -->|ใช่| Q[อ่านข้อมูลจากไฟล์]
    Q --> R[นำเข้าข้อมูลและบันทึก]
    R --> S[แสดงข้อความนำเข้าข้อมูลสำเร็จ]
    S --> L
```

---

## 📝 ระบบข้อเสนอแนะ (Feedback System)

### Activity Diagram: Response Rating & Feedback

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้ได้รับคำตอบจากแชตบอต]
    B --> C[ระบบแสดงปุ่มให้คะแนนคุณภาพ]
    C --> D[ผู้ใช้ให้คะแนน 1-5 ดาว]
    D --> E[Frontend ส่งคะแนนไปยัง Feedback Service]
    E --> F[บันทึกคะแนนและ Context ใน Database]
    F --> G[แสดงข้อความขอบคุณ]
    G --> H[ผู้ใช้คลิกส่งข้อเสนอแนะ]
    H --> I[แสดงฟอร์มข้อเสนอแนะ]
    I --> J[ผู้ใช้กรอกข้อเสนอแนะ]
    J --> K{ข้อเสนอแนะว่างเปล่าหรือไม่}
    K -->|ใช่| L[แสดงข้อความกรุณากรอกข้อเสนอแนะ]
    L --> J
    K -->|ไม่| M[บันทึกข้อเสนอแนะใน Database]
    M --> N[แสดงข้อความขอบคุณ]
    N --> O[สิ้นสุด]
```

### Activity Diagram: Feedback Analytics

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[Admin เข้าสู่หน้าสถิติข้อเสนอแนะ]
    B --> C[Feedback Service ดึงข้อมูลคะแนนจาก Database]
    C --> D[ดึงข้อมูลข้อเสนอแนะจาก Database]
    D --> E[วิเคราะห์ข้อมูลคะแนน]
    E --> F[วิเคราะห์ข้อมูลข้อเสนอแนะ]
    F --> G[สร้างสถิติและรายงาน]
    G --> H[แสดงกราฟคะแนนเฉลี่ย]
    H --> I[แสดงตารางข้อเสนอแนะ]
    I --> J[แสดงแนวโน้มการปรับปรุง]
    J --> K[Admin วิเคราะห์ข้อมูล]
    K --> L[สิ้นสุด]
```

---

## 🗄️ ระบบฐานข้อมูลเวกเตอร์ (Vector Database System)

### Activity Diagram: Vector Collection Management

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ระบบต้องการจัดการ Vector Collection]
    B --> C{เลือกการดำเนินการใด}
    
    C -->|สร้าง Collection| D[Create Vector Collection]
    C -->|อัปเดต Embeddings| E[Update Embeddings]
    C -->|ค้นหาเอกสาร| F[Search Similar Documents]
    C -->|จัดการ Vector DB| G[Manage Vector Database]
    
    D --> H[ตรวจสอบ Collection ที่มีอยู่]
    H --> I[Vector Service สร้าง Collection ใหม่ใน Qdrant]
    I --> J[ตั้งค่า Schema และ Parameters]
    J --> K[บันทึกข้อมูล Collection]
    K --> L[สิ้นสุด]
    
    E --> M[ตรวจสอบเอกสารที่เปลี่ยนแปลง]
    M --> N[สร้าง Embedding ใหม่สำหรับแต่ละเอกสาร]
    N --> O[อัปเดตใน Qdrant DB]
    O --> P[ล้าง Embeddings เก่า]
    P --> L
    
    F --> Q[Chat Service ขอค้นหาเอกสารที่เกี่ยวข้อง]
    Q --> R[แปลงคำค้นหาเป็น Embedding]
    R --> S[ค้นหา Similar Vectors ใน Qdrant]
    S --> T[คำนวณ Similarity Score]
    T --> U[จัดเรียงและส่งผลการค้นหา]
    U --> L
    
    G --> V[Admin เข้าสู่การจัดการ Vector DB]
    V --> W[ตรวจสอบสถานะ Collections]
    W --> X[Admin เลือกการดำเนินการ]
    X --> Y[ดำเนินการตามที่เลือก]
    Y --> Z[แสดงข้อความสำเร็จ]
    Z --> L
```

---

## 🔄 การทำงานร่วมกันของระบบ (System Integration)

### Activity Diagram: End-to-End Chat Flow

```mermaid
flowchart TD
    A[เริ่มต้น] --> B[ผู้ใช้ส่งข้อความ]
    B --> C[Frontend ส่งไปยัง Chat Service]
    C --> D[Chat Service บันทึกข้อความ]
    D --> E[Chat Service ขอค้นหาเอกสารที่เกี่ยวข้อง]
    E --> F[Vector Service ค้นหาใน Qdrant]
    F --> G[ส่งเอกสารที่เกี่ยวข้องกลับ]
    G --> H[Chat Service ส่งข้อความและเอกสารไปยัง OpenAI]
    H --> I[OpenAI ประมวลผลและตอบกลับ]
    I --> J[Chat Service บันทึกคำตอบ]
    J --> K[Frontend แสดงคำตอบ]
    K --> L[แสดงปุ่มให้คะแนน]
    L --> M[ผู้ใช้ให้คะแนน]
    M --> N[บันทึกใน Feedback System]
    N --> O[สิ้นสุด]
```

---

## 🎯 จุดสำคัญของแต่ละระบบ

### 🔐 Authentication System
- **Session Management**: จัดการ session และ token อย่างปลอดภัย
- **Guest Mode**: สร้าง Machine ID เพื่อแยกแยะผู้ใช้แต่ละเครื่อง
- **Error Handling**: จัดการข้อผิดพลาดการเข้าสู่ระบบอย่างเหมาะสม

### 💬 Chat System
- **AI Integration**: เชื่อมต่อกับ OpenAI API อย่างมีประสิทธิภาพ
- **Data Persistence**: บันทึกข้อมูลการสนทนาอย่างสมบูรณ์
- **User Experience**: แสดงสถานะการทำงานและข้อความยืนยัน

### 📄 Document Management System
- **Multi-step Processing**: การอัปโหลดและประมวลผลเอกสารหลายขั้นตอน
- **Vector Processing**: สร้าง embeddings สำหรับการค้นหา
- **File Management**: จัดการไฟล์และฐานข้อมูลอย่างสอดคล้อง

### ⚙️ System Management
- **Admin Operations**: การจัดการระบบโดยผู้ดูแลระบบ
- **Backup/Restore**: การสำรองและกู้คืนข้อมูลอย่างปลอดภัย
- **Monitoring**: การติดตามประสิทธิภาพระบบ

### 🖥️ Machine Management
- **Local Storage**: จัดการข้อมูลใน browser และไฟล์
- **Unique Identification**: สร้างและจัดการ Machine ID
- **Data Portability**: การนำเข้าและส่งออกข้อมูล

### 📝 Feedback System
- **Quality Assessment**: การให้คะแนนและรับข้อเสนอแนะ
- **Analytics**: การวิเคราะห์และสร้างสถิติ
- **Continuous Improvement**: ลูปการปรับปรุงระบบ

### 🗄️ Vector Database System
- **Vector Operations**: การจัดการ vector embeddings
- **Similarity Search**: การค้นหาความคล้ายกัน
- **Performance Optimization**: การ optimize ประสิทธิภาพ

---

## 📊 ลักษณะการทำงานของระบบ

### 🔄 แบบ Synchronous
- การเข้าสู่ระบบ (Login)
- การอัปโหลดเอกสาร
- การค้นหาข้อมูล
- การจัดการผู้ใช้

### ⚡ แบบ Asynchronous
- การประมวลผล embeddings
- การสำรองข้อมูล
- การส่งอีเมลยืนยัน
- การประมวลผลเอกสาร

### 🔁 แบบ Batch Processing
- การอัปเดต embeddings
- การส่งออกข้อมูล
- การวิเคราะห์สถิติ
- การสำรองข้อมูล

---

## 🎯 ข้อสังเกตสำคัญ

1. **Error Handling**: ทุกระบบมีขั้นตอนการจัดการข้อผิดพลาดอย่างชัดเจน
2. **Data Consistency**: การลบข้อมูลจะดำเนินการในหลายระบบอย่างสอดคล้อง
3. **User Experience**: มีการแสดงข้อความยืนยันและสถานะการทำงาน
4. **Security**: การตรวจสอบสิทธิ์และการล้างข้อมูลอย่างเหมาะสม
5. **Scalability**: การแยกส่วนประกอบทำให้ระบบสามารถขยายได้
6. **Monitoring**: มีการติดตามและบันทึกการทำงานของระบบ
7. **Backup & Recovery**: ระบบรองรับการสำรองและกู้คืนข้อมูล

---

*เอกสารนี้แสดงการวิเคราะห์ระบบ LannaFinChat ในรูปแบบ Activity Diagrams เพื่อให้เข้าใจลำดับการทำงานและขั้นตอนการประมวลผลของแต่ละระบบย่อยอย่างชัดเจน*
