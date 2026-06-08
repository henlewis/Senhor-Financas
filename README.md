# Senhor Finanças

An AI-powered financial intelligence platform that helps users track their portfolio, analyse market news, ask portfolio-specific financial questions, and generate professional PDF briefings.

This project was built as a full-stack capstone-style application using a modern React frontend, FastAPI backend, Supabase authentication/database layer, live market data, and OpenAI-powered analysis.

> **Disclaimer:** This project is for educational and portfolio purposes only. It does not provide financial advice.

---

## Project Overview

**Senhor Finanças** is a full-stack AI finance assistant designed to make portfolio monitoring and market intelligence more accessible.

Instead of acting as a basic stock tracker, the platform combines portfolio data, live quotes, financial news, AI reasoning, document upload, and personalised chat into one dashboard.

The core idea is simple:

> A user should be able to add the companies they care about, monitor relevant news, and ask an AI assistant questions that are aware of their portfolio context.

The platform includes:

* User authentication
* Portfolio management
* Live stock quote lookup
* AI-scored market news
* Portfolio-specific impact analysis
* AI chat assistant
* PDF document upload for extra context
* Chat history
* Professional PDF report generation
* Frontend and backend deployment

---

## Live Demo

Project deployment links:

* **Frontend:** https://senhor-financas-v0.vercel.app
* **Backend API:** https://senhor-finan-as-o2yt.onrender.com
* **API Documentation:** https://senhor-finan-as-o2yt.onrender.com/docs

Availability may depend on whether the hosted backend is active.

---

## Key Features

### 1. Portfolio Management

Users can add and remove stock tickers from their portfolio.

For each ticker, the app can display:

* Company name
* Sector
* Industry
* Business summary
* Website
* Currency
* Live quote data
* Daily price change
* Daily percentage change

Portfolio data is stored in Supabase and linked to authenticated users.

---

### 2. Live Stock Quotes

The backend uses `yfinance` to retrieve live or near-live quote information for selected tickers.

Returned quote data includes:

* Ticker symbol
* Latest price
* Price change
* Percentage change
* Currency

The frontend refreshes quote data regularly so users can monitor their holdings from the dashboard.

---

### 3. AI-Powered News Feed

The platform includes a market news feed where fresh news can be fetched, analysed, and stored.

Each news item is processed into a structured format containing:

| Field            | Description                            |
| ---------------- | -------------------------------------- |
| Headline         | Cleaned news headline                  |
| Summary          | AI-generated or processed news summary |
| Sentiment score  | Score from 0 to 100                    |
| Category         | Type of market news                    |
| Affected tickers | Stocks likely affected by the article  |
| Impact           | Positive, neutral, or negative         |
| Impact reason    | Explanation of why the news matters    |
| Risk level       | Low, medium, or high                   |
| Source           | News source                            |
| Link             | Original article URL                   |

This allows the app to move beyond simply showing headlines and instead explain why the news may matter to a specific portfolio.

---

### 4. Portfolio-Specific AI Chat

The chat assistant can answer financial questions using contextual information from the user’s portfolio and the current news feed.

Example questions:

```text
How does the latest Apple news affect my portfolio?
```

```text
Which of my holdings has the highest short-term risk?
```

```text
Summarise the main market risks for my current portfolio.
```

```text
What should I pay attention to before earnings season?
```

The backend builds context from:

* User portfolio tickers
* Latest analysed news
* Uploaded document text
* Previous conversation history

The assistant then produces a more relevant response than a generic chatbot because it has access to the user’s portfolio context.

---

### 5. PDF Document Upload

Users can upload PDF documents through the chat interface.

The backend extracts text from the PDF using `PyPDF2` and passes the extracted text into the AI context window.

This allows the assistant to answer questions about:

* Annual reports
* Financial documents
* Market commentary
* Company filings
* Research notes
* Uploaded PDFs

To manage context size, extracted document text is limited before being sent to the model.

---

### 6. Chat History

The app stores conversations and messages so users can return to previous discussions.

The chat system supports:

* Creating new conversations
* Loading previous conversations
* Storing user messages
* Storing assistant responses
* Linking conversations to authenticated users

This makes the assistant feel more like a real financial workspace rather than a one-off prompt interface.

---

### 7. PDF Report Generation

Users can generate a downloadable PDF market briefing based on selected analysed news items and their portfolio.

Reports are generated using `ReportLab` and include:

* Portfolio overview
* Tracked tickers
* Market insights
* News headlines
* Sentiment scores
* Impact classification
* Impact reasoning

This feature demonstrates how AI analysis can be converted into a professional reporting format.

---

## Tech Stack

### Frontend

| Technology           | Purpose                        |
| -------------------- | ------------------------------ |
| React                | Frontend framework             |
| TypeScript           | Type-safe frontend development |
| Vite                 | Fast frontend build tool       |
| Tailwind CSS         | Styling                        |
| Shadcn UI / Radix UI | Accessible UI components       |
| TanStack Query       | Server-state management        |
| React Router         | Page routing                   |
| Supabase JS          | Authentication client          |
| React Markdown       | Rendering AI responses         |

### Backend

| Technology        | Purpose                         |
| ----------------- | ------------------------------- |
| FastAPI           | Backend API framework           |
| Python            | Backend logic                   |
| Pydantic          | Request and response validation |
| Uvicorn           | ASGI server                     |
| OpenAI API        | AI reasoning and analysis       |
| yfinance          | Stock quote retrieval           |
| DuckDuckGo Search | News and web search             |
| Supabase          | Database and authentication     |
| ReportLab         | PDF report generation           |
| PyPDF2            | PDF text extraction             |
| Langfuse          | LLM tracing and observability   |
| pandas            | Data handling                   |

### Deployment

| Platform | Purpose                   |
| -------- | ------------------------- |
| Vercel   | Frontend deployment       |
| Render   | Backend deployment        |
| Supabase | Auth and database hosting |

---

## System Architecture

The project follows a service-oriented architecture with a separated frontend and backend.

```text
User
  ↓
React + TypeScript Frontend
  ↓
FastAPI Backend
  ↓
Service Layer
  ├── Portfolio Service
  ├── News Service
  ├── Quote Service
  ├── LLM Service
  ├── Chat Service
  └── Reporting Service
  ↓
External Services
  ├── Supabase
  ├── OpenAI
  ├── yfinance
  ├── DuckDuckGo Search
  └── Langfuse
```

The frontend is responsible for the user interface and user interactions, while the backend handles authentication validation, data processing, AI orchestration, financial data retrieval, news analysis, and report generation.

---

## Backend API Overview

The FastAPI backend exposes several API routes.

| Route Group      | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `/api/portfolio` | Add, remove, and retrieve user portfolio holdings    |
| `/api/news`      | Retrieve and refresh AI-analysed market news         |
| `/api/quote`     | Fetch quote data for individual tickers              |
| `/api/chat`      | Chat with the AI assistant and retrieve chat history |
| `/api/reports`   | Generate PDF briefing reports                        |
| `/docs`          | Interactive Swagger API documentation                |

---

## Database Design

The project uses Supabase PostgreSQL.

Main database tables include:

| Table                      | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `portfolios`               | Stores user portfolios                    |
| `portfolio_items`          | Stores ticker holdings for each portfolio |
| `company_profiles`         | Caches company profile metadata           |
| `news_articles`            | Stores processed news articles            |
| `news_ticker_associations` | Links news articles to affected tickers   |
| `conversations`            | Stores chat conversations                 |
| `messages`                 | Stores chat messages                      |

Authentication is handled through Supabase Auth, with row-level security policies used to restrict users to their own data.

---

## AI Workflow

The AI assistant is designed around a context-aware workflow.

```text
User sends message
  ↓
Backend identifies authenticated user
  ↓
Portfolio context is loaded
  ↓
Relevant news context is added
  ↓
Uploaded document context is added if available
  ↓
Prompt is sent to the LLM
  ↓
Assistant response is generated
  ↓
Conversation is saved
  ↓
Response is returned to the frontend
```

This makes the assistant more useful than a generic financial chatbot because the response is grounded in the user’s actual holdings and available market context.

---

## News Analysis Workflow

```text
Fetch raw financial news
  ↓
Analyse each article with AI
  ↓
Extract headline, summary, sentiment, impact, affected tickers, and risk level
  ↓
Store processed news in Supabase
  ↓
Display results in the frontend news feed
  ↓
Use analysed news as context for portfolio chat and PDF reports
```

---

## Project Structure

```text
senhor-finan-as/
│
├── README.md
├── render.yaml
├── docs/
│   └── ARCHITECTURE.md
│
└── finmate-nextjs/
    │
    ├── backend/
    │   ├── api/
    │   │   ├── chat.py
    │   │   ├── news.py
    │   │   ├── portfolio.py
    │   │   ├── quote.py
    │   │   └── reports.py
    │   │
    │   ├── db/
    │   │   ├── client.py
    │   │   ├── schema.sql
    │   │   └── auth_migration.sql
    │   │
    │   ├── models/
    │   │   └── __init__.py
    │   │
    │   ├── services/
    │   │   ├── analysis_service.py
    │   │   ├── chat_service.py
    │   │   ├── llm_service.py
    │   │   ├── news_service.py
    │   │   ├── portfolio_service.py
    │   │   ├── quote_service.py
    │   │   ├── reporting_service.py
    │   │   └── rss_service.py
    │   │
    │   ├── tools/
    │   │   └── search.py
    │   │
    │   ├── dependencies.py
    │   ├── main.py
    │   └── requirements.txt
    │
    └── frontend/
        ├── public/
        │   ├── logo.png
        │   └── senhor-logo.png
        │
        ├── src/
        │   ├── components/
        │   ├── hooks/
        │   ├── lib/
        │   ├── pages/
        │   │   ├── Auth.tsx
        │   │   ├── Chat.tsx
        │   │   ├── Dashboard.tsx
        │   │   ├── Landing.tsx
        │   │   ├── News.tsx
        │   │   └── Portfolio.tsx
        │   │
        │   ├── App.tsx
        │   └── main.tsx
        │
        ├── package.json
        ├── tailwind.config.js
        ├── vite.config.ts
        └── vercel.json
```

---

## Setup Instructions

### Prerequisites

Before running the project, install:

* Node.js 18+
* Python 3.10+
* Supabase account
* OpenAI API key

Optional:

* Langfuse account for LLM tracing
* Render account for backend deployment
* Vercel account for frontend deployment

---

## Backend Setup

Navigate to the backend folder:

```bash
cd finmate-nextjs/backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it.

On macOS/Linux:

```bash
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `finmate-nextjs/backend/`:

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_or_anon_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

Run the backend server:

```bash
uvicorn main:app --reload
```

The backend should run on:

```text
http://localhost:8000
```

API documentation is available at:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

Navigate to the frontend folder:

```bash
cd finmate-nextjs/frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env` file inside `finmate-nextjs/frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Run the frontend development server:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

---

## Supabase Setup

The database schema is included in:

```text
finmate-nextjs/backend/db/schema.sql
```

Authentication and row-level security migration logic is included in:

```text
finmate-nextjs/backend/db/auth_migration.sql
```

To set up the database:

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `schema.sql`.
4. Run `auth_migration.sql`.
5. Add the Supabase URL and key to the backend `.env` file.
6. Add the Supabase client configuration to the frontend if required.

---

## Deployment

### Frontend Deployment

The frontend is designed for deployment on Vercel.

Typical deployment steps:

```bash
cd finmate-nextjs/frontend
npm run build
```

Then deploy the frontend to Vercel and set:

```env
VITE_API_URL=https://your-backend-url.com
```

### Backend Deployment

The backend is configured for Render using:

```text
render.yaml
```

The Render configuration installs backend dependencies and starts the FastAPI app with Uvicorn.

Required Render environment variables:

```env
OPENAI_API_KEY
SUPABASE_URL
SUPABASE_KEY
LANGFUSE_SECRET_KEY
LANGFUSE_PUBLIC_KEY
LANGFUSE_HOST
```

---

## Example User Workflow

1. Create an account or log in.
2. Add stock tickers to the portfolio, such as `AAPL`, `NVDA`, `TSLA`, or `MSFT`.
3. View live price cards and portfolio-level information on the dashboard.
4. Refresh the news feed to fetch and analyse current market headlines.
5. Open the chat page and ask portfolio-specific questions.
6. Upload a PDF document if extra context is needed.
7. Generate a PDF briefing based on the latest news and portfolio holdings.

---

## Skills Demonstrated

This project demonstrates experience with:

* Full-stack web application development
* React and TypeScript frontend development
* FastAPI backend development
* REST API design
* Supabase authentication
* PostgreSQL database design
* Row-level security concepts
* LLM integration
* Prompt and context engineering
* AI-powered news analysis
* Financial data retrieval
* PDF text extraction
* PDF report generation
* Server-state management with TanStack Query
* Frontend routing and protected pages
* Deployment with Vercel and Render
* Environment variable management
* Modern UI design with Tailwind CSS
* Building portfolio-ready software products

---

## My Contribution

My main contribution was focused on the **frontend development, UI/UX design, and data visualisation** side of the project.

This included building and refining user-facing pages such as:

* Landing page
* Dashboard
* Portfolio page
* News page
* Chat interface
* Navigation and layout components
* Interactive cards and modals
* Portfolio visualisation components
* Responsive styling and user experience improvements

I also contributed to connecting frontend components with backend API endpoints and presenting AI-generated financial insights in a clear, user-friendly interface.

---

## Team

* **Abdul** — Lead Developer and Architect, full-stack development and system design
* **Yan** — Backend Developer, API implementation and AI services
* **Henry Lewis** — Frontend Developer, UI/UX design and data visualisation

---

## Limitations

Current limitations include:

* The platform is an educational prototype and should not be used as real financial advice.
* Live quote availability depends on the external data provider.
* News quality depends on available search results and source coverage.
* The AI assistant can make mistakes and should be treated as a decision-support tool, not a financial adviser.
* Backend hosting on free or academic tiers may sleep or experience cold starts.
* The current CORS setup is permissive and should be restricted before production use.

---

## Future Improvements

Potential improvements include:

* Adding portfolio allocation and weighting
* Adding historical portfolio performance charts
* Adding watchlists separate from owned holdings
* Improving source verification and citation display
* Adding SEC filing analysis
* Adding earnings calendar integration
* Adding alert notifications for high-risk news
* Adding backtesting or scenario analysis
* Improving report design with charts and tables
* Adding more advanced portfolio risk metrics
* Adding user-configurable investment preferences
* Improving production security settings

---

## Project Status

MVP completed.

The project includes:

* Deployed frontend
* Deployed backend API
* User authentication
* Portfolio management
* Live quote lookup
* AI-powered news analysis
* AI chat assistant
* PDF upload
* Chat history
* PDF report generation

---

## License

This repository is intended for educational and portfolio purposes.
