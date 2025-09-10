# ระบบจัดการไฟล์ PDF สำหรับ RAG (Retrieval Augmented Generation)

## ภาพรวม
ระบบจัดการไฟล์ PDF ที่พัฒนาขึ้นเพื่อรองรับการใช้งาน RAG โดยสามารถ:
- อัปโหลดไฟล์ PDF
- Indexing ไฟล์ไปยัง Qdrant Vector Database
- ลบไฟล์และข้อมูลจากระบบ
- ตรวจสอบสถานะการ indexing
- ดูสถิติการใช้งาน

## ฟีเจอร์หลัก

### 1. การอัปโหลดไฟล์ PDF
- รองรับเฉพาะไฟล์ PDF
- ตรวจสอบชื่อไฟล์ซ้ำ
- แสดงขนาดไฟล์และวันที่อัปโหลด

### 2. การ Indexing
- แปลง PDF เป็น Markdown ด้วย Docling
- แบ่งข้อความเป็น chunks ด้วย MarkdownTextSplitter
- สร้าง embeddings ด้วย OpenAI
- เก็บข้อมูลใน Qdrant Vector Database
- เพิ่ม metadata (ชื่อไฟล์, เวลาที่ index, แหล่งที่มา)

### 3. การจัดการไฟล์
- ดูรายการไฟล์ทั้งหมดพร้อมสถานะ
- ลบไฟล์และข้อมูลจาก Qdrant
- Re-indexing ไฟล์ที่มีอยู่

### 4. สถิติและรายงาน
- จำนวนไฟล์ทั้งหมด
- จำนวนไฟล์ที่ index แล้ว
- ขนาดรวมของไฟล์
- จำนวน vectors ใน Qdrant

## API Endpoints

### GET /api/pdfs/
รายการไฟล์ PDF ทั้งหมดพร้อมข้อมูลรายละเอียด
```json
[
  {
    "filename": "document.pdf",
    "size_bytes": 1024000,
    "size_mb": 1.02,
    "created_at": "2025-01-01T00:00:00",
    "modified_at": "2025-01-01T00:00:00",
    "is_indexed": true,
    "indexed_at": "2025-01-01T00:05:00"
  }
]
```

### POST /api/pdfs/upload/
อัปโหลดไฟล์ PDF ใหม่
- Content-Type: multipart/form-data
- Body: file (PDF file)

### POST /api/pdfs/index/{filename}
เริ่มต้นการ indexing ไฟล์ PDF
- Background task
- ใช้เวลาในการประมวลผล

### POST /api/pdfs/reindex/{filename}
Re-indexing ไฟล์ PDF
- ลบ vectors เก่าออกก่อน
- สร้าง vectors ใหม่

### DELETE /api/pdfs/{filename}
ลบไฟล์ PDF และข้อมูลจาก Qdrant

### GET /api/pdfs/stats/
สถิติการใช้งานระบบ
```json
{
  "total_files": 10,
  "indexed_files": 8,
  "not_indexed_files": 2,
  "total_size_mb": 25.5,
  "total_vectors_in_qdrant": 1500,
  "indexing_percentage": 80.0
}
```

## Frontend Component

### PDFManager Component
- ตารางแสดงไฟล์ PDF
- ปุ่มอัปโหลดไฟล์
- ปุ่ม Index/Re-index
- ปุ่มลบไฟล์
- แสดงสถิติ

### การใช้งาน
1. เข้าสู่ระบบด้วยบัญชี Admin
2. ไปที่ `/admin/pdfs`
3. อัปโหลดไฟล์ PDF
4. คลิก "Index" เพื่อเริ่มต้นการ indexing
5. รอให้การ indexing เสร็จสิ้น
6. ไฟล์พร้อมใช้งานในระบบ RAG

## การตั้งค่า

### Environment Variables
```env
QDRANT_VECTERDB_HOST=http://localhost:6333
COLLECTION_NAME=lannafinchat_docs
EMBEDDINGS_MODEL=text-embedding-3-large
OPENAI_API_KEY=your_openai_api_key
```

### Dependencies
- FastAPI
- LangChain
- Qdrant Client
- Docling
- OpenAI

## การทำงานของระบบ

### 1. การประมวลผล PDF
```
PDF File → Docling → Markdown → Text Splitter → Chunks → Embeddings → Qdrant
```

### 2. การค้นหาใน RAG
```
Query → Embeddings → Qdrant Search → Context → LLM → Answer
```

### 3. Metadata Structure
```json
{
  "filename": "document.pdf",
  "indexed_at": "2025-01-01T00:05:00",
  "source": "pdf_upload"
}
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย
1. **ไฟล์ไม่สามารถ index ได้**
   - ตรวจสอบว่าไฟล์เป็น PDF จริง
   - ตรวจสอบขนาดไฟล์ (ไม่ควรเกิน 100MB)
   - ตรวจสอบการเชื่อมต่อ OpenAI API

2. **การ indexing ช้า**
   - ไฟล์ขนาดใหญ่ใช้เวลานาน
   - ตรวจสอบการเชื่อมต่อ Qdrant
   - ตรวจสอบ OpenAI API rate limit

3. **ไม่สามารถลบไฟล์ได้**
   - ตรวจสอบสิทธิ์การเข้าถึง
   - ตรวจสอบการเชื่อมต่อ Qdrant

### Logs
ระบบจะบันทึก log ใน:
- การอัปโหลดไฟล์
- การ indexing
- การลบไฟล์
- ข้อผิดพลาด

## การพัฒนาต่อ

### ฟีเจอร์ที่สามารถเพิ่มได้
1. **Batch Upload**: อัปโหลดหลายไฟล์พร้อมกัน
2. **Progress Tracking**: แสดงความคืบหน้าการ indexing
3. **File Preview**: ดูตัวอย่างเนื้อหาไฟล์
4. **Search**: ค้นหาไฟล์ในระบบ
5. **Categories**: จัดหมวดหมู่ไฟล์
6. **Version Control**: จัดการเวอร์ชันไฟล์

### การปรับปรุงประสิทธิภาพ
1. **Parallel Processing**: ประมวลผลหลายไฟล์พร้อมกัน
2. **Caching**: เก็บ cache ของ embeddings
3. **Compression**: บีบอัดไฟล์ก่อนเก็บ
4. **CDN**: ใช้ CDN สำหรับไฟล์ขนาดใหญ่

## การทดสอบ

### Unit Tests
- ทดสอบการอัปโหลดไฟล์
- ทดสอบการ indexing
- ทดสอบการลบไฟล์
- ทดสอบ API endpoints

### Integration Tests
- ทดสอบการทำงานร่วมกับ Qdrant
- ทดสอบการทำงานร่วมกับ OpenAI
- ทดสอบการทำงานร่วมกับ Frontend

## การ Deploy

### Production Setup
1. ตั้งค่า environment variables
2. ตั้งค่า Qdrant cluster
3. ตั้งค่า OpenAI API
4. Deploy backend API
5. Deploy frontend
6. ตั้งค่า monitoring และ logging

### Docker
```dockerfile
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

## สรุป

ระบบจัดการไฟล์ PDF นี้ให้ความสามารถในการ:
- จัดการไฟล์ PDF อย่างมีประสิทธิภาพ
- Indexing ไฟล์สำหรับ RAG
- ติดตามสถานะการประมวลผล
- ดูสถิติการใช้งาน

ระบบนี้เป็นส่วนสำคัญของ LannaFinChat ที่ช่วยให้สามารถตอบคำถามจากเอกสาร PDF ได้อย่างแม่นยำและรวดเร็ว
