import { useState } from "react";
import { fetchUserSubmissions, fetchProblemSet, fetchUserInfo } from "./api/codeforces";
import { analyzeTagStrength, rankWeakTags, recommendProblems } from "./utils/scoring";
import "./App.css";

// CF's own rank color spectrum — used here as the app's accent system
// instead of an arbitrary brand color. gray -> cyan -> blue -> orange
const RANK_COLORS = {
  low: "#808080",
  mid: "#03A89E",
  high: "#0000FF",
  top: "#FF8C00",
};

function ratingColor(rating) {
  if (!rating) return RANK_COLORS.low;
  if (rating < 1200) return RANK_COLORS.low;
  if (rating < 1900) return RANK_COLORS.mid;
  if (rating < 2400) return RANK_COLORS.high;
  return RANK_COLORS.top;
}

export default function App() {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [errorMsg, setErrorMsg] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [weakTags, setWeakTags] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!handle.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const [submissions, problemSet, info] = await Promise.all([
        fetchUserSubmissions(handle.trim()),
        fetchProblemSet(),
        fetchUserInfo(handle.trim()),
      ]);

      const solvedIds = new Set(
        submissions
          .filter((s) => s.verdict === "OK")
          .map((s) => `${s.problem.contestId}-${s.problem.index}`)
      );

      const tagStrengths = analyzeTagStrength(submissions);
      if (Object.keys(tagStrengths).length === 0) {
        setErrorMsg("No submissions found for this handle yet — solve a few problems on Codeforces first!");
        setStatus("error");
        return;
      }
      
      const ranked = rankWeakTags(tagStrengths);
      const recs = recommendProblems(ranked, problemSet, solvedIds, info.rating || 1200);

      setUserInfo(info);
      setWeakTags(ranked.slice(0, 5).map((tag) => ({ tag, ...tagStrengths[tag] })));
      setRecommendations(recs);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="terminal-shell">
      <div className="terminal-chrome">
        <span className="dot dot-red" />
        <span className="dot dot-yellow" />
        <span className="dot dot-green" />
        <span className="chrome-title">weak-spot-finder — zsh</span>
      </div>

      <div className="terminal-body">
        <p className="prompt-line">
          <span className="prompt-symbol">$</span> analyze --handle
        </p>

        <form onSubmit={handleAnalyze} className="input-row">
          <input
            className="handle-input"
            placeholder="your_cf_handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            spellCheck={false}
          />
          <button className="run-btn" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "running..." : "run"}
          </button>
        </form>

        {status === "error" && <p className="error-line">error: {errorMsg}</p>}

        {status === "done" && userInfo && (
          <div className="output">
            <div className="user-line">
              <span style={{ color: ratingColor(userInfo.rating) }}>{userInfo.handle}</span>{" "}
              <span className="dim">
                rating {userInfo.rating ?? "unrated"} · max {userInfo.maxRating ?? "—"}
              </span>
            </div>

            <p className="section-label"># weak tags</p>
            <div className="tag-radar">
              {weakTags.map(({ tag, accuracy, attempted, solved }) => (
                <div className="tag-row" key={tag}>
                  <span className="tag-name">{tag}</span>
                  <div className="tag-bar-track">
                    <div
                      className="tag-bar-fill"
                      style={{ width: `${Math.round(accuracy * 100)}%` }}
                    />
                  </div>
                  <span className="tag-stat dim">
                    {solved}/{attempted} · {Math.round(accuracy * 100)}%
                  </span>
                </div>
              ))}
            </div>

            <p className="section-label"># recommended problems</p>
            {recommendations.length === 0 ? (
              <p className="dim">
                No unsolved problems found in your growth range for these tags right now — try a wider rating range or check back after your next contest.
              </p>
            ) : (
              <ul className="problem-list">
                {recommendations.map((p) => (
                  <li key={`${p.contestId}${p.index}`} className="problem-row">
                    <a
                      href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.contestId}
                      {p.index} — {p.name}
                    </a>
                    <span className="dim">
                      {p.rating} · {p.tags.slice(0, 3).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
