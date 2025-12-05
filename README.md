# 🎙️ Voice-Enabled Task Tracker

A full-stack, AI-powered Kanban task manager that allows users to create tasks using natural language voice commands. The application intelligently captures audio, transcribes it, and parses actionable structured data (Dates, Priorities, Titles) to streamline task management.

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Overall Flow & Example](#-overall-flow--example)
4. [Architecture](#-architecture)
5. [Tech Stack & Rationale](#-tech-stack--rationale)
6. [Project Structure](#-project-structure)
7. [Local Setup Guide](#-local-setup-guide)
8. [Database Setup](#-database-setup)
9. [API Documentation](#-api-documentation)
10. [Design Decisions & Assumptions](#-design-decisions--assumptions)
11. [AI Tools Usage](#-ai-tools-usage)
12. [Edge Cases Handled](#-edge-cases-handled)

---

## 🔭 Overview
This project solves the friction of manual data entry in task management. Instead of filling out multiple form fields, a user can simply say *"Remind me to submit the tax report by next Friday with high priority,"* and the system handles the rest.

It combines a modern React frontend with a robust Node.js backend, leveraging **AssemblyAI** for industry-leading speech recognition and **Google Gemini** for intelligent entity extraction.

---

## 🚀 Key Features
- **🗣️ Voice-to-Task AI:** Record audio to automatically create tasks with structured metadata.
- **🧠 Intelligent Context Parsing:** Understands relative dates (e.g., "Next Friday", "Tomorrow", "In 3 days") based on the current date.
- **📊 Kanban Board:** Interactive Drag-and-Drop interface (To Do, In Progress, Done).
- **🔎 Advanced Organization:** Global search, Priority filtering, and Column-specific sorting (Date, Name, Priority).
- **⚡ Optimistic UI:** Instant visual feedback for drag-and-drop actions before the server confirms.
- **🔌 Offline Demo Mode:** Automatically falls back to a local simulation if the backend is unreachable.

---

## 🌊 Overall Flow & Example

The application processes voice commands in a 5-step pipeline:

1.  **Record:** The user records a voice command in the browser.
2.  **Transcribe (SST):** The audio blob is sent to **AssemblyAI**, which converts speech to text.
3.  **Analyze (LLM):** The text transcript is sent to **Google Gemini**. The AI analyzes the text relative to *today's date* to extract specific fields.
4.  **Persist:** The structured data is saved to the **PostgreSQL** database.
5.  **Visualize:** The task appears instantly on the Kanban board.

### 📝 Real-World Example
**User Says:** *"Update the client presentation by next Tuesday and mark it as critical."*

**System Processing:**
* **Current Context:** Assume today is Friday, Dec 5th.
* **Transcription:** "Update the client presentation by next Tuesday and mark it as critical."
* **Extraction:**
    * `Title`: "Update the client presentation"
    * `Due Date`: "09-12-2025" (Calculated from "next Tuesday")
    * `Priority`: "Critical"
    * `Status`: "To Do" (Default)

**Result:** A new card appears in the "To Do" column with a red "CRITICAL" badge and a due date of Dec 9th.

---

## 🏗 Architecture
The project follows a standard **MVC (Model-View-Controller)** architecture for the backend and a **Component-Based** architecture for the frontend.

**Data Flow:**
`Frontend UI` → `API Layer` → `Controller` → `AI Services` → `Database`

---

## 💻 Tech Stack & Rationale

### Frontend
- **React (Vite):** Chosen for its component reusability and fast build times.
- **Tailwind CSS (v4):** For rapid, utility-first styling and responsive design.
- **Lucide React:** Lightweight, consistent icon set.

### Backend
- **Node.js & Express:** Specific choice for handling asynchronous API calls to AI services efficiently.
- **PostgreSQL (NeonDB):** Reliable relational database for structured task data.

### AI Services (The Core)
- **AssemblyAI:** Selected for its superior accuracy in Speech-to-Text (SST) compared to browser-native APIs, specifically for handling technical accents and fast speech.
- **Google Gemini 2.5 Flash:** Chosen for its extremely low latency and cost-effectiveness. It excels at specific entity extraction tasks (JSON) compared to larger, slower models.

---

## 📂 Project Structure

```text
task-tracker/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic (Task & Voice)
│   │   ├── routes/         # API Endpoint definitions
│   │   ├── services/       # AI Integration (AssemblyAI + Gemini)
│   │   └── app.js          # Express setup
│   ├── .env.example        # Environment variables template
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Centralized API calls
│   │   ├── components/     # UI Components (TaskCard, Column, Modals)
│   │   ├── App.jsx         # Main application logic
│   │   └── index.css       # Tailwind imports
│   └── vite.config.js      # Build configuration
│
└── database.sql            # Database schema script
```

-----

## 🛠 Local Setup Guide

### 1\. Prerequisites

  - Node.js (v18+)
  - PostgreSQL Database (Local or Cloud like Neon/Supabase)
  - API Keys for **AssemblyAI** and **Google Gemini**

### 2\. Installation

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 3\. Environment Configuration

Create a `.env` file in the `backend/` folder:

```env
PORT=3000
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
ASSEMBLYAI_API_KEY=your_assemblyai_key
GEMINI_API_KEY=your_gemini_key
```

### 4\. Run Application

**Backend:** `npm start` (Runs on port 3000)
**Frontend:** `npm run dev` (Runs on port 5173)

-----

## 🗄 Database Setup

Run the following SQL script in your PostgreSQL database to create the table and trigger.

*Note: Dates are stored as formatted strings to strictly preserve the IST timezone.*

```sql
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'To Do',
    priority VARCHAR(50) DEFAULT 'Medium',
    due_date TEXT, -- Stored as TEXT to force DD-MM-YYYY format
    created_at VARCHAR(20) DEFAULT TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'DD-MM-YYYY HH24:MI:SS'),
    updated_at VARCHAR(20) DEFAULT TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'DD-MM-YYYY HH24:MI:SS')
);

-- Trigger Function to update time on edit
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'DD-MM-YYYY HH24:MI:SS');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_modtime
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
```

-----

## 📡 API Documentation

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Fetch all tasks | - |
| `POST` | `/api/tasks` | Create task | `{ "title": "Fix bug", "priority": "High" }` |
| `PUT` | `/api/tasks/:id` | Update task | `{ "status": "Done" }` |
| `DELETE` | `/api/tasks/:id` | Delete task | - |
| `POST` | `/api/process-voice` | Upload audio | `FormData { audio: Blob }` |

-----

## 💡 Design Decisions & Assumptions

1.  **Date Format Strategy:**

      * **Decision:** We store dates as `DD-MM-YYYY` strings instead of UTC Timestamps.
      * **Reason:** The app is designed for a single-timezone user context (IST). Standard UTC conversion often shifts dates by one day (e.g., Dec 5th 11 PM becoming Dec 6th), which is confusing for personal task management.

2.  **Optimistic UI Updates:**

      * **Decision:** The drag-and-drop interface updates the DOM immediately, then syncs with the DB.
      * **Reason:** Provides a "native app" feel with zero latency. If the backend fails, the UI reverts.

3.  **Strict Context Injection:**

      * **Decision:** We explicitly inject `Today is [Date]` into the Gemini System Prompt.
      * **Reason:** LLMs do not know the current date. Without this, requests like "Due next Friday" return random years or hallucinations.

-----

## 🤖 AI Tools Usage

This project utilized GenAI tools to accelerate development:

  * **Boilerplate Generation:** Used AI to scaffold the initial Express/React folder structure.
  * **Debugging:** Solved specific `undici` / Node 18 fetch header conflicts using AI analysis.
  * **Prompt Engineering:** Used iterative AI testing to refine the JSON extraction prompt, ensuring "Next Friday" logic calculates correctly based on the injected context date.

-----

## ⚠️ Edge Cases Handled

1.  **"Next Friday" Logic:** The system strictly verifies that the calculated date matches the requested day of the week to avoid off-by-one errors.
2.  **Network Failures:** If the backend is down, the Frontend automatically switches to **Demo Mode**, loading mock data so the UI remains reviewable.
3.  **Ambiguous Audio:** If AssemblyAI cannot transcribe audio (silence/noise), the backend returns a clear error, and the UI notifies the user instead of crashing.
4.  **State Persistence:** The Voice Modal preserves the recorded audio even if closed, allowing users to review before processing.
