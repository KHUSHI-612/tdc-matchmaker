# TDC Matchmaker

TDC Matchmaker is a premium matrimonial management application designed for matchmakers to organize client portfolios, evaluate profile matches, calculate compatibility, and draft AI generated introduction pitches.

This project was built to combine modern web design standards with the cultural rules of the Indian matchmaking space.

---

## Technical Architecture

The application is structured as a decoupled full stack application:

* **Frontend**: React (built using Create React App) with Tailwind CSS for layout styling and component rendering.
* **Backend**: Node.js and Express server hosting the API endpoints for data operations and AI integrations.
* **Data Layer**: A local JSON file system database simulating database queries, updates, and profile pool filtering.
* **AI Integration**: Google Gemini API (using the gemini-1.5-flash model) to analyze profiles and write warm, personalized intro pitches.

---

## Key Features

1. **Secure Login**: Session guard with credentials validation (matchmaker@tdc.com / tdc2026), toggle password visibility, and automatic route redirection.
2. **Interactive Dashboard**:
   * Multi-column client grid listing name, age, city, marital status, and active stage.
   * Instant search bar filtering by name, city, or religion.
   * Sidebar navigation with dynamic status filters (Active, Matched, and On Hold).
   * Metric panels showing count summaries of the matchmaker portfolio.
3. **Detailed Customer Profiles**: Shows full demographic, educational, professional, and family biodata.
4. **Matchmaker Console**: Sliding timeline to update client journey stage from Stage 1 to Stage 5, alongside a persistent notes field saved directly to the database.
5. **Matrimonial Matching Engine**:
   * Evaluates compatibility scores out of 100 based on gender-specific rules.
   * Integrates traditional parameters including Gotra check (applying a 15-point penalty for same Gotra matches) and Manglik alignment.
6. **Interactive Email Composer**: Generates pre-written drafts populated with client contacts, match summaries, and AI recommendations.
7. **Local Fallback Engine**: Generates local, structured markdown pitches if the Gemini API key is not configured or fails.

---

## Installation and Setup

### Prerequisites
* Node.js (v16 or higher)
* npm (v8 or higher)

### 1. Server Configuration
Navigate to the server directory:
```bash
cd server
```
Install the backend dependencies:
```bash
npm install
```
Create a `.env` file inside the server directory and add your Google Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
Start the server in development mode:
```bash
npm run dev
```

### 2. Client Configuration
Navigate to the client directory:
```bash
cd ../client
```
Install the frontend dependencies:
```bash
npm install
```
Create a `.env` file in the client folder to define the backend API URL:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
Start the React application:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Core Matchmaking Logic

The matching logic is separated by gender to respect traditional and modern matrimonial expectations:

### For Male Clients
* **Age Match (15 points)**: Candidate must be younger than the client.
* **Income Alignment (15 points)**: Candidate must earn less than the client.
* **Height Alignment (15 points)**: Candidate must be shorter than the client.
* **Family Planning (15 points)**: Views on having children must match exactly.

### For Female Clients
* **Career and Profession (25 points)**: Evaluates candidate income (should be equal or greater) and professional domain synergies (e.g. tech-to-tech or business-to-business).
* **Lifestyle and Values (25 points)**: Checks diet compatibility (Vegetarian, Jain, Non-Vegetarian), personal habits (smoking and drinking), religion, caste, and languages known.
* **Location and Relocation (25 points)**: Rewards living in the same city or mutual openness to relocation.
* **Astro and Demographics (25 points)**: Checks age gap (prefers candidate to be 0 to 5 years older), height (prefers candidate to be taller), and Manglik status.

### Traditional Parameters (Applies to both)
* **Gotra Avoidance**: A strict check for Hindu clients that applies a 15-point penalty and triggers a warning flag if both candidates share the same Gotra.
* **Manglik Matching**: Matches Manglik/Anshik clients with similar profiles, and Non-Manglik clients with Non-Manglik profiles.

---

## AI Implementation and Assumptions

* **AI Prompt Design**: The server sends a structured prompt containing complete profiles of both the client and candidate, along with their calculated compatibility score. Gemini returns a warm proposal layout, divided into career synergy, value matching, astrological analysis, and icebreaker suggestions.
* **Robust Fallback**: If the Gemini API key is missing, the backend defaults to a local rule-based Markdown generator. This ensures that the application is fully testable and responsive in sandbox environments.
* **Matchmaker Role Assumption**: The interface assumes the user is an internal matchmaker managing portfolios. The design displays details, notes, and raw scoring breakdowns that would not be visible on a customer-facing portal.
