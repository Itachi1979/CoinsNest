auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  await CoinsNest.ensureUserDoc(user);
  const list = document.getElementById("leaderboardList");

  const snap = await db.collection("users").orderBy("coins", "desc").limit(30).get();
  let rank = 1;

  list.innerHTML = "";
  snap.forEach((doc) => {
    const data = doc.data();
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `
      <span>#${rank} ${data.name || "Player"}</span>
      <strong>${data.coins || 0} coins</strong>
    `;
    list.appendChild(row);
    rank += 1;
  });

  if (!snap.size) {
    list.innerHTML = '<p class="muted">No players found yet.</p>';
  }
});

window.logout = () => CoinsNest.logout();
