# การปรับปรุง Auto-Scroll สำหรับ Chatbot

## ปัญหาที่พบ
- ข้อความใหม่ไม่เลื่อนไปที่ล่างสุดของบทสนทนาอัตโนมัติ
- Auto-scroll ไม่ทำงานอย่างราบรื่น
- ไม่มีการ scroll เมื่อมีการแสดง loading indicator

## การแก้ไขที่ทำ

### 1. สร้างฟังก์ชัน scrollToBottom
```typescript
const scrollToBottom = () => {
  if (chatBoxRef.current) {
    chatBoxRef.current.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }
};
```

### 2. ปรับปรุง useEffect สำหรับ Auto-Scroll
```typescript
useEffect(() => {
  // Scroll to bottom when messages change
  scrollToBottom();
}, [messages]);

useEffect(() => {
  // Scroll to bottom when loading state changes (for typing indicator)
  if (isLoading) {
    scrollToBottom();
  }
}, [isLoading]);
```

### 3. เพิ่ม Smooth Scrolling
```typescript
<div 
  className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth" 
  ref={chatBoxRef}
  style={{ scrollBehavior: 'smooth' }}
>
```

### 4. เพิ่ม Auto-Scroll เมื่อส่งข้อความ
```typescript
const handleSendMessage = async () => {
  // ... existing logic
  
  // Scroll to bottom after adding user message
  setTimeout(() => {
    scrollToBottom();
  }, 100);
  
  await onSendMessage(originalInput);
};
```

### 5. เพิ่ม Auto-Scroll เมื่อคลิกตัวอย่างคำถาม
```typescript
const handleExampleQuestionClick = (text: string) => {
  setUserInput(text);
  // Scroll to bottom when example question is clicked
  setTimeout(() => {
    scrollToBottom();
  }, 100);
};
```

## ผลลัพธ์
- ✅ **ข้อความใหม่เลื่อนไปที่ล่างสุด** อัตโนมัติ
- ✅ **Smooth scrolling** ทำงานอย่างราบรื่น
- ✅ **Auto-scroll เมื่อแสดง loading indicator**
- ✅ **Auto-scroll เมื่อส่งข้อความ**
- ✅ **Auto-scroll เมื่อคลิกตัวอย่างคำถาม**
- ✅ **ไม่มีการกระตุกหรือกระชาก** ของการ scroll

## การทำงานของ Auto-Scroll

### เมื่อใดที่จะเกิด Auto-Scroll:
1. **เมื่อมีข้อความใหม่** - ข้อความจะเลื่อนไปที่ล่างสุดทันที
2. **เมื่อแสดง loading indicator** - จะเลื่อนไปที่ล่างสุดเพื่อแสดง typing indicator
3. **เมื่อส่งข้อความ** - จะเลื่อนไปที่ล่างสุดหลังจากเพิ่มข้อความผู้ใช้
4. **เมื่อคลิกตัวอย่างคำถาม** - จะเลื่อนไปที่ล่างสุดเพื่อแสดง input field

### เทคนิคที่ใช้:
- **Smooth scrolling** - ใช้ `scrollTo` พร้อม `behavior: 'smooth'`
- **setTimeout** - เพิ่ม delay เล็กน้อยเพื่อให้ DOM อัปเดตก่อน scroll
- **Multiple useEffect** - แยกการ scroll ตามเหตุการณ์ต่างๆ
- **CSS scroll-smooth** - เพิ่ม smooth scrolling ใน CSS

## การทดสอบ
1. เปิดแอปพลิเคชัน
2. ส่งข้อความไปยัง chatbot
3. ตรวจสอบว่าข้อความเลื่อนไปที่ล่างสุด
4. ตรวจสอบว่า loading indicator แสดงที่ล่างสุด
5. ตรวจสอบว่าคำตอบของ bot เลื่อนไปที่ล่างสุด
6. ตรวจสอบว่า smooth scrolling ทำงานอย่างราบรื่น

## ไฟล์ที่แก้ไข
- `frontend/src/components/Chatbot.tsx` 