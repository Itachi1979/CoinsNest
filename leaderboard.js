auth.onAuthStateChanged((user) => {
  if (!user) return (window.location.href = 'login.html');
  loadLeaderboard();
});

function loadLeaderboard() {
  db.collection('users')
    .orderBy('coins', 'desc')
    .limit(20)
    .get()
    .then((snap) => {
      let rank = 1;
      let html = '';

      snap.forEach((doc) => {
        const data = doc.data();
        html += `<div class="player"><div><span class="rank">#${rank}</span>${data.name || 'Player'}</div><div class="coins">💰 ${data.coins || 0}</div></div>`;
        rank += 1;
      });

      document.getElementById('leaderboardList').innerHTML = html || '<p>No data yet.</p>';
    });
}
