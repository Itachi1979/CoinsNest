let stopWatching;

function renderDashboard(user, data) {
  const { userName, coins, tickets, level, progressFill, progressText } = CoinsNest.requireElements([
    "userName",
    "coins",
    "tickets",
    "level",
    "progressFill",
    "progressText"
  ]);

  userName.textContent = user.displayName || data.name || "Player";
  coins.textContent = data.coins || 0;
  tickets.textContent = data.tickets || 0;

  const info = CoinsNest.levelInfo(data.coins || 0);
  const progress = Math.max(0, Math.min(100, (((data.coins || 0) - info.min) / (info.next - info.min)) * 100));
  level.textContent = info.level;
  progressFill.style.width = `${progress}%`;
  progressText.textContent = `${data.coins || 0} / ${info.next} coins`;
}

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  await CoinsNest.ensureUserDoc(user);

  if (stopWatching) stopWatching();
  stopWatching = CoinsNest.watchUser(user.uid, (data) => {
    if (data) renderDashboard(user, data);
  });
});

function goTo(path) {
  window.location.href = path;
}

window.openwallet = () => goTo("wallet.html");
window.openticket = () => goTo("ticket.html");
window.opensuperoffer = () => goTo("superoffer.html");
window.openinvite = () => goTo("invite.html");
window.openleaderboard = () => goTo("leaderboard.html");
window.openprofile = () => goTo("profile.html");
window.logout = () => CoinsNest.logout();
