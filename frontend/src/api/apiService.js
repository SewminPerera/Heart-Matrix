const API_URL = "http://localhost:8080/api"; // change this later when you deploy

// --- USER AUTH ---
export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

// --- SCORES ---
export async function submitScore(scoreData) {
  const response = await fetch(`${API_URL}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scoreData),
  });
  if (!response.ok) throw new Error("Failed to submit score");
  return response.json();
}

export async function getLeaderboard() {
  const response = await fetch(`${API_URL}/scores`);
  if (!response.ok) throw new Error("Failed to load leaderboard");
  return response.json();
}
