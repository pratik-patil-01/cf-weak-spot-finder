// Thin wrapper around the public Codeforces API.
// Docs: https://codeforces.com/apiHelp
// No API key needed for these read-only, public endpoints.

const BASE = "https://codeforces.com/api";

/**
 * Fetches every submission a user has ever made.
 * Each submission includes: verdict, problem (with tags + rating), submission time.
 * This is the raw data your scoring logic will work on.
 */
export async function fetchUserSubmissions(handle) {
  const res = await fetch(`${BASE}/user.status?handle=${encodeURIComponent(handle)}`);
  const data = await res.json();

  if (data.status !== "OK") {
    // CF returns status: "FAILED" with a comment, e.g. "handle not found"
    throw new Error(data.comment || "Could not fetch submissions for this handle");
  }

  return data.result; // array of submission objects
}

/**
 * Fetches the entire CF problem archive (~9000 problems).
 * Used as the pool to recommend NEW problems from (ones the user hasn't solved).
 * CF returns this as { problems: [...], problemStatistics: [...] }
 */
export async function fetchProblemSet() {
  const res = await fetch(`${BASE}/problemset.problems`);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(data.comment || "Could not fetch problem set");
  }

  return data.result.problems; // array of { contestId, index, name, rating, tags }
}

/**
 * Fetches basic profile info (current rating, rank, avatar) for the header.
 */
export async function fetchUserInfo(handle) {
  const res = await fetch(`${BASE}/user.info?handles=${encodeURIComponent(handle)}`);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(data.comment || "Could not fetch user info");
  }

  return data.result[0];
}
