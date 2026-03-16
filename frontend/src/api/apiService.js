const API_URL = "http://localhost:8080/api";

// Register
export async function registerUser(userData) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Registration failed");
  return res.json();
}

// Login
export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

// Get user profile
export async function getUserProfile(token) {
  const res = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}


// Submit game score
export async function submitScore(token, score) { 
  const res = await fetch(`${API_URL}/game/result`, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }), 
  });

  if (!res.ok) throw new Error("Failed to submit score");
  return res.json();
}

// Save into public leaderboard (Score model)
export async function savePublicScore(token, score) {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await fetch(`${API_URL}/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId: user._id,
      username: user.username,
      score,
    }),
  });

  if (!res.ok) throw new Error("Public score save failed");
  return res.json();
}

// Leaderboard
export async function getLeaderboard(difficulty) {
  const url = difficulty
    ? `${API_URL}/scores?difficulty=${encodeURIComponent(difficulty)}`
    : `${API_URL}/scores`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return res.json();
}
