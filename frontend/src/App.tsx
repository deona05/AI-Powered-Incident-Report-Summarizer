import { useState, type FormEvent } from "react";

interface IncidentSummary {
  Summary: string;
  root_cause: string;
  severity: string;
  impact: string;
  actions: string[];
  evidence: string;
}

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8765"
).replace(/\/+$/, "");

function getErrorMessage(status: number): string {
  if (status === 429) {
    return "The summarizer has reached a request limit. Please wait a while and try again.";
  }
  if (status === 503) {
    return "The summarizer is temporarily unavailable. Please try again shortly.";
  }
  return `The summarizer returned an error (HTTP ${status}). Please try again.`;
}

export default function App() {
  const [report, setReport] = useState("");
  const [result, setResult] = useState<IncidentSummary | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${apiBaseUrl}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: report }),
      });

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status));
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again.",
        );
      }
      if (!isIncidentSummary(data)) {
        throw new Error(
          "The server returned a response in an unexpected format. Please try again.",
        );
      }
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not reach the summarizer. Check that the backend is running and try again."
          : requestError instanceof Error
            ? requestError.message
            : "Something went wrong while summarizing the report. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setReport("");
    setResult(null);
    setError("");
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Incident Report Summarizer home">
          <span>Incident Desk</span>
        </a>
        <span className="topbar-note">Evidence-based incident summaries</span>
      </header>

      <div className="content">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">INCIDENT RESPONSE</p>
          <h1 id="page-title">Incident Report Summarizer</h1>
          <p className="intro-copy">
            Turn an incident report into a clear summary of what happened,
            impact, and actions taken.
          </p>
        </section>

        <form className="report-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <label htmlFor="incident-report">Incident report</label>
              <p id="report-hint">Paste the report or incident notes below.</p>
            </div>
            <span className="input-badge">TEXT INPUT</span>
          </div>
          <textarea
            id="incident-report"
            name="incident-report"
            value={report}
            onChange={(event) => setReport(event.target.value)}
            placeholder="Paste an incident report here, including any timeline, impact, root cause, or actions taken..."
            aria-describedby="report-hint"
            aria-invalid={Boolean(error)}
            aria-required="true"
            disabled={isLoading}
          />
          {error && (
            <p className="error-message" role="alert">
              <span aria-hidden="true">!</span>
              {error}
            </p>
          )}
          <div className="form-footer">
            <p className="privacy-note">
              Include only information you are authorized to share.
            </p>
            <div className="button-group">
              <button
                className="button button-secondary"
                type="button"
                onClick={handleClear}
                disabled={isLoading || (!report && !result && !error)}
              >
                Clear
              </button>
              <button
                className="button button-primary"
                type="submit"
                disabled={isLoading || !report.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Summarizing…
                  </>
                ) : (
                  <>
                    Summarize Incident
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {isLoading && (
          <p className="loading-message" role="status" aria-live="polite">
            Reading the report and preparing your summary…
          </p>
        )}

        {result && (
          <section className="results" aria-labelledby="results-title" aria-live="polite">
            <div className="results-heading">
              <div>
                <p className="eyebrow">ANALYSIS</p>
                <h2 id="results-title">Incident summary</h2>
              </div>
              <span className="severity-badge">{result.severity}</span>
            </div>

            <article className="result-card summary-card">
              <h3>Summary</h3>
              <p>{result.Summary}</p>
            </article>

            <div className="result-grid">
              <article className="result-card">
                <h3>Root cause</h3>
                <p>{result.root_cause}</p>
              </article>
              <article className="result-card">
                <h3>Impact</h3>
                <p>{result.impact}</p>
              </article>
              <article className="result-card actions-card">
                <h3>Actions taken</h3>
                {result.actions.length > 0 ? (
                  <ul>
                    {result.actions.map((action, index) => (
                      <li key={`${index}-${action}`}>{action}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No actions were reported.</p>
                )}
              </article>
              <article className="result-card">
                <h3>Evidence</h3>
                <p>{result.evidence}</p>
              </article>
            </div>
          </section>
        )}

        <footer className="page-footer">
          <span className="footer-dot" aria-hidden="true" />
          <span>Summaries should be reviewed before operational use.</span>
        </footer>
      </div>
    </main>
  );
}

function isIncidentSummary(value: unknown): value is IncidentSummary {
  if (typeof value !== "object" || value === null) return false;
  const summary = value as Record<string, unknown>;
  return (
    typeof summary.Summary === "string" &&
    typeof summary.root_cause === "string" &&
    typeof summary.severity === "string" &&
    typeof summary.impact === "string" &&
    Array.isArray(summary.actions) &&
    summary.actions.every((action) => typeof action === "string") &&
    typeof summary.evidence === "string"
  );
}
