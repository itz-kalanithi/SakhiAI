# SakhiAI (சகிAI / सखीAI) 🌸

> **“A voice-first AI assistant that removes language, literacy and navigation barriers for women to access education, government schemes, rights information and emergency assistance.”**

SakhiAI is not an ordinary chatbot. It is a **voice-controlled navigation and assistance layer** designed specifically for women with limited reading literacy, digital apprehension, or regional language preferences across India.

---

## 🌟 Key Pillars & Features

### 1. 🎙️ Voice-First Architecture
- **Speech-to-Text & Spoken Feedback**: Speaks directly to the user upon launch and receives answers through voice.
- **Voice Navigation**: Say *"Open education"*, *"Show me government schemes"*, *"Teach me mathematics"*, *"I need help"*, *"Where is the nearest police station?"*, or *"Go back"*.
- **Zero Literacy Requirement**: Every major section, explanation, card, and action includes a `SpeakButton` (🔊) so anything can be heard aloud.

### 2. 🤖 Google Gemini AI Engine
- **Intent Recognition & Extraction**: Parses complex natural language requests into structured navigation intents or form inputs.
- **Bilingual & Multilingual Generation**: Generates simple, relatable explanations (e.g. comparing photosynthesis to cooking on a stove, or explaining why receiving UPI money never needs a PIN).
- **Environment & In-App API Key Support**: Supports `VITE_GEMINI_API_KEY` via `.env` or direct configuration via the settings modal.
- **Intelligent Contextual Fallback**: When offline or if an API key is not configured, SakhiAI seamlessly runs with verified domain intelligence so demos never fail.

### 3. 🌐 7 Indian Regional Languages
- **Tamil (தமிழ்)**
- **Telugu (తెలుగు)**
- **Hindi (हिन्दी)**
- **Malayalam (മലയാളം)**
- **Kannada (ಕನ್ನಡ)**
- **Bengali (বাংলা)**
- **English**

### 4. 📍 Transparent Location & Emergency SOS
- **Emergency Button (🚨 SOS)**: Instant 1-tap dial for **112** (National Emergency), **181** (Women Helpline), **1091** (Women in Distress), **1098** (Childline), and **15100** (Free Legal Aid).
- **Nearby Police Stations & Sakhi One Stop Crisis Centers (OSCs)**: Calculates real-time distances with direct call buttons and Google Maps directions.
- **Live GPS Sharing**: Generates instant WhatsApp / SMS emergency links with exact Google Maps coordinates.

### 5. 🏛️ Government Schemes & Conversational Application
- Verified Central and State schemes:
  - *Pradhan Mantri Matru Vandana Yojana (PMMVY)* - ₹5,000 to ₹6,000 maternity benefit
  - *Mahila Samman Savings Certificate (MSSC)* - 7.5% guaranteed interest
  - *Sukanya Samriddhi Yojana (SSY)* - 8.2% girl child fund
  - *Stand-Up India & Women Mudra Loan* - Collateral-free entrepreneurship loans
  - *PM Ujjwala Yojana 2.0* - Free LPG gas connection
  - *State Schemes* - Pudhumai Penn (Tamil Nadu), Gruha Lakshmi (Karnataka)
- **Voice-Driven Form**: AI asks: *"What is your full name?"*, *"What is your age?"*, *"What is your Aadhaar/Ration number?"*, formats the review screen, asks for explicit confirmation, and transparently guides to official portals.

### 6. ⚖️ Know Your Rights & Voice Complaint Interview
- Indian legal protections: Domestic Violence Act (PWDVA 2005), Workplace Harassment (POSH Act 2013), Right to Zero FIR, and Free Legal Aid (NALSA Section 12).
- **Complaint Voice Interview**: AI conducts a structured interview (*"What happened?"*, *"When?"*, *"Where?"*, *"Who was involved?"*, *"Do you have evidence?"*), compiles a printable FIR draft, and directs the user to NCW and Cybercrime portals.

---

## 🚀 Running the Project

```bash
cd C:\Users\muthu\.gemini\antigravity\scratch\sakhiai

# Install dependencies (already installed)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Dev Server URL: `http://localhost:5173/`

---

## 📱 Mobile-First Design
SakhiAI is responsive across all devices and optimized for single-thumb mobile usage with large touch targets (minimum 48px), high contrast, and animated voice waveform ripples.
