import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCa9Tf1MjwFbvG1IdrWAdaol3Bhkfh_rLU",
  authDomain: "coinsnest-f0a5f.firebaseapp.com",
  projectId: "coinsnest-f0a5f",

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadLeaderboard() {

  const q = query(
    collection(db, "users"),
    orderBy("coins", "desc")
  );

  const snap = await getDocs(q);

  let html = "";
  let rank = 1;

  snap.forEach(doc => {

    const data = doc.data();
    const coins = data.coins || 0;
    const name = data.name || "Player";

    // Only show users with 60000+ coins
    if (coins >= 60000) {

      html += `
        <div class="player">
          <div>
            <span class="rank">#${rank}</span> ${name}
          </div>
          <div class="coins">💰 ${coins}</div>
        </div>
      `;

      rank++;
    }

  });

  document.getElementById("leaderboardList").innerHTML =
    html || "<p>No players above 60000 coins yet.</p>";
}

loadLeaderboard();