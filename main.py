import json
import os
import traceback

from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from google import genai
from google.genai import types

from models import IncidentRequest, IncidentSummary

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
print("API KEY Loaded:", API_KEY is not None)

app = FastAPI()

client = genai.Client(api_key=API_KEY)

PROMPT_TEMPLATE = """
Analyze the following incident log or ticket thread.

Use a Chain of Thought approach:

1. Extract the timeline of events
2. Identify the technical root cause
3. Determine the business or system impact
4. List the immediate actions taken to mitigate the issue

Return ONLY valid JSON in this format:

{{
    "Summary": "Crisp executive summary of the incident",
    "root_cause": "Root cause of Incident",
    "severity": "Low/Medium/High/Critical",
    "impact": "Description of the business or system impact",
    "actions": ["action 1", "action 2", "action 3"],
    "thought_process": "Detailed explanation"
}}

Incident Data:
{incident_data}
"""


@app.post("/summarize")
async def summarize_incident(request: IncidentRequest):
    try:

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=PROMPT_TEMPLATE.format(
                incident_data=request.raw_text
            ),
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        result = json.loads(response.text)

        validated = IncidentSummary.model_validate(result)

        return validated

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))