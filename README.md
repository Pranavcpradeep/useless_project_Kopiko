<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# Alladeen 🎯


## Basic Details
### Team Name: Kopiko


### Team Members
- Team Lead: Sandra Pradeep - NSS College of Engineering
- Member 2: Pranav C P - NSS College of Engineering

### Project Description
AlladeenGPT is a deliberately useless AI chatbot that refuses to help, roasts you for asking, and loads forever on purpose. Inspired by Admiral General Aladeen from The Dictator (2012), it gives confidently wrong answers, mocks every question, and can even "leave" the conversation when annoyed.

### The Problem (that doesn't exist)
Modern AI assistants are too helpful. They answer politely, apologize for mistakes, and try their best to solve your problems. This is exhausting. What if your AI treated you like an annoying peasant who dared to speak?

### The Solution (that nobody asked for)
We built an AI that:
  Gives confidently wrong answers to every question
  Roasts you personally based on what you ask
  Loads forever with fake "Ministry of Truth" messages
  Tracks a patience meter that drops with every message
  Eventually says "I am leaving." and closes the chat entirely
  Includes useless games (Rock Paper Scissors, Guess the Number) where Alladeen always wins
  Displays a confidence meter that stays at 100% no matter how wrong the answer is
  Has a "Fact-check" button that makes him double down instead of correcting himself
  Gates the first message behind an impossible CAPTCHA
  It is a complete, polished, and aggressively useless product.

## Technical Details
### Technologies/Components Used
For Software
Languages:
  TypeScript
  JavaScript (React)
Frameworks:
  Next.js 16 (App Router)
  React 19
  Tailwind CSS 4
Libraries:
  groq-sdk — AI responses via GPT-OSS models
  drizzle-orm — Type-safe database queries
  @neondatabase/serverless — Serverless Postgres connection
  pg — PostgreSQL driver
  uuid — Session ID generation
  dotenv — Environment variable loading
Tools:
  VS Code — Development environment
  Arena.ai — Initial project scaffolding
  Render — Deployment platforms
  Neon — Serverless Postgres database
GitHub — Version control
Groq API — Free LLM inference


### Implementation
For Software:
# Installation
 Clone the repository
  git clone https://github.com/Pranavcpradeep/useless_project_Kopiko.git
  cd useless_project_Kopiko
 Install dependencies
  npm install
 Create your .env file with:
 GROQ_API_KEY=your_groq_api_key_here
 DATABASE_URL=your_postgres_connection_string

# Run
 Development
  npm run dev
 Production build
  npm run build
  npm start
  Then open http://localhost:3000.

### Project Documentation
For Software:

# Screenshots (Add at least 3)
<img width="1906" height="1016" alt="Screenshot 2026-09-12 065443" src="https://github.com/user-attachments/assets/aa1834c2-f130-4fcd-9653-44e8a3a804d5" />
(Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
User sends a message → API route checks patience & mood → Groq generates a rude response → Response is saved to Postgres → Frontend displays it with fake loading, confidence meter, and mood badge. If patience hits zero, the chat closes.

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*


## Team Contributions
- Sandra Pradeep: [Specific contributions]
- Pranav C P: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



