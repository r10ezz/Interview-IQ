export interface SamplePreset {
  id: string;
  name: string;
  role: string;
  candidateName: string;
  resumeFileName: string;
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  interviewType: 'technical' | 'hr' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'fullstack-engineer',
    name: 'Alex Rivera — Full Stack Engineer',
    role: 'Senior Full Stack Developer (Next.js & Node.js)',
    candidateName: 'Alex Rivera',
    resumeFileName: 'Alex_Rivera_FullStack_Resume.pdf',
    resumeText: `ALEX RIVERA
Full Stack Software Engineer | alex.rivera@example.com | San Francisco, CA | github.com/alexrivera

SUMMARY
Results-oriented Full Stack Engineer with 4+ years of hands-on experience building scalable web applications and microservices. Proven expertise in React, Next.js, TypeScript, Node.js, PostgreSQL, and Docker. Led architectural redesign of an e-commerce platform that reduced API response latency by 45%.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, SQL
- Frontend: React 18, Next.js (App Router), Tailwind CSS, Redux Toolkit, WebSockets
- Backend & Cloud: Node.js, Express, NestJS, REST APIs, GraphQL, PostgreSQL, Redis, Docker, AWS (S3, ECS)
- Testing & Tools: Jest, React Testing Library, Git, GitHub Actions, CI/CD, Vite

PROFESSIONAL EXPERIENCE
Senior Frontend & Full Stack Developer | CloudScale Solutions | 2022 – Present
- Architected and delivered a multi-tenant analytics dashboard serving 120,000+ monthly active users using Next.js 14, TypeScript, and Tailwind CSS.
- Optimized database queries and introduced Redis caching layer, decreasing p95 latency from 850ms to 240ms.
- Built reusable component library adhering to WAI-ARIA accessibility standards, accelerating team feature delivery by 30%.
- Mentored 4 junior engineers and spearheaded automated end-to-end testing with Playwright.

Software Engineer | FinFlow Technologies | 2020 – 2022
- Developed core payment integration services with Stripe and Plaid using Node.js and PostgreSQL.
- Implemented event-driven background job processing pipeline using BullMQ and Redis to handle daily financial reconciliation.
- Refactored legacy monolithic endpoints into modular TypeScript microservices, improving deployment frequency from bi-weekly to daily.

PROJECTS
1. DevFlow Kanban (Real-time Project Management)
- Built collaborative Kanban board using React, Node.js, WebSockets, and PostgreSQL.
- Implemented optimistic UI updates and conflict resolution algorithms for simultaneous edits.
- Tech Stack: React, TypeScript, Node.js, Socket.io, Prisma, PostgreSQL.

2. CodePulse (Developer Telemetry Tool)
- Created open-source CLI and dashboard for monitoring developer commit patterns and test coverage.
- Tech Stack: Next.js, Tailwind CSS, TypeScript, SQLite, Chart.js.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2016 – 2020`,
    jobTitle: 'Senior Full Stack Software Engineer',
    jobDescription: `Company: Apex Technologies
Position: Senior Full Stack Engineer (React, Next.js & Node.js)
Location: Remote / Hybrid

About the Role:
Apex Technologies is looking for a Senior Full Stack Software Engineer to build and scale our high-throughput enterprise SaaS platform. In this role, you will design robust web applications, build performant microservices, and collaborate closely with cross-functional product teams.

Key Responsibilities:
- Design, build, and maintain mission-critical web applications using Next.js, React, and TypeScript.
- Architect high-performance Node.js / NestJS backend services and REST/GraphQL APIs.
- Manage relational databases (PostgreSQL) and implement distributed caching strategies (Redis).
- Champion software engineering best practices including unit testing, CI/CD automation, and code reviews.
- Troubleshoot complex production issues, profiling bottlenecks in both frontend rendering and backend queries.
- Participate in agile sprint planning and mentor junior/mid-level software developers.

Required Qualifications:
- 3+ years of professional full stack software engineering experience.
- Deep proficiency with modern JavaScript/TypeScript, React, and Next.js.
- Strong experience designing RESTful APIs and microservices with Node.js.
- Hands-on experience with SQL databases (e.g. PostgreSQL) and ORMs (Prisma, TypeORM, or Drizzle).
- Familiarity with containerization (Docker) and basic cloud architecture (AWS or GCP).
- Excellent communication skills and ability to articulate technical trade-offs.

Bonus Qualifications:
- Experience with real-time architectures (WebSockets, SSE).
- Familiarity with caching systems like Redis and message queues (BullMQ, Kafka).
- Background in automated testing (Jest, Cypress, or Playwright).`,
    interviewType: 'mixed',
    difficulty: 'intermediate',
  },
  {
    id: 'ai-ml-engineer',
    name: 'Priya Sharma — Machine Learning Engineer',
    role: 'AI / ML Engineer (Python, PyTorch & LLMs)',
    candidateName: 'Priya Sharma',
    resumeFileName: 'Priya_Sharma_AI_ML_Resume.pdf',
    resumeText: `PRIYA SHARMA
AI & Machine Learning Engineer | priya.sharma@example.com | Bengaluru, India | github.com/priyasharma

SUMMARY
Machine Learning Engineer with 3+ years of experience specializing in Natural Language Processing (NLP), Large Language Model (LLM) fine-tuning, and RAG pipelines. Published researcher in automated question answering systems. Expert in Python, PyTorch, Hugging Face, LangChain, and FastAPI.

TECHNICAL SKILLS
- Frameworks & Libs: PyTorch, TensorFlow, Hugging Face Transformers, LangChain, LlamaIndex, Scikit-learn
- Languages: Python, C++, SQL, Bash
- Vector DBs & Search: Pinecone, Qdrant, ChromaDB, FAISS, Elasticsearch
- Data & MLOps: MLflow, Docker, FastAPI, Celery, Kubernetes, AWS SageMaker
- NLP/LLM: BERT, GPT architectures, LoRA fine-tuning, Prompt Engineering, Semantic Search

EXPERIENCE
Machine Learning Engineer | NeuralWorks AI | 2022 – Present
- Built and deployed an enterprise Retrieval-Augmented Generation (RAG) platform on AWS SageMaker, indexing 2M+ legal documents.
- Fine-tuned open-source LLMs (Llama-3-8B and Mistral-7B) using QLoRA, improving task-specific extraction accuracy by 28%.
- Optimized vector search latency to under 35ms using HNSW indexing in Qdrant.
- Engineered guardrails and evaluation metrics using Ragas to measure faithfulness and answer relevancy.

Data Scientist | DataMatrix Analytics | 2021 – 2022
- Developed automated text classification and entity recognition pipelines for customer feedback data.
- Built RESTful inference microservices with FastAPI and Docker, handling 500+ requests per second.

PROJECTS
1. SemanticCode Search: Built code search engine utilizing StarCoder embeddings and FAISS vector indices.
2. MedicalChat: Fine-tuned BioBERT for clinical query classification and symptom triage.

EDUCATION
Master of Computer Applications (MCA) | National Institute of Technology | 2019 – 2021`,
    jobTitle: 'AI Solutions & LLM Engineer',
    jobDescription: `Company: Cognitive Labs
Position: Senior AI / LLM Engineer
Location: Remote

Overview:
We are seeking a talented AI/ML Engineer to lead the design and implementation of next-generation Generative AI applications and automated evaluation pipelines.

Responsibilities:
- Build and optimize production RAG (Retrieval-Augmented Generation) architectures.
- Fine-tune, evaluate, and deploy open-source and proprietary Foundation Models.
- Implement vector databases, semantic search, and hybrid retrieval strategies.
- Design automated LLM evaluation frameworks (measuring hallucinations, latency, relevance).
- Build production-ready inference endpoints using Python and FastAPI.

Requirements:
- 2+ years practical experience with PyTorch and NLP/LLM development.
- Deep understanding of Transformer architecture, embeddings, and attention mechanisms.
- Experience with vector databases (Pinecone, Qdrant, or Milvus) and LangChain/LlamaIndex.
- Strong proficiency in Python, RESTful API design (FastAPI), and Docker.`,
    interviewType: 'technical',
    difficulty: 'advanced',
  },
  {
    id: 'frontend-engineer',
    name: 'Jordan Lee — Frontend Engineer',
    role: 'Frontend UI/UX Engineer (React & TypeScript)',
    candidateName: 'Jordan Lee',
    resumeFileName: 'Jordan_Lee_Frontend_Resume.pdf',
    resumeText: `JORDAN LEE
Frontend UI/UX Engineer | jordan.lee@example.com | Seattle, WA

SUMMARY
Frontend Specialist with 3 years experience building accessible, responsive, and performant web interfaces. Passionate about design systems, web performance, and state management.

SKILLS
React, TypeScript, Next.js, Tailwind CSS, Redux Toolkit, React Query, Webpack, Figma, Jest, Cypress.

EXPERIENCE
Frontend Developer | PixelCraft Studio | 2022 – Present
- Developed custom component system used across 5 client-facing products.
- Improved Core Web Vitals (LCP improved by 35%, CLS reduced to 0.01).
- Collaborated with UX designers to translate complex Figma prototypes into interactive, accessible interfaces.

PROJECTS
- FinView: Real-time stock portfolio tracker with interactive chart visualisations.
- DevDoc: Modern markdown documentation platform with dark mode and search.`,
    jobTitle: 'Frontend Engineer (React & TypeScript)',
    jobDescription: `Company: Vista Media
Role: Frontend Engineer
We need a frontend developer who loves crafting pixel-perfect interfaces with React, Next.js, and TypeScript. You will work on consumer-facing streaming dashboards, focusing on responsive UI, performance optimization, and accessibility.`,
    interviewType: 'mixed',
    difficulty: 'beginner',
  }
];
