
# ล้านนาฟินแชต (LannaFinChat)
ระบบแชตบอตถาม-ตอบจากเอกสารราชการด้วยเทคนิค RAG และ LLM

## 🔎 ภาพรวมโครงการ
โครงการนี้เป็นการพัฒนาแชตบอตสำหรับตอบคำถามจากเอกสารราชการ (คู่มือปฏิบัติงานการเบิกจ่ายค่าใช้จ่ายของ มทร.ล้านนา) โดยใช้เทคโนโลยี LLM (Large Language Model) ร่วมกับเทคนิค RAG (Retrieval Augmented Generation) เพื่อให้ได้คำตอบที่ถูกต้องและตรงประเด็น

จุดเด่นของระบบนี้
- ใช้โมเดล LLM (OpenAI GPT-4o-mini) ผสานกับ RAG เพื่อค้นหาข้อมูลจากฐานข้อมูลเวกเตอร์ (Qdrant)
- อินเทอร์เฟซเว็บใช้งานง่าย ผ่านเว็บ  เชื่อมต่อกับระบบหลังบ้านผ่าน FastAPI
- มีระบบวิเคราะห์ข้อมูลและจัดการเอกสาร 

## 🔑 คุณสมบัติหลัก
- สนทนากับแชตบอตผ่านหน้าเว็บ
- ระบบ API หลังบ้าน (FastAPI)
- ระบบจัดการและประมวลผลเอกสาร PDF
- แสดงและจัดการฐานข้อมูลเวกเตอร์ (Qdrant)

## 🛒 สิ่งที่ต้องเตรียม
- Python 3.12.3
- โมเดล LLM (OpenAI API หรือ Ollama)

  * [OpenAI API](https://platform.openai.com)
  * [Ollama](https://ollama.com/)
* [Langchain](https://www.langchain.com/)
* [FastAPI](https://fastapi.tiangolo.com/)
* [Node.js](https://nodejs.org/en)
* [Vite](https://vitejs.dev/)
* [React TypeScript](https://react.dev/)
* [Docker Engine](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

## ขั้นตอนที่ 1: ⬇️ โคลนโครงการ

สามารถโคลนโค้ดจาก [GitHub](https://github.com/JeerasakAnanta/cs_project) ได้ด้วยคำสั่ง:

```bash
git clone https://github.com/JeerasakAnanta/cs_project
cd cs_project
```

## ขั้นตอนที่ 2: 📦 สร้าง Virtual Environment ด้วย `uv`

* ติดตั้ง `uv` จากเอกสาร:

```bash
https://docs.astral.sh/uv/getting-started/installation/
```

* สร้างและใช้งาน Virtual Environment:

```bash
uv venv
uv activate
```

## ขั้นตอนที่ 4: ⚙ ตั้งค่าตัวแปรสภาพแวดล้อม `.env`

* คัดลอกไฟล์ตัวอย่าง `.env.example` ไปยัง `.env`:

```bash
cp .env.example .env
cp .env.example chatbot_web/.env
```

## ขั้นตอนที่ 5: 🗂 สร้างฐานข้อมูลเวกเตอร์ด้วย Qdrant

* แก้ไข `docker-compose.yml` เพื่อตั้งค่าระบบ Qdrant ตามตัวอย่างที่ให้ไว้
* เริ่มระบบ Qdrant:

```bash
docker compose up -d
docker ps -a
```

* สร้างโฟลเดอร์ `pdfs` ใน `chatbot_pdf_management_api` และอัปโหลดไฟล์ PDF เข้าไป
* สร้าง collection ด้วยคำสั่ง:

```bash
python3 chatbot_pdf_management_api/create_vecter_db.py
```

## ขั้นตอนที่ 6: เริ่มต้นระบบระหว่างการพัฒนา

* ติดตั้ง npm:

```bash
sudo apt install npm
```

* เริ่มระบบ Frontend `/chatbot_web/`:

```bash
npm run dev
```

* เริ่ม API สำหรับแชตบอต:

```bash
uvicorn chatbot_api:app --host 0.0.0.0 --port 8003 --reload
```

* เริ่ม API สำหรับจัดการ PDF:

```bash
uvicorn pdf_management_api:app --host 0.0.0.0 --port 8004 --reload
```

## ขั้นตอนที่ 6 (ทางเลือก): การรันด้วย Docker

* ใช้สคริปต์สร้าง Docker image:

```bash
chmod +x run_build_image.sh 
./run_build_image.sh
```

## พอร์ตสำหรับเข้าถึงระบบ

* Web Chatbot UI: [http://localhost:8002](http://localhost:8002)
* Chat API: [http://localhost:8003](http://localhost:8003)
* ระบบจัดการ PDF: [http://localhost:8004](http://localhost:8004)
* Qdrant Vector DB: [http://localhost:6333](http://localhost:6333)
* Static Web: [http://localhost:8085](http://localhost:8085)

---

## 🧪 ตัวอย่างการปรับจูน (Fine-Tuning) ระบบ RAG

### การปรับ System Prompt

```python
prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
        you are a helpful assistant. please answer the question based on the context below.
    {context}
    original: {question}
    """,
)
```

### การปรับจูนโมเดล LLM

```python
llm = ChatOpenAI(
    _deployment="gpt-4o-mini",
    api_version="2023-06-01-preview",
    temperature=0.2,
    max_tokens=5000,
    timeout=None,
    max_retries=2,
)
```

### การใช้ RAG

```python
return ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(...),
    retriever=qdrant_store.as_retriever(
        search_type="similarity", search_kwargs={"k": 6, "score_threshold": 0.4}
    ),
    combine_docs_chain_kwargs={"prompt": prompt},
    return_source_documents=True,
)
```

---

## 🆕 ฟีเจอร์ของระบบ

### 🌐 Web ChatBot

* `/` หน้าแชตหลัก
* `/pdflist` รายการเอกสารทั้งหมด
* `/management` จัดการเอกสาร
* `/upload` อัปโหลด PDF เพื่อแปลงเป็นเวกเตอร์
* `/list` รายการเอกสาร
* `/about` ข้อมูลเกี่ยวกับระบบ

### 🚧 API Endpoint

#### 🔗 Chatbot API

* `/api/` : หน้าหลัก
* `/api/chat` : ส่งข้อความถามแชตบอต
* `/api/history` : ดูประวัติแชต
* `/api/clear-history` : ล้างประวัติแชต

#### 📚 Chatbot PDF Management API

* `/` : หน้าหลัก
* `/upload` : อัปโหลดไฟล์
* `/delete/{filename}` : ลบไฟล์
* `/files` : รายการไฟล์ PDF
* `/pdflist` : รายการไฟล์ทั้งหมด
* `/reembedding` : ทำ embeddings ใหม่

---

## 🚩 Sequence diagram 
```mermaid
---
title: User Interaction Chatbot
---
sequenceDiagram
  actor User  
  participant Website Interface
  participant Backend Service
  participant LLM Service
  participant RAG Service
  participant Vector Database 
  User ->> Website Interface: Ask Chatbot
  activate Website Interface

  Website Interface ->> Backend Service: Send request to backend
  activate Backend Service

  Backend Service ->> LLM Service: Use LLM Service  
  activate LLM Service

  LLM Service ->> OpenAI: Request embedding model  
  activate OpenAI
  OpenAI -->> LLM Service: Return embedding  
  deactivate OpenAI

  LLM Service ->> RAG Service: Retrieval
  activate RAG Service 

  RAG Service ->> Vector Database: Vector search 
  activate Vector Database

  Vector Database -->> RAG Service: Return similarity
  deactivate Vector Database 

  RAG Service ->> LLM Service: LLM + Prompt  
  deactivate RAG Service 

  LLM Service -->> Backend Service: Return LLM response
  deactivate LLM Service 

  Backend Service -->> Website Interface: Response from backend  
  deactivate Backend Service
  ```

## 🏗 Project Structure

```mermaid
---
title :  Docker Image  Project Structure  
---   
  graph LR

    A[Web ChatBot UI
       chatbot_webui_cs_project:0.1.0
      ]

    B[chatBot API
      chatbot_api_cs_project:0.1.0]

    C[PDF Management
    chatbot_pdf_management_api:0.1.0
    ]

    F[Vecter DataBase 
      qdrant/qdrant]

    G([Stati Web])
    
    OpenAI([Opnai API  Service])

    A<-->B 
    A<-->C
    A<-->G
    A<-->opnai
    B<-->opnai
    C<-->opnai
    opnai <-->OpenAI
    C<-->F
    B<-->F
```

## ✈ เวอร์ชันของโปรเจกต์

### 🕸 Web GUI

* เวอร์ชัน 0.1.0

### 🔗 ChatBot API

* เวอร์ชัน 0.1.0

### 📑 PDF Management API

* เวอร์ชัน 0.1.0

---

## 👷‍♂️ ผู้พัฒนา

* เริ่มพัฒนาโครงการเมื่อ 1 ธันวาคม 2567 ถึง 2568
* เจียระศักดิ์ อนันตะ (นักศึกษาวิทยาการคอมพิวเตอร์ RMUTL และผู้เข้าร่วมโครงการ Super AI Engineer Season 4)
* ติดต่ออีเมล: [jeerasakananta@gmail.com](mailto:jeerasakananta@gmail.com)

---

## 🔃 แหล่งอ้างอิง

* LangChain
* OpenAI API
* Qdrant
* Retrieval-Augmented Generation (RAG)
* Uvicorn
* FastAPI
* Prompt Engineering Guide
* Docker Engine & Compose

---
## 📝 การอนุญาตให้ใช้งาน (License)
- โครงการ LannaFinChat: ระบบแชตบอตถาม-ตอบจากเอกสารด้วยเทคนิค RAG และ LLM นี้ อยู่ภายใต้สัญญาอนุญาตแบบ MIT License พัฒนาขึ้นเพื่อวัตถุประสงค์ทางการศึกษา ภายใต้หลักสูตรวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์และเทคโนโลยีการเกษตร มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา (RMUTL)