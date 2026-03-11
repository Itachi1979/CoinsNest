let currentUser = null;
let userCoins = 0;

function showMsg(message) {
  const msgElement = document.getElementById("msg");
  if (msgElement) {
    msgElement.innerText = message;
  }
}

function updateCoinsUI() {
  const coinElements = document.querySelectorAll(".coins, #coins");
  coinElements.forEach((el) => {
    el.innerText = userCoins;
  });
}

function updateLevel(coins) {
  const levelElement = document.getElementById("level");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  if (!levelElement || !progressFill || !progressText) return;

  let level = 1;
  let min = 0;
  let max = 12000;

  if (coins >= 12000 && coins < 36000) {
    level = 2;
    min = 12000;
    max = 36000;
  } else if (coins >= 36000) {
    level = 3;
    min = 36000;
    max = 60000;
  }

  let progress = ((coins - min) / (max - min)) * 100;
  progress = Math.min(Math.max(progress, 0), 100);

  levelElement.innerText = level;
  progressFill.style.width = `${progress}%`;
  progressText.innerText = `${coins} / ${max} coins`;
}

function listenCoins() {
  if (!currentUser) return;

  db.collection("users").doc(currentUser.uid).onSnapshot((doc) => {
    if (!doc.exists) {
      db.collection("users").doc(currentUser.uid).set({
        name: currentUser.displayName || "User",
        email: currentUser.email || "",
        coins: 0,
      });
      return;
    }

    const data = doc.data();
    userCoins = data.coins || 0;

    const username = document.getElementById("username");
    if (username) username.innerText = data.name || currentUser.displayName || "User";

    updateCoinsUI();
    updateLevel(userCoins);
  });
}

function addCoins(amount) {
  if (!currentUser || !Number.isFinite(amount) || amount <= 0) return Promise.resolve();

  return db.collection("users").doc(currentUser.uid).update({
    coins: firebase.firestore.FieldValue.increment(amount),
  });
}

function deductCoins(amount) {
  if (!currentUser || !Number.isFinite(amount) || amount <= 0) return Promise.resolve(false);
  if (userCoins < amount) return Promise.resolve(false);

  return db
    .collection("users")
    .doc(currentUser.uid)
    .update({
      coins: firebase.firestore.FieldValue.increment(-amount),
    })
    .then(() => true);
}

function completeTask(reward) {
  addCoins(reward).then(() => {
    showMsg(`Task completed! +${reward} coins added.`);
  });
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

auth.onAuthStateChanged((user) => {
  const onLoginPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

  if (user) {
    currentUser = user;
    listenCoins();
  } else if (!onLoginPage) {
    window.location.href = "index.html";
  }
});

window.completeTask = completeTask;
window.logout = logout;
window.addCoins = addCoins;
window.deductCoins = deductCoins;
