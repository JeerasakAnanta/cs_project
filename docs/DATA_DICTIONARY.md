# พจนานุกรมข้อมูล (Data Dictionary) - ระบบ LannaFinChat

## ภาพรวมระบบ
ระบบ LannaFinChat เป็นระบบแชตบอตอัจฉริยะสำหรับตอบคำถามจากเอกสาร โดยใช้เทคนิค RAG (Retrieval Augmented Generation) และ LLM (Large Language Models) พัฒนาขึ้นเพื่อเป็นส่วนหนึ่งของโครงงานระดับปริญญาตรี สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา (RMUTL)

---

## 📊 ตารางข้อมูลหลัก (Core Data Tables)

### 1. ตาราง USERS (ผู้ใช้)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | User ID (Primary Key) | Primary Key |
| email | String | 255 | - | User email address (unique) | Unique, Not Null |
| username | String | 255 | - | Username (unique) | Unique, Not Null |
| hashed_password | String | 255 | - | Encrypted password | Not Null |
| role | String | 50 | "user" | User role (user/admin) | Not Null |
| is_active | Boolean | - | true | Account status | Not Null |



**ความสัมพันธ์:**
- `USERS` → `CONVERSATIONS` (One-to-Many): ผู้ใช้หนึ่งคนสามารถมีหลายการสนทนา

---

### 2. ตาราง CONVERSATIONS (การสนทนา)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Conversation ID (Primary Key) | Primary Key |
| user_id | Integer | - | - | User ID (references USERS.id) | Foreign Key |
| title | String | 255 | "New Conversation" | Conversation title | Not Null |
| created_at | DateTime | - | Current Timestamp | Creation time | Not Null |

**ความสัมพันธ์:**
- `CONVERSATIONS` ← `USERS` (Many-to-One): การสนทนาอ้างอิงจากผู้ใช้
- `CONVERSATIONS` → `MESSAGES` (One-to-Many): การสนทนาหนึ่งครั้งมีหลายข้อความ

---

### 3. ตาราง MESSAGES (ข้อความ)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Message ID (Primary Key) | Primary Key |
| conversation_id | Integer | - | - | Conversation ID (references CONVERSATIONS.id) | Foreign Key |
| sender | String | 50 | - | Message sender ("user" or "bot") | Not Null |
| content | String | - | - | Message content | Not Null |

**ความสัมพันธ์:**
- `MESSAGES` ← `CONVERSATIONS` (Many-to-One): ข้อความอ้างอิงจากการสนทนา
- `MESSAGES` → `FEEDBACKS` (One-to-Many): ข้อความหนึ่งข้อความมีหลายข้อเสนอแนะ

---

### 4. ตาราง FEEDBACKS (ข้อเสนอแนะ)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Feedback ID (Primary Key) | Primary Key |
| message_id | Integer | - | - | Message ID (references MESSAGES.id) | Foreign Key |
| feedback_type | String | 50 | - | Feedback type ('like' or 'dislike') | Not Null |
| comment | String | - | Nullable | Additional comment | Nullable |
| created_at | DateTime | - | Current Timestamp | Creation time | Not Null |

**ความสัมพันธ์:**
- `FEEDBACKS` ← `MESSAGES` (Many-to-One): ข้อเสนอแนะอ้างอิงจากข้อความ

---

### 5. ตาราง GUEST_CONVERSATIONS (การสนทนาผู้เยี่ยมชม)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | String | 36 | - | Conversation ID (UUID Primary Key) | Primary Key |
| machine_id | String | 255 | - | Machine identifier for data separation | Index, Not Null |
| title | String | 255 | "Guest Conversation" | Conversation title | Not Null |
| created_at | DateTime | - | Current Timestamp | Creation time | Not Null |
| updated_at | DateTime | - | Current Timestamp | Last update time | Not Null |
| is_deleted | Boolean | - | false | Soft delete flag | Not Null |

**ความสัมพันธ์:**
- `GUEST_CONVERSATIONS` → `GUEST_MESSAGES` (One-to-Many): การสนทนาผู้เยี่ยมชมหนึ่งครั้งมีหลายข้อความ

---

### 6. ตาราง GUEST_MESSAGES (ข้อความผู้เยี่ยมชม)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | String | 36 | - | Message ID (UUID Primary Key) | Primary Key |
| conversation_id | String | 36 | - | Conversation ID (references GUEST_CONVERSATIONS.id) | Foreign Key |
| sender | String | 50 | - | Message sender ("user" or "bot") | Not Null |
| content | Text | - | - | Message content (supports long text) | Not Null |
| timestamp | DateTime | - | Current Timestamp | Message timestamp | Not Null |

**ความสัมพันธ์:**
- `GUEST_MESSAGES` ← `GUEST_CONVERSATIONS` (Many-to-One): ข้อความผู้เยี่ยมชมอ้างอิงจากการสนทนา

---

## 🔍 ตารางข้อมูลระบบ RAG (RAG System Tables)

### 7. ตาราง DOCUMENTS (เอกสาร)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Document ID (Primary Key) | Primary Key |
| filename | String | 255 | - | Original filename | Not Null |
| file_path | String | 500 | - | File path in system | Not Null |
| file_type | String | 50 | - | File type (PDF/DOC/TXT) | Not Null |
| file_size | Integer | - | - | File size in bytes | Not Null |
| uploaded_at | DateTime | - | Current Timestamp | Upload time | Not Null |
| status | String | 50 | "pending" | Processing status | Not Null |
| content | Text | - | - | Extracted text content | Nullable |
| checksum | String | 64 | - | File hash | Nullable |
| source | String | 100 | - | Document source | Nullable |

**ความสัมพันธ์:**
- `DOCUMENTS` → `EMBEDDINGS` (One-to-Many): เอกสารหนึ่งฉบับสร้างหลาย embeddings
- `DOCUMENTS` → `DOCUMENT_PROCESSING` (One-to-One): เอกสารหนึ่งฉบับมีหนึ่งการประมวลผล

---

### 8. ตาราง EMBEDDINGS (เวกเตอร์เอกสาร)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Embedding ID (Primary Key) | Primary Key |
| document_id | Integer | - | - | Document ID (references DOCUMENTS.id) | Foreign Key |
| chunk_text | Text | - | - | Text chunk content | Not Null |
| embedding_vector | Vector | 1536 | - | OpenAI embedding vector | Not Null |
| chunk_index | Integer | - | - | Chunk order index | Not Null |
| created_at | DateTime | - | Current Timestamp | Creation time | Not Null |
| chunk_type | String | 50 | - | Chunk type | Nullable |
| similarity_score | Float | - | - | Similarity score | Nullable |

**ความสัมพันธ์:**
- `EMBEDDINGS` ← `DOCUMENTS` (Many-to-One): Embeddings อ้างอิงจากเอกสาร

---

### 9. ตาราง DOCUMENT_PROCESSING (การประมวลผลเอกสาร)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Processing ID (Primary Key) | Primary Key |
| document_id | Integer | - | - | Document ID (references DOCUMENTS.id) | Foreign Key |
| status | String | 50 | "pending" | Processing status | Not Null |
| started_at | DateTime | - | - | Processing start time | Nullable |
| completed_at | DateTime | - | - | Processing completion time | Nullable |
| error_message | Text | - | - | Error message details | Nullable |
| chunks_created | Integer | - | 0 | Number of chunks created | Not Null |
| processing_time | Float | - | - | Processing time in seconds | Nullable |
| processor_version | String | 50 | - | Processing algorithm version | Nullable |

**ความสัมพันธ์:**
- `DOCUMENT_PROCESSING` ← `DOCUMENTS` (Many-to-One): การประมวลผลอ้างอิงจากเอกสาร

---

## 📈 ตารางข้อมูลการวิเคราะห์ (Analytics Tables)

### 10. ตาราง SEARCH_QUERIES (การค้นหา)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Search Query ID (Primary Key) | Primary Key |
| user_id | Integer | - | - | User ID (references USERS.id) | Foreign Key, Nullable |
| query_text | Text | - | - | Search query text | Not Null |
| search_time | DateTime | - | Current Timestamp | Search timestamp | Not Null |
| search_type | String | 50 | - | Search type | Nullable |
| results_count | Integer | - | 0 | Number of search results | Not Null |
| search_duration | Float | - | - | Search duration in seconds | Nullable |

**ความสัมพันธ์:**
- `SEARCH_QUERIES` ← `USERS` (Many-to-One): การค้นหาอ้างอิงจากผู้ใช้ (ถ้ามี)

---

### 11. ตาราง USAGE_ANALYTICS (การวิเคราะห์การใช้งาน)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Analytics ID (Primary Key) | Primary Key |
| user_id | Integer | - | - | User ID (references USERS.id) | Foreign Key, Nullable |
| action_type | String | 100 | - | Action type | Not Null |
| action_time | DateTime | - | Current Timestamp | Action timestamp | Not Null |
| ip_address | String | 45 | - | User IP address | Nullable |
| user_agent | String | 500 | - | Browser information | Nullable |
| session_id | String | 255 | - | Session identifier | Nullable |
| metadata | JSON | - | - | Additional data | Nullable |

**ความสัมพันธ์:**
- `USAGE_ANALYTICS` ← `USERS` (Many-to-One): การวิเคราะห์อ้างอิงจากผู้ใช้ (ถ้ามี)

---

## 🔧 ข้อมูลการตั้งค่าระบบ (System Configuration Data)

### 12. ตาราง SYSTEM_CONFIG (การตั้งค่าระบบ)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Configuration ID (Primary Key) | Primary Key |
| config_key | String | 100 | - | Configuration key | Unique, Not Null |
| config_value | Text | - | - | Configuration value | Not Null |
| config_type | String | 50 | "string" | Value type (string/int/float/bool) | Not Null |
| description | Text | - | - | Configuration description | Nullable |
| updated_at | DateTime | - | Current Timestamp | Last update time | Not Null |
| updated_by | String | 100 | - | Updated by user | Nullable |

---

## 📊 ข้อมูลสถิติและรายงาน (Statistics & Reporting Data)

### 13. ตาราง CONVERSATION_STATS (สถิติการสนทนา)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Statistics ID (Primary Key) | Primary Key |
| conversation_id | Integer | - | - | Conversation ID | Foreign Key |
| total_messages | Integer | - | 0 | Total message count | Not Null |
| user_messages | Integer | - | 0 | User message count | Not Null |
| bot_messages | Integer | - | 0 | Bot message count | Not Null |
| avg_response_time | Float | - | - | Average response time | Nullable |
| created_date | Date | - | Current Date | Conversation creation date | Not Null |

---

## 🔐 ข้อมูลความปลอดภัย (Security Data)

### 14. ตาราง API_KEYS (คีย์ API)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | API Key ID (Primary Key) | Primary Key |
| key_name | String | 100 | - | API key name | Unique, Not Null |
| api_key | String | 255 | - | Encrypted API key | Unique, Not Null |
| permissions | JSON | - | - | Access permissions | Not Null |
| is_active | Boolean | - | true | Active status | Not Null |
| created_at | DateTime | - | Current Timestamp | Creation time | Not Null |
| expires_at | DateTime | - | - | Expiration time | Nullable |

---

## 📁 ข้อมูลไฟล์และสื่อ (File & Media Data)

### 15. ตาราง FILE_METADATA (ข้อมูลไฟล์)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | File Metadata ID (Primary Key) | Primary Key |
| file_path | String | 500 | - | File path in system | Unique, Not Null |
| file_name | String | 255 | - | File name | Not Null |
| file_extension | String | 20 | - | File extension | Not Null |
| mime_type | String | 100 | - | MIME type | Not Null |
| file_size_bytes | BigInt | - | - | File size in bytes | Not Null |
| created_at | DateTime | - | Current Timestamp | File creation time | Not Null |
| last_modified | DateTime | - | - | Last modification time | Nullable |
| checksum | String | 64 | - | File hash | Nullable |

---

## 🌐 ข้อมูลการเชื่อมต่อ (Connection Data)

### 16. ตาราง SESSION_DATA (ข้อมูลเซสชัน)

| Field Name | Type | Length | Format | Description | Key |
|------------|------|--------|--------|-------------|-----|
| id | Integer | - | Auto Increment | Session Data ID (Primary Key) | Primary Key |
| session_id | String | 255 | - | Session identifier | Unique, Not Null |
| user_id | Integer | - | - | User ID | Foreign Key, Nullable |
| machine_id | String | 255 | - | Machine identifier | Nullable |
| ip_address | String | 45 | - | IP address | Nullable |
| user_agent | String | 500 | - | Browser information | Nullable |
| created_at | DateTime | - | Current Timestamp | Session creation time | Not Null |
| last_activity | DateTime | - | Current Timestamp | Last activity time | Not Null |
| is_active | Boolean | - | true | Session status | Not Null |

---

## 📊 สรุปความสัมพันธ์ของข้อมูล (Data Relationship Summary)

### ความสัมพันธ์หลัก (Primary Relationships)

1. **USERS** (1) → **CONVERSATIONS** (N): ผู้ใช้หนึ่งคนสามารถมีหลายการสนทนา
2. **CONVERSATIONS** (1) → **MESSAGES** (N): การสนทนาหนึ่งครั้งมีหลายข้อความ
3. **MESSAGES** (1) → **FEEDBACKS** (N): ข้อความหนึ่งข้อความมีหลายข้อเสนอแนะ
4. **DOCUMENTS** (1) → **EMBEDDINGS** (N): เอกสารหนึ่งฉบับสร้างหลาย embeddings
5. **DOCUMENTS** (1) → **DOCUMENT_PROCESSING** (1): เอกสารหนึ่งฉบับมีหนึ่งการประมวลผล

### ความสัมพันธ์แบบ Guest Mode

1. **GUEST_CONVERSATIONS** (1) → **GUEST_MESSAGES** (N): การสนทนาผู้เยี่ยมชมหนึ่งครั้งมีหลายข้อความ

### ความสัมพันธ์แบบ Analytics

1. **USERS** (1) → **SEARCH_QUERIES** (N): ผู้ใช้หนึ่งคนสามารถค้นหาหลายครั้ง
2. **USERS** (1) → **USAGE_ANALYTICS** (N): ผู้ใช้หนึ่งคนสร้างข้อมูลการวิเคราะห์หลายรายการ

---

## 🔧 การจัดการข้อมูล (Data Management)

### การจัดเก็บข้อมูล (Data Storage)

1. **PostgreSQL Database**: ข้อมูลผู้ใช้ การสนทนา ข้อความ และการตั้งค่าระบบ
2. **Qdrant Vector Database**: Embeddings และการค้นหาเวกเตอร์
3. **File System**: ไฟล์เอกสาร PDF และไฟล์สื่อ
4. **Local Storage (Browser)**: ข้อมูล Guest Mode และการตั้งค่าผู้ใช้

### การสำรองข้อมูล (Data Backup)

1. **Database Backup**: การสำรองฐานข้อมูล PostgreSQL
2. **File Backup**: การสำรองไฟล์เอกสาร
3. **Export/Import**: การส่งออกและนำเข้าข้อมูล Guest Mode
4. **Vector Database Backup**: การสำรองฐานข้อมูลเวกเตอร์ Qdrant

### การทำความสะอาดข้อมูล (Data Cleanup)

1. **Soft Delete**: การลบข้อมูลแบบ soft delete สำหรับ Guest Mode
2. **Data Archiving**: การย้ายข้อมูลเก่าไปยังตารางแยก
3. **Session Cleanup**: การลบเซสชันที่หมดอายุ
4. **File Cleanup**: การลบไฟล์ที่ไม่ได้ใช้งาน

---

## 📋 มาตรฐานการตั้งชื่อ (Naming Conventions)

### มาตรฐานการตั้งชื่อตาราง
- ใช้ชื่อพหูพจน์ (Plural): `users`, `conversations`, `messages`
- ใช้ตัวพิมพ์เล็กและขีดล่าง: `guest_conversations`, `document_processing`
- ใช้คำย่อที่เข้าใจง่าย: `api_keys`, `file_metadata`

### มาตรฐานการตั้งชื่อฟิลด์
- ใช้ตัวพิมพ์เล็กและขีดล่าง: `user_id`, `created_at`, `is_active`
- ใช้คำย่อที่เข้าใจง่าย: `id` (Primary Key), `fk` (Foreign Key)
- ใช้คำที่ชัดเจน: `hashed_password`, `feedback_type`

### มาตรฐานการตั้งชื่อ Index
- Primary Key: `pk_tablename`
- Foreign Key: `fk_tablename_fieldname`
- Unique: `uk_tablename_fieldname`
- Regular Index: `ix_tablename_fieldname`

---

## 🚀 การปรับปรุงประสิทธิภาพ (Performance Optimization)

### การสร้าง Index
1. **Primary Keys**: ทุกตารางมี Primary Key Index
2. **Foreign Keys**: สร้าง Index สำหรับ Foreign Key fields
3. **Search Fields**: สร้าง Index สำหรับฟิลด์ที่ใช้ค้นหาบ่อย
4. **Composite Indexes**: สร้าง Index แบบผสมสำหรับ queries ที่ซับซ้อน

### การ Partitioning
1. **Time-based Partitioning**: แบ่งตารางตามช่วงเวลา
2. **Range Partitioning**: แบ่งตามช่วงข้อมูล
3. **Hash Partitioning**: แบ่งตาม hash ของ Primary Key

### การ Caching
1. **Application Cache**: ใช้ Redis สำหรับข้อมูลที่เข้าถึงบ่อย
2. **Query Cache**: เก็บผลลัพธ์การค้นหาที่ใช้บ่อย
3. **Session Cache**: เก็บข้อมูลเซสชันใน memory

---

## 🔒 ความปลอดภัยของข้อมูล (Data Security)

### การเข้ารหัสข้อมูล
1. **Password Hashing**: ใช้ bcrypt สำหรับรหัสผ่าน
2. **API Key Encryption**: เข้ารหัส API keys
3. **Sensitive Data**: เข้ารหัสข้อมูลที่สำคัญ

### การควบคุมการเข้าถึง
1. **Role-based Access Control**: ควบคุมการเข้าถึงตามบทบาท
2. **API Authentication**: ใช้ API keys และ JWT tokens
3. **Session Management**: จัดการเซสชันอย่างปลอดภัย

### การตรวจสอบและติดตาม
1. **Audit Logging**: บันทึกการเปลี่ยนแปลงข้อมูล
2. **Access Logging**: บันทึกการเข้าถึงระบบ
3. **Error Logging**: บันทึกข้อผิดพลาดและความผิดปกติ

---

*เอกสารพจนานุกรมข้อมูลนี้สรุปโครงสร้างข้อมูลทั้งหมดของระบบ LannaFinChat ซึ่งเป็นระบบแชตบอตอัจฉริยะสำหรับตอบคำถามจากเอกสาร โดยใช้เทคนิค RAG และ LLM พัฒนาขึ้นเพื่อการศึกษาในระดับปริญญาตรี สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา*
