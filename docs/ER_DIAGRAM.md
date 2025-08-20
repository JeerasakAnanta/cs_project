# Entity-Relationship (E-R) Diagram สำหรับระบบ LannaFinChat

## ภาพรวมระบบ
ระบบ LannaFinChat เป็นระบบแชตบอตอัจฉริยะสำหรับตอบคำถามจากเอกสาร โดยใช้เทคนิค RAG (Retrieval Augmented Generation) และ LLM (Large Language Models)

## E-R Diagram หลัก

```mermaid
erDiagram
    %% ระบบผู้ใช้ (User Management)
    USERS {
        int id PK
        string email UK
        string username UK
        string hashed_password
        string role
        boolean is_active
    }

    %% ระบบการสนทนา (Conversation Management)
    CONVERSATIONS {
        int id PK
        int user_id FK
        string title
        datetime created_at
    }

    %% ระบบข้อความ (Message Management)
    MESSAGES {
        int id PK
        int conversation_id FK
        string sender
        string content
    }

    %% ระบบข้อเสนอแนะ (Feedback System)
    FEEDBACKS {
        int id PK
        int message_id FK
        string feedback_type
        string comment
        datetime created_at
    }

    %% ระบบการสนทนาสำหรับผู้เยี่ยมชม (Guest Mode)
    GUEST_CONVERSATIONS {
        string id PK
        string machine_id
        string title
        datetime created_at
        datetime updated_at
        boolean is_deleted
    }

    %% ระบบข้อความสำหรับผู้เยี่ยมชม
    GUEST_MESSAGES {
        string id PK
        string conversation_id FK
        string sender
        text content
        datetime timestamp
    }

    %% ระบบเอกสาร (Document Management)
    DOCUMENTS {
        int id PK
        string filename
        string file_path
        string file_type
        int file_size
        datetime uploaded_at
        string status
        text content
    }

    %% ระบบ Embeddings (Vector Database)
    EMBEDDINGS {
        int id PK
        int document_id FK
        string chunk_text
        vector embedding_vector
        int chunk_index
        datetime created_at
    }

    %% ระบบการประมวลผลเอกสาร
    DOCUMENT_PROCESSING {
        int id PK
        int document_id FK
        string status
        datetime started_at
        datetime completed_at
        string error_message
    }

    %% ความสัมพันธ์ระหว่างเอนทิตี้
    USERS ||--o{ CONVERSATIONS : "has"
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    MESSAGES ||--o{ FEEDBACKS : "receives"
    
    GUEST_CONVERSATIONS ||--o{ GUEST_MESSAGES : "contains"
    
    DOCUMENTS ||--o{ EMBEDDINGS : "generates"
    DOCUMENTS ||--o{ DOCUMENT_PROCESSING : "undergoes"
```

## E-R Diagram แบบขยาย (Extended Version)

```mermaid
erDiagram
    %% ระบบผู้ใช้และสิทธิ์
    USERS {
        int id PK "Primary Key"
        string email UK "Unique Email"
        string username UK "Unique Username"
        string hashed_password "Encrypted Password"
        string role "User Role (user/admin)"
        boolean is_active "Account Status"
        datetime created_at "Account Creation Time"
        datetime last_login "Last Login Time"
    }

    %% ระบบการสนทนา
    CONVERSATIONS {
        int id PK "Conversation ID"
        int user_id FK "Reference to User"
        string title "Conversation Title"
        datetime created_at "Creation Time"
        datetime updated_at "Last Update Time"
        string status "Active/Archived"
        int message_count "Total Messages"
    }

    %% ระบบข้อความ
    MESSAGES {
        int id PK "Message ID"
        int conversation_id FK "Reference to Conversation"
        string sender "User/Bot"
        string content "Message Content"
        datetime timestamp "Message Time"
        string message_type
        boolean is_processed
    }

    %% ระบบข้อเสนอแนะ
    FEEDBACKS {
        int id PK "Feedback ID"
        int message_id FK "Reference to Message"
        string feedback_type
        string comment
        datetime created_at
        int rating
        string category
    }

    %% ระบบผู้เยี่ยมชม
    GUEST_CONVERSATIONS {
        string id PK "UUID String"
        string machine_id "Device Identifier"
        string title "Conversation Title"
        datetime created_at "Creation Time"
        datetime updated_at "Last Update Time"
        boolean is_deleted "Soft Delete Flag"
        string session_id "Browser Session"
    }

    %% ระบบข้อความผู้เยี่ยมชม
    GUEST_MESSAGES {
        string id PK "UUID String"
        string conversation_id FK "Reference to Guest Conversation"
        string sender "User/Bot"
        text content "Message Content"
        datetime timestamp "Message Time"
        string message_type
        boolean is_archived
    }

    %% ระบบเอกสาร
    DOCUMENTS {
        int id PK "Document ID"
        string filename "Original Filename"
        string file_path "Storage Path"
        string file_type "PDF/DOC/TXT"
        int file_size "File Size in Bytes"
        datetime uploaded_at "Upload Time"
        string status "Processing Status"
        text content "Extracted Text"
        string checksum "File Hash"
        string source "Upload Source"
    }

    %% ระบบ Embeddings
    EMBEDDINGS {
        int id PK "Embedding ID"
        int document_id FK "Reference to Document"
        string chunk_text "Text Chunk"
        vector embedding_vector "Vector Representation"
        int chunk_index "Chunk Order"
        datetime created_at "Creation Time"
        string chunk_type
        float similarity_score
    }

    %% ระบบการประมวลผลเอกสาร
    DOCUMENT_PROCESSING {
        int id PK "Processing ID"
        int document_id FK "Reference to Document"
        string status "Pending/Processing/Completed/Failed"
        datetime started_at "Processing Start"
        datetime completed_at "Processing End"
        string error_message "Error Details"
        int chunks_created "Number of Chunks"
        float processing_time "Time in Seconds"
        string processor_version "Processing Algorithm Version"
    }

    %% ระบบการค้นหา (Search System)
    SEARCH_QUERIES {
        int id PK "Query ID"
        int user_id FK "Reference to User (Optional)"
        string query_text "Search Query"
        datetime search_time "Search Timestamp"
        string search_type
        int results_count "Number of Results"
        float search_duration "Search Time in Seconds"
    }

    %% ระบบการใช้งาน (Usage Analytics)
    USAGE_ANALYTICS {
        int id PK "Analytics ID"
        int user_id FK "Reference to User (Optional)"
        string action_type
        datetime action_time "Action Timestamp"
        string ip_address "User IP Address"
        string user_agent "Browser Information"
        string session_id "Session Identifier"
        json metadata "Additional Data"
    }

    %% ความสัมพันธ์หลัก
    USERS ||--o{ CONVERSATIONS : "creates"
    USERS ||--o{ SEARCH_QUERIES : "performs"
    USERS ||--o{ USAGE_ANALYTICS : "generates"
    
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    MESSAGES ||--o{ FEEDBACKS : "receives"
    
    GUEST_CONVERSATIONS ||--o{ GUEST_MESSAGES : "contains"
    
    DOCUMENTS ||--o{ EMBEDDINGS : "generates"
    DOCUMENTS ||--o{ DOCUMENT_PROCESSING : "undergoes"
    
    SEARCH_QUERIES ||--o{ EMBEDDINGS : "searches"
```

## คำอธิบายเอนทิตี้หลัก

### 1. **USERS** - ระบบผู้ใช้
- เก็บข้อมูลผู้ใช้ที่ลงทะเบียนในระบบ
- รองรับการกำหนดบทบาท (user/admin)
- มีระบบการยืนยันตัวตนด้วย email และ username

### 2. **CONVERSATIONS** - การสนทนา
- เก็บประวัติการสนทนาของผู้ใช้แต่ละคน
- แต่ละการสนทนามีข้อความหลายข้อความ
- รองรับการตั้งชื่อการสนทนา

### 3. **MESSAGES** - ข้อความ
- เก็บข้อความในแต่ละการสนทนา
- แยกประเภทผู้ส่ง (user/bot)
- รองรับการประมวลผลด้วย RAG

### 4. **FEEDBACKS** - ข้อเสนอแนะ
- เก็บความคิดเห็นของผู้ใช้ต่อข้อความของบอต
- รองรับการให้คะแนนและความคิดเห็น
- ใช้ในการปรับปรุงระบบ

### 5. **GUEST_CONVERSATIONS** - การสนทนาผู้เยี่ยมชม
- รองรับผู้ใช้ที่ไม่ลงทะเบียน
- แยกข้อมูลตามเครื่อง (machine_id)
- มีระบบ soft delete

### 6. **DOCUMENTS** - เอกสาร
- เก็บข้อมูลเอกสารที่อัปโหลด
- รองรับหลายรูปแบบไฟล์
- มีสถานะการประมวลผล

### 7. **EMBEDDINGS** - เวกเตอร์เอกสาร
- เก็บเวกเตอร์ที่ได้จากการประมวลผลเอกสาร
- แบ่งเอกสารเป็นชิ้นเล็กๆ (chunks)
- ใช้ในการค้นหาข้อมูลที่เกี่ยวข้อง

### 8. **DOCUMENT_PROCESSING** - การประมวลผลเอกสาร
- ติดตามสถานะการประมวลผลเอกสาร
- เก็บข้อมูลเวลาและข้อผิดพลาด
- รองรับการประมวลผลแบบ batch

## ความสัมพันธ์หลัก

1. **One-to-Many**: ผู้ใช้หนึ่งคนสามารถมีหลายการสนทนา
2. **One-to-Many**: การสนทนาหนึ่งครั้งมีหลายข้อความ
3. **One-to-Many**: ข้อความหนึ่งข้อความมีหลายข้อเสนอแนะ
4. **One-to-Many**: เอกสารหนึ่งฉบับสร้างหลาย embeddings
5. **One-to-One**: เอกสารหนึ่งฉบับมีหนึ่งการประมวลผล

## ระบบฐานข้อมูลที่ใช้

- **PostgreSQL**: สำหรับข้อมูลผู้ใช้ การสนทนา และข้อความ
- **Qdrant**: สำหรับเก็บ embeddings และการค้นหาเวกเตอร์
- **File System**: สำหรับเก็บไฟล์เอกสาร

## การออกแบบฐานข้อมูล

### หลักการออกแบบ
1. **Normalization**: ลดการซ้ำซ้อนของข้อมูล
2. **Referential Integrity**: ใช้ Foreign Key เพื่อรักษาความถูกต้อง
3. **Indexing**: สร้าง index สำหรับฟิลด์ที่ใช้ค้นหาบ่อย
4. **Soft Delete**: รองรับการลบข้อมูลแบบ soft delete
5. **Audit Trail**: เก็บประวัติการเปลี่ยนแปลงข้อมูล

### การปรับปรุงประสิทธิภาพ
1. **Connection Pooling**: จัดการการเชื่อมต่อฐานข้อมูล
2. **Caching**: ใช้ Redis สำหรับข้อมูลที่เข้าถึงบ่อย
3. **Partitioning**: แบ่งตารางตามช่วงเวลา
4. **Archiving**: ย้ายข้อมูลเก่าไปยังตารางแยก
