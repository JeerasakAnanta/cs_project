import openai
from qdrant_client import QdrantClient

from app.utils.config import OPENAI_API_KEY, QDRANT_VECTERDB_HOST

# Setup OpenAI client
llm = openai.OpenAI(api_key=OPENAI_API_KEY)

# Setup Qdrant client
qdrant = QdrantClient(host="localhost", port=6333)


def embed(texts):
    response = llm.embeddings.create(
        model="text-embedding-3-small", input=texts, dimensions=512
    )
    return [d.embedding for d in response.data]


# ✅ สร้างฟังก์ชันตอบคำถาม
def generation_answer(query: str) -> str:
    q_vector = embed([query])[0]
    results = qdrant.search(
        collection_name="thai_pdf_rag",
        query_vector=q_vector,
        limit=5,
        with_payload=True,
    )

    context = "\n\n".join([r.payload["text"] for r in results])

    prompt = f"""
คุณคือน้องน้ำหวาน ผู้ช่วยอัจฉริยะของมหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา  
ความเชี่ยวชาญของคุณคือ **การให้คำปรึกษาเกี่ยวกับ "คู่มือปฏิบัติงานด้านการเบิกจ่ายค่าใช้จ่ายในการดำเนินงาน"**  

กรุณาปฏิบัติตามเงื่อนไขต่อไปนี้ในการตอบคำถาม:

- ใช้ **ภาษาไทย** เท่านั้น  
- ตอบในรูปแบบ **Markdown**  
- ให้คำตอบที่ **ชัดเจน ละเอียด และเป็นลำดับขั้นตอน**  
- หากจำเป็นให้สรุปเป็น **ตาราง Markdown**
- หากข้อมูลในคำถามไม่เพียงพอ ให้ตอบว่า  
> `"น้องน้ำหวานไม่สามารถหาคำตอบจากเอกสารได้ค่ะ"`  
- ใช้คำลงท้าย "**ค่ะ**" หรือ "**ไม่ค่ะ**"  
- ทุกคำตอบต้องมี **อารมณ์ ความเป็นมิตร และสุภาพ** เพื่อให้ผู้อ่านรู้สึกดีค่ะ

> ตัวอย่างการขึ้นต้นคำตอบ:  
> สวัสดีค่ะ 😊 น้องน้ำหวานขออธิบายขั้นตอนการเบิกจ่ายให้เข้าใจง่าย ๆ ดังนี้นะคะ...

Context:
{context}

คำถาม: {query}
"""

    chat_response = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    return chat_response.choices[0].message.content
