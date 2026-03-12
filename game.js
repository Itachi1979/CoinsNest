function random4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function buildRound() {
  const correct = random4();
  const set = new Set([correct]);
  while (set.size < 4) set.add(random4());
  const options = Array.from(set).sort(() => Math.random() - 0.5);
  return { correct, options };
}

async function verifyAdAndReward({ rewardCoins = 0, rewardTickets = 0, ticketCost = 0 }) {
  const user = auth.currentUser;
  const sessionRef = db.collection("adSessions").doc();

  await sessionRef.set({
    userId: user.uid,
    status: "started",
    startedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  const adState = document.getElementById("adState");
  adState.textContent = "Ad is playing... please wait 5 seconds";

  await new Promise((resolve) => setTimeout(resolve, 5000));

  await sessionRef.update({
    status: "completed",
    completedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await db.runTransaction(async (tx) => {
    const userRef = db.collection("users").doc(user.uid);
    const userSnap = await tx.get(userRef);
    const sessionSnap = await tx.get(sessionRef);

    if (!sessionSnap.exists || sessionSnap.data().status !== "completed") {
      throw new Error("Ad verification failed");
    }

    const data = userSnap.data() || {};
    const tickets = data.tickets || 0;

    if (ticketCost && tickets < ticketCost) {
      throw new Error("Not enough tickets for super offer");
    }

    tx.update(userRef, {
      coins: firebase.firestore.FieldValue.increment(rewardCoins),
      tickets: firebase.firestore.FieldValue.increment(rewardTickets - ticketCost),
      lastVerifiedAd: firebase.firestore.FieldValue.serverTimestamp()
    });
  });

  adState.textContent = "Ad verified by server. Reward added successfully!";
}

function mountGame({ titleId, optionsId, targetId, resultId, rewardConfig, requireTickets = 0 }) {
  let round = buildRound();

  function renderRound() {
    document.getElementById(targetId).textContent = round.correct;
    const optionsWrap = document.getElementById(optionsId);
    optionsWrap.innerHTML = "";
    round.options.forEach((num) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = num;
      btn.onclick = async () => {
        const result = document.getElementById(resultId);
        if (num !== round.correct) {
          result.textContent = "Wrong number. Try a new round.";
          round = buildRound();
          return renderRound();
        }

        if (requireTickets) {
          const userSnap = await db.collection("users").doc(auth.currentUser.uid).get();
          if ((userSnap.data().tickets || 0) < requireTickets) {
            result.textContent = `You need ${requireTickets} tickets to unlock this.`;
            return;
          }
        }

        result.textContent = "Correct! Starting ad verification...";
        try {
          await verifyAdAndReward(rewardConfig);
          result.textContent = "Reward granted! Starting a new round...";
        } catch (e) {
          result.textContent = e.message;
        }

        round = buildRound();
        renderRound();
      };
      optionsWrap.appendChild(btn);
    });
  }

  auth.onAuthStateChanged(async (user) => {
    if (!user) return (window.location.href = "index.html");
    await CoinsNest.ensureUserDoc(user);
    renderRound();
  });

  if (titleId) {
    const unlockHint = document.getElementById(titleId);
    if (requireTickets) unlockHint.textContent = `Super Offer (requires ${requireTickets} tickets)`;
  }
}

window.mountGame = mountGame;
window.logout = () => CoinsNest.logout();
