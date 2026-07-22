Incident Report Summarizer

An AI-powered Incident Report Summarizer built with Python, FastAPI, and the Google Gemini API. The application analyzes incident logs and generates structured summaries by extracting the timeline, identifying the root cause, assessing severity and impact, and listing mitigation actions.

🚀 Features
AI-powered incident report summarization using Google Gemini
Extracts key incident details:
Executive summary
Timeline of events
Root cause
Severity level
Business/System impact
Mitigation actions
Returns responses in structured JSON format
REST API built with FastAPI
Input and output validation using Pydantic
Environment variable support using python-dotenv

🛠️ Tech Stack
Backend: FastAPI
Programming Language: Python
AI Model: Google Gemini API
Validation: Pydantic
Environment Management: python-dotenv
Version Control: Git & GitHub

🧠 How It Works
User submits an incident report through the REST API.
The application sends the report to the Google Gemini model using a carefully designed prompt. Gemini analyzes the incident and generates a structured JSON response. The response is validated using Pydantic before being returned to the user.

📦 Dependencies
FastAPI
Uvicorn
Google Generative AI SDK (google-genai)
Pydantic
python-dotenv

pip install -r requirements.txt

🎯 Future Enhancements
Support for PDF, DOCX, and log file uploads
Authentication and API security
Incident severity prediction using machine learning
Interactive web interface with Streamlit
Incident history and analytics dashboard