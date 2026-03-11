import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCa9Tf1MjwFbvG1IdrWAdaol3Bhkfh_rLU",
  authDomain: "coinsnest-f0a5f.firebaseapp.com",
  projectId: "coinsnest-f0a5f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userId = "globalUser";

// Update UI everywhere
function updateUI(coins) {

  const ids = ["coins", "walletCoins", "balanceCoins"];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = coins;
  });

}

// Load coins
async function loadCoins() {

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  let coins = 0;

  if (snap.exists()) {
    coins = snap.data().coins ?? 0;
  } else {
    await setDoc(ref, { coins: 0 });
  }

  updateUI(coins);
}

// Add coins
window.addCoins = async function (amount) {

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  let coins = snap.exists() ? snap.data().coins ?? 0 : 0;

  coins += amount;

  await setDoc(ref, { coins: coins });

  updateUI(coins);
};

loadCoins();