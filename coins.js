let currentUser = null;
let userCoins = 0;
let lastDailyClaim = null;

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  document.getElementById("username").innerText = user.displayName || "Player";
  listenUser();
});

function listenUser() {
  db.collection("users").doc(currentUser.uid).onSnapshot(async (snap) => {
    if (!snap.exists) {
      await db.collection("users").doc(currentUser.uid).set({
        name: currentUser.displayName || "Player",
        email: currentUser.email || "",
        coins: 1000,
        lastDailyClaim: null,
        referralCode: currentUser.uid.slice(0, 6).toUpperCase(),
        referredBy: null,
      });
      return;
    }

    const data = snap.data();
    userCoins = data.coins || 0;
    lastDailyClaim = data.lastDailyClaim || null;
    updateCoinsUI(userCoins);
    updateLevel(userCoins);
  });
}

function updateCoinsUI(coins) {
  document.querySelectorAll(".coins").forEach((el) => (el.innerText = coins));
}

function updateLevel(coins) {
  const levels = [12000, 36000, 60000];
  let level = 1;
  let min = 0;
  let max = levels[0];

  if (coins >= levels[0] && coins < levels[1]) {
    level = 2;
    min = levels[0];
    max = levels[1];
  } else if (coins >= levels[1]) {
    level = 3;
    min = levels[1];
    max = levels[2];
  }

  const progress = Math.max(0, Math.min(100, ((coins - min) / (max - min)) * 100));

  const levelEl = document.getElementById("level");
  const fillEl = document.getElementById("progressFill");
  const textEl = document.getElementById("progressText");

  if (levelEl) levelEl.innerText = level;
  if (fillEl) fillEl.style.width = `${progress}%`;
  if (textEl) textEl.innerText = `${coins} / ${max}`;
}

function rewardCoins(amount, reason) {
  if (!currentUser) return;

  const userRef = db.collection("users").doc(currentUser.uid);
  userRef.update({
    coins: firebase.firestore.FieldValue.increment(amount),
  });

  const msgEl = document.getElementById("msg");
  if (msgEl) msgEl.innerText = `${reason} +${amount} coins`;
}

window.watchRewardedAd = () => rewardCoins(20, "Ad watched!");
window.completeTask = () => rewardCoins(80, "Task complete!");
window.spinLucky = () => {
  const reward = Math.floor(Math.random() * 91) + 10;
  rewardCoins(reward, "Lucky spin reward!");
};

window.claimDailyBonus = () => {
  const today = new Date().toISOString().slice(0, 10);
  if (lastDailyClaim === today) {
    const msgEl = document.getElementById("msg");
    if (msgEl) msgEl.innerText = "Daily bonus already claimed today.";
    return;
  }

  db.collection("users").doc(currentUser.uid).update({
    coins: firebase.firestore.FieldValue.increment(40),
    lastDailyClaim: today,
  });

  const msgEl = document.getElementById("msg");
  if (msgEl) msgEl.innerText = "Daily bonus claimed +40 coins";
};

window.openOffer = (network) => {
  if (!currentUser) return;
  const urls = {
    torox: `https://torox.io/wall?uid=${currentUser.uid}`,
    pubscale: `https://offer.pubscale.com/?uid=${currentUser.uid}`,
    timewall: `https://offer.timewall.io/?uid=${currentUser.uid}`,
  };
  const url = urls[network];
  if (url) window.location.href = url;
};
