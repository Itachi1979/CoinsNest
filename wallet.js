let currentUser = null;
let totalCoins = 0;
const coinValue = 120;

function updateWalletUI() {
  document.getElementById("coins").innerText = `${totalCoins} Coins`;
  document.getElementById("rupees").innerText = `≈ ₹${(totalCoins / coinValue).toFixed(2)}`;
}

function loadWallet() {
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

    totalCoins = doc.data().coins || 0;
    updateWalletUI();
  });

  db.collection("withdrawals")
    .where("userId", "==", currentUser.uid)
    .orderBy("date", "desc")
    .limit(10)
    .onSnapshot((snapshot) => {
      const historyList = document.getElementById("historyList");
      historyList.innerHTML = "";

      snapshot.forEach((withdrawal) => {
        const data = withdrawal.data();
        const li = document.createElement("li");
        li.innerText = `${data.coins} Coins Withdrawal Requested (${data.status})`;
        historyList.appendChild(li);
      });
    });
}

function redeem() {
  if (!currentUser) return;

  const coins = parseInt(document.getElementById("coinInput").value, 10);
  const details = document.getElementById("paymentDetails").value.trim();

  if (!Number.isFinite(coins) || coins < 1200) {
    alert("Minimum withdrawal is 1200 coins");
    return;
  }

  if (!details) {
    alert("Enter payment details");
    return;
  }

  if (coins > totalCoins) {
    alert("Insufficient balance");
    return;
  }

  db.collection("users")
    .doc(currentUser.uid)
    .update({
      coins: firebase.firestore.FieldValue.increment(-coins),
    })
    .then(() => {
      return db.collection("withdrawals").add({
        userId: currentUser.uid,
        coins,
        details,
        status: "pending",
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    })
    .then(() => {
      const popup = document.getElementById("popup");
      popup.style.display = "block";
      setTimeout(() => {
        popup.style.display = "none";
      }, 2000);

      document.getElementById("coinInput").value = "";
      document.getElementById("paymentDetails").value = "";
    })
    .catch((error) => {
      alert(error.message);
    });
}

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  loadWallet();
});

window.redeem = redeem;
