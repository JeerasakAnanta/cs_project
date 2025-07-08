# PDF Mamagement  System 
- ระบบจัดการรายการเอกสาร ให้กับ Vecter database ใช้งาน การจัดการไฟล์ PDF เปลี่ยนแปลงให้ เก็บอยู่ใน Vecter database

## Overvirw project  
- [PDF Mamagement  System](#pdf-mamagement--system)
  - [Overvirw project](#overvirw-project)
  - [structure Project](#structure-project)
  - [environment setup with uv](#environment-setup-with-uv)
  - [environment variables setup](#environment-variables-setup)
  - [run crate vecter database](#run-crate-vecter-database)
  - [Run Server with scrtipt](#run-server-with-scrtipt)
  - [API EndPointe](#api-endpointe)
  - [Mapping Table Vecter database and PDF files](#mapping-table-vecter-database-and-pdf-files)
##  structure Project  
``` 
.
├── Dockerfile
├── README.md
├── app
│   ├── __init__.py
│   ├── api
│   │   ├── process_pdf.py
│   │   └── routes.py
│   ├── main.py
│   ├── templates
│   │   ├── index.html
│   │   ├── list.html
│   │   └── upload.html
│   └── tests
├── docker-compose.yml
├── pdfs
├── poetry.lock
├── pyproject.toml
├── requirements.txt
├── run_server.sh
└── setup_vecterdb.py
```
- install uv  python management  
```bash 
# On macOS and Linux.
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## environment setup with uv 
```bash
# Create a virtual environment
uv venv 

# Activate the virtual environment
source venv/bin/activate

# Install dependencies 
uv sync 
```
## environment variables setup 
```bash 
cp .env.example .env 
```

- 1.create  vecter database 
## run crate vecter database 
```bash 
uv run 01_setup_vecterdb.py
```
- 2. indexing docs
```bash
uv run 02_indexing.py
```



## Run Server with scrtipt
```bash 
./run_server.sh
```
## API EndPointe 

- `/` : render  HTML  page for update and list  pdf file 
- `/upload` :  Handle PDF file upload. allows users to upload PDF files, which are then processed and stored.
- `/delete/{filename}` : Delete a specified PDF file from local storage.  
- `/files`: List all uploaded PDF files. 
- `/pdflist`: List all uploaded PDF files.
- `/reembedding`: Reembedding all uploaded PDF files. 


## Mapping Table Vecter database and PDF files 
| Collection Name | Description                                            |
| --------------- | ------------------------------------------------------ |
| 01_docs         | ค่าใช้จ่ายในการเดินทางไปราชการ                             |
| 02_docs         | ค่าใช้จ่ายในการฝึกอบรม จัดงาน                               |
| 03_docs         | ค่าใช้จ่ายในการประชุม                                      |
| 04_docs         | ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ                           |
| 05_docs         | ค่าตอบแทนบุคคลหรือคณะกรรมการเกี่ยวกับการจัดซื้อจัดจ้างและบริหารพัสด |
| 06_docs         | ค่าใช้จ่ายในการบริหารงาน                                   |
| 07_docs         | การจัดซื้อจัดจ้างที่มีความจําเป็นเร่งด่วน                          |
| 08_docs         | การจัดหาพัสดุที่เกี่ยวกับค่าใช้จ่ายในการบริหารงาน                  |

