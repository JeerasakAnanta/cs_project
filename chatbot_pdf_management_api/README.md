# PDF Mamagement  System 
- ระบบจัดการรายการเอกสาร ให้กับ Vecter database
## Overvirw project  
- [PDF Mamagement  System](#pdf-mamagement--system)
  - [Overvirw project](#overvirw-project)
  - [structure Project](#structure-project)
  - [environment setup](#environment-setup)
  - [environment variables setup](#environment-variables-setup)
  - [Run Server with scrtipt](#run-server-with-scrtipt)
  - [API EndPointe](#api-endpointe)
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
## environment setup 
```bash 
poetry install 
```
## environment variables setup 

```

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
