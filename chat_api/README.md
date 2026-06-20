# Chatbot API

## 🔍Overview  
- This project focuses on developing a back-end API using Python 3 and Fast API, while integrating Langchain to leverage the RAG (Retrieval-Augmented Generation) model. The RAG model is either hosted on OpenAI or open-sourced LLM, each with LLama3, to create a chatbot API.

## 🏃‍♂️ How to run  
-  
## 🔑Key Features
  - Back End API: Fastapi
  - LangChain: creat app with LLM
  - OpenAI API 
  - Local LLM (Ollama) 

## 🔚 API end Point 
  - `/api/`: Root endpoint to welcome users to the chatbot API.  
  - `/api/chat`: API for chatbot interaction. Receives user query and responds with chatbot-generated answer.
  - `/api/chat_streaming`:chat bot streaming 
  - `/api/history`: get char history  
  - `/api/clear-history`:  clear chat history.
  
## Structure project
### project tree  
```
.
├── Dockerfile
├── README.md
├── app
│   ├── __init__.py
│   ├── main.py
│   └── routers
│       └── __init__.py
├── build_docker.sh
├── chatbot_api.py
├── log
│   └── app.log
├── pyproject.toml
├── uv.lock
├── run_api.sh
└── tests
    └── __init__.py
```
### 🚩 Sequence diagram

```mermaid
---
title : user interaction chatbot 
---
sequenceDiagram
    actor user  
    participant Website Interface
    participant backend Service
    
    user ->> Website Interface : Ask ChatBot
    activate Website Interface
    Website Interface ->>  backend Service : Sent req to backend

    activate  backend Service
    backend Service -->> Website Interface :res
    deactivate backend Service
    Website Interface -->>  user : answer
    deactivate  Website Interface

``` 
### Project Structure

```mermaid
---
title : Docker Image  Project Structure  
---   
  graph LR

    A[chatbot_api_cs_project : 0.1.0]
```

## Verstion 
- 0.1.0 initial  chatbot API