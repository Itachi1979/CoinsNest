let currentUser = null;
let currentCoins = 0;

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  bindWallet();
  loadHistory();
});

function bindWallet() {
  db.collection("users").doc(currentUser.uid).onSnapshot((snap) => {
    if (!snap.exists) return;
    currentCoins = snap.data().coins || 0;
    document.getElementById("coins").innerText = currentCoins;
  });
}

function loadHistory() {
  db.collection("withdrawals")
    .where("userId", "==", currentUser.uid)
    .orderBy("created", "desc")
    .limit(5)
    .get()
    .then((snap) => {
      const list = document.getElementById("historyList");
      list.innerHTML = "";
      snap.forEach((doc) => {
        const item = doc.data();
        const li = document.createElement("li");
        li.innerText = `${item.coins} coins • ${item.status}`;
        list.appendChild(li);
      });
      if (!snap.size) list.innerHTML = "<li>No withdrawal requests yet.</li>";
    });
}

function redeem() {
  const coins = parseInt(document.getElementById("coinInput").value, 10);
  const details = document.getElementById("paymentDetails").value.trim();

  if (!coins || coins < 1200) return alert("Minimum withdrawal is 1200 coins.");
  if (coins > currentCoins) return alert("Insufficient balance.");
  if (!details) return alert("Payment details are required.");

  const userRef = db.collection("users").doc(currentUser.uid);

  db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const liveCoins = snap.data().coins || 0;
    if (liveCoins < coins) throw new Error("Insufficient live balance");

    tx.update(userRef, { coins: liveCoins - coins });
    tx.set(db.collection("withdrawals").doc(), {
      userId: currentUser.uid,
      coins,
      details,
      status: "pending",
      created: firebase.firestore.FieldValue.serverTimestamp(),
    });
  })
    .then(() => {
      alert("Withdrawal request submitted.");
      document.getElementById("coinInput").value = "";
      document.getElementById("paymentDetails").value = "";
      loadHistory();
    })
    .catch((e) => alert(e.message));
}
