# InterviewIQ — AI-Driven Adaptive Mock Interview System

> **MCA Research Project Title:**  
> *"Design and Evaluation of an AI-Driven Adaptive Mock Interview System Using Resume and Job Description Context"*

---

## 📌 Primary Objective & Overview
**InterviewIQ** is an advanced, context-aware mock interview platform built to help candidates prepare for technical and behavioral interviews. By cross-referencing an uploaded **PDF resume** with a **target job description**, the platform:
1. Performs semantic skill extraction and gap analysis.
2. Formulates personalized, role-specific interview questions.
3. Dynamically adapts question difficulty in real time based on candidate answers.
4. Generates research-grade multi-dimensional evaluations with interactive radar visualizations, question critiques, and actionable study roadmaps.

---

## 🛠 Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4 (Dark Navy/Charcoal SaaS aesthetic)
- **AI Engine:** Google Gemini 2.5 Flash (`@google/generative-ai`)
- **PDF Extraction:** `unpdf` (zero-native C++ serverless PDF parser)
- **Data Visualizations:** Recharts (Radar Competency Chart, Question Score Trajectory)
- **Speech Input:** Web Speech API integration
- **Deployment Ready:** Vercel & Node.js 20+

---

## 🚀 Key Features

### 1. Landing Page & Research Framing
- Professional SaaS landing page with dark navy/charcoal foundation and subtle indigo/violet accents.
- Academic research badge and clear breakdown of the 4-stage evaluation methodology.
- 1-click viva/demo fast-track button.

### 2. Context Ingestion & Configuration
- **Drag-and-Drop PDF Upload:** Client and server-side validation (5MB max, PDF type check).
- **Academic Demo Presets:** 1-click loading for *Alex Rivera (Full Stack Engineer)*, *Priya Sharma (AI/ML Engineer)*, and *Jordan Lee (Frontend UI/UX)*.
- **Configurable Parameters:** Interview Domain (*Technical*, *HR*, *Mixed*), Starting Difficulty (*Beginner*, *Intermediate*, *Advanced*), and Interview Length (*3*, *5*, or *7* questions).

### 3. AI Candidate-Job Alignment Dashboard
- **Semantic Fit Index:** Percentage match score based on semantic requirements alignment.
- **Competency Gap Analysis:** Matching skills (green badges) vs. identified skill gaps (amber badges).
- **Detected Projects:** Highlights key initiatives from the resume used to ground practical questions.
- **Targeted Focus Areas:** Recommended technical topics prioritized for the interview.

### 4. Interactive Adaptive Interview Engine
- **Single Question Focus:** Displays one question at a time with category, target skill, and duration guidance.
- **Adaptive Difficulty Tracking:** Dynamically scales difficulty (Beginner ↔ Intermediate ↔ Advanced) according to real-time response quality.
- **Contextual Follow-up Probing:** Generates targeted follow-up questions when candidate answers leave critical trade-offs or edge-cases unaddressed.
- **Voice & Text Inputs:** Integrated Web Speech API speech-to-text with word and character counters.
- **Instant AI Coaching Feedback:** Immediate rubric breakdown and difficulty adjustment notification between questions.

### 5. Final Performance & Competency Dashboard
- **Overall Performance Index:** Weighted 0-100 score with explicit hiring recommendations (*Strong Hire*, *Hire*, *Borderline*, *Not Ready Yet*).
- **5-Dimension Rubric:**
  1. *Overall Performance*
  2. *Technical Correctness*
  3. *Answer Relevance*
  4. *Technical Depth*
  5. *Communication Clarity*
- **Recharts Visualizations:**
  - 5-Dimension Radar Chart (competency profile)
  - Question Score Trajectory Chart (performance arc across rounds)
- **Question-by-Question Deep Dive:** Expandable cards displaying Candidate Answer, Rubric Scores, Evaluator Critique, and **Benchmark Ideal Model Answer**.
- **Actionable Study Roadmap:** High/Medium/Low priority study topics with concrete preparation actions.
- **Export & Print:** Pre-styled printable research report (`window.print()`).

---

## 🔌 Backend API Architecture

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/analyze` | `POST` | Ingests PDF file or text + JD; extracts skills, projects, gaps, and match score. |
| `/api/interview/start` | `POST` | Generates personalized questions based on resume & JD context. |
| `/api/interview/respond` | `POST` | Evaluates answer against 5 criteria, adjusts difficulty, and routes to next/follow-up question. |
| `/api/interview/evaluate` | `POST` | Synthesizes final performance report with radar metrics, question breakdown, and study roadmap. |

> **Graceful Fallback Mode:**  
> If `GEMINI_API_KEY` is not provided or API quota is exceeded, InterviewIQ automatically activates its built-in **Intelligent Offline Evaluator**. This ensures that live academic demonstrations and viva presentations will **never fail or crash**.

---

## 💻 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd interview-iq
npm install
```

### 2. Configure Environment Variables (Optional)
Create a `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can also input your Gemini API Key directly in the UI via the "API Key" modal on the navbar).*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Run API Regression Tests
```bash
# Test all 5 endpoints end-to-end
npm run test:api

# Test PDF multipart parsing
npm run test:pdf
```

---

## 🌐 Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Environment Variables**, add `GEMINI_API_KEY` (optional).
4. Click **Deploy**.
