const COIN_VALUE = 120;

function formatHistory(item) {
  const date = item.date?.toDate ? item.date.toDate().toLocaleString() : "Just now";
  return `${item.coins} coins • ${item.method} • ${date}`;
}

auth.onAuthStateChanged(async (user) => {
  if (!user) return (window.location.href = "index.html");

  const userRef = await CoinsNest.ensureUserDoc(user);

  userRef.onSnapshot((doc) => {
    const data = doc.data() || {};
    const coins = data.coins || 0;
    document.getElementById("coins").textContent = coins;
    document.getElementById("rupees").textContent = `≈ ₹${(coins / COIN_VALUE).toFixed(2)}`;
  });

  const historySnap = await db
    .collection("withdrawals")
    .where("userId", "==", user.uid)
    .orderBy("date", "desc")
    .limit(10)
    .get();

  const list = document.getElementById("historyList");
  list.innerHTML = "";
  historySnap.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = formatHistory(d.data());
    list.appendChild(li);
  });
});

async function redeem() {
  const user = auth.currentUser;
  const amount = Number(document.getElementById("coinInput").value);
  const details = document.getElementById("paymentDetails").value.trim();
  const method = document.querySelector('input[name="pay"]:checked')?.value;

  if (!amount || amount < 1200) return alert("Minimum withdrawal is 1200 coins.");
  if (!details) return alert("Enter UPI/Email details.");
  if (!method) return alert("Select a payment method.");

  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  const coins = snap.data().coins || 0;

  if (coins < amount) return alert("Not enough coins.");

  await db.runTransaction(async (tx) => {
    tx.update(ref, { coins: firebase.firestore.FieldValue.increment(-amount) });
    tx.set(db.collection("withdrawals").doc(), {
      userId: user.uid,
      coins: amount,
      method,
      details,
      status: "pending",
      date: firebase.firestore.FieldValue.serverTimestamp()
    });
  });

  const popup = document.getElementById("popup");
  popup.style.display = "block";
  setTimeout(() => (popup.style.display = "none"), 2000);
}

window.redeem = redeem;
window.logout = () => CoinsNest.logout();
