# Components Structure

โครงสร้างการจัดหมวดหมู่ Components ใหม่ที่ได้รับการปรับปรุงเพื่อให้เป็นระเบียบและใช้งานง่าย

## 📁 โครงสร้างโฟลเดอร์

```
src/components/
├── common/           # Components ที่ใช้ร่วมกัน
│   ├── ui/           # UI Components พื้นฐาน
│   │   ├── LoadingSpinner.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── TypingIndicator.css
│   │   ├── ThemeToggle.tsx
│   │   └── index.ts
│   ├── layout/       # Layout Components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   ├── feedback/     # Feedback & Alert Components
│   │   ├── CustomAlert.tsx
│   │   ├── FeedbackSystem.tsx
│   │   └── index.ts
│   └── index.ts
├── auth/             # Authentication Components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── PrivateRoute.tsx
│   ├── GuestRoute.tsx
│   ├── GuestMode.tsx
│   └── index.ts
├── admin/            # Admin Panel Components
│   ├── AdminPanel.tsx
│   ├── ArchivedChats.tsx
│   ├── ConversationAnalytics.tsx
│   ├── ConversationDetail.tsx
│   ├── ConversationDetail.css
│   ├── ConversationSearch.tsx
│   ├── ConversationSearch.css
│   ├── Playground.tsx
│   ├── Settings.tsx
│   ├── StatisticsCharts.tsx
│   ├── SystemStatistics.tsx
│   ├── MachineManagement.tsx
│   ├── Management.tsx
│   ├── UserManager.tsx
│   └── index.ts
├── chat/             # Chat & Communication Components
│   ├── Chatbot.tsx
│   ├── TypingTest.tsx
│   └── index.ts
├── pdf/              # PDF Management Components
│   ├── Pdfcrud.tsx
│   ├── PdfList.tsx
│   ├── PDFManager.tsx
│   ├── Uploadpdf.tsx
│   └── index.ts
├── survey/           # Survey & Feedback Components
│   ├── SatisfactionSurvey.tsx
│   ├── SurveyButton.tsx
│   ├── SurveyDemo.tsx
│   ├── SURVEY_README.md
│   ├── SURVEY_SUMMARY.md
│   ├── SURVEY_USAGE_EXAMPLE.md
│   └── index.ts
├── pages/            # Page Components
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Pagenotfound.tsx
│   └── index.ts
├── Admin.tsx         # Root Level Components
├── AdminDashboard.tsx
├── AdminRoute.tsx
└── index.ts          # Main Export File
```

## 🎯 หมวดหมู่ Components

### **Common Components**

- **UI**: Components พื้นฐานที่ใช้ทั่วทั้งแอป
- **Layout**: Components สำหรับโครงสร้างหน้าเว็บ
- **Feedback**: Components สำหรับแสดงผลตอบกลับและแจ้งเตือน

### **Auth Components**

- Components สำหรับการยืนยันตัวตนและการจัดการผู้ใช้

### **Admin Components**

- Components สำหรับหน้าจัดการระบบและผู้ดูแล

### **Chat Components**

- Components สำหรับระบบแชทและการสื่อสาร

### **PDF Components**

- Components สำหรับการจัดการไฟล์ PDF

### **Survey Components**

- Components สำหรับระบบสำรวจและประเมินความพึงพอใจ

### **Pages Components**

- Components สำหรับหน้าต่างๆ ของเว็บไซต์

## 📦 การใช้งาน

### Import แบบใหม่ (แนะนำ)

```typescript
// Import จากหมวดหมู่
import { Navbar, ErrorBoundary } from './components/common';
import { Login, Register } from './components/auth';
import { Chatbot } from './components/chat';
import { PDFManager } from './components/pdf';

// Import ทั้งหมดจากหมวดหมู่
import * as AdminComponents from './components/admin';
```

### Import แบบเก่า (ยังใช้ได้)

```typescript
// Import โดยตรง
import Navbar from './components/common/layout/Navbar';
import Login from './components/auth/Login';
```

## ✅ ประโยชน์ของการจัดระเบียบใหม่

1. **ความชัดเจน**: แต่ละหมวดหมู่มีหน้าที่ชัดเจน
2. **การบำรุงรักษา**: หาและแก้ไข components ได้ง่ายขึ้น
3. **การนำกลับมาใช้**: Components ที่เกี่ยวข้องอยู่ใกล้กัน
4. **การขยายระบบ**: เพิ่ม components ใหม่ได้ง่าย
5. **การทำงานเป็นทีม**: ทีมงานเข้าใจโครงสร้างได้ง่ายขึ้น

## 🔄 การย้าย Components

Components ทั้งหมดได้รับการย้ายไปยังหมวดหมู่ที่เหมาะสมแล้ว และ import paths ได้รับการอัปเดตแล้ว

## 📝 หมายเหตุ

- ไฟล์ CSS ที่เกี่ยวข้องจะอยู่ใกล้กับ component ที่ใช้งาน
- Index files ช่วยให้การ import สะดวกขึ้น
- โครงสร้างนี้รองรับการขยายระบบในอนาคต
