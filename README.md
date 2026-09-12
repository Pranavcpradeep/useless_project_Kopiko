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
Main chat page loading, with the CAPTCHA gate ("SECURITY CHECK OF WADIYA").

<img width="1917" height="1008" alt="Screenshot 2026-09-12 065503" src="https://github.com/user-attachments/assets/023d99b2-c0c5-43e1-a675-0059db6710b6" />
Main chat page after passing the CAPTCHA — header with Aladeen's portrait, mood badge, voice toggle, propaganda ticker, and "Decree of the Day" banner visible. The floating 🎮 Games button is now clearly visible and clickable in the bottom-left corner.

<img width="1907" height="1002" alt="Screenshot 2026-09-12 065527" src="https://github.com/user-attachments/assets/aadf1490-7d47-47c2-9f53-c29fcc800896" />
Scrolled further down the main chat page, showing the intro message ("SILENCE, PEASANT!"), suggested question buttons, and the message input box. The floating 🎮 Games button (bottom-left) and plant widget (bottom-right) remain fixed on screen regardless of scroll position, confirming they're working as floating overlays.

<img width="1917" height="1011" alt="Screenshot 2026-09-12 065610" src="https://github.com/user-attachments/assets/ff15fd3f-7025-4396-955c-0361ae53723f" />
"Catch Aladeen" game loaded via the sidebar tab, showing Aladeen's portrait centered in the empty arena before any mouse movement, the "WANTED: ALIVE, SMUG, UNCATCHABLE" plaque.

<img width="1917" height="1017" alt="Screenshot 2026-09-12 065631" src="https://github.com/user-attachments/assets/85535a1a-37dc-4107-b63e-b95bbb0c602c" />
"Dodge the Dictator" game in progress. Shows Aladeen (left) and the player (right, smiley face) with hearts, bullets, sun/cloud background, and the live stats bar at the bottom.


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



