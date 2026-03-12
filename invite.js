function showMessage(text, type = "") {
  const msg = document.getElementById("message");
  msg.className = `message ${type}`;
  msg.textContent = text;
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = await CoinsNest.ensureUserDoc(user);
  const doc = await userRef.get();
  const data = doc.data();

  if (!data.referralCode) {
    const referralCode = generateCode();
    await userRef.update({ referralCode });
    document.getElementById("myCode").textContent = referralCode;
  } else {
    document.getElementById("myCode").textContent = data.referralCode;
  }

  if (data.referredBy) {
    document.getElementById("referralForm").style.display = "none";
    showMessage("Referral already used on this account.", "ok");
  }
});

async function submitReferral() {
  const user = auth.currentUser;
  const code = document.getElementById("refInput").value.trim().toUpperCase();

  if (!code) return showMessage("Enter a valid referral code.", "error");

  const myRef = db.collection("users").doc(user.uid);
  const myDoc = await myRef.get();

  if (myDoc.data().referredBy) {
    return showMessage("You already applied a referral code.", "error");
  }

  if (myDoc.data().referralCode === code) {
    return showMessage("You cannot use your own referral code.", "error");
  }

  const match = await db.collection("users").where("referralCode", "==", code).limit(1).get();
  if (match.empty) return showMessage("Referral code not found.", "error");

  const inviterId = match.docs[0].id;

  await db.runTransaction(async (tx) => {
    tx.update(myRef, {
      referredBy: inviterId,
      coins: firebase.firestore.FieldValue.increment(50)
    });

    tx.update(db.collection("users").doc(inviterId), {
      coins: firebase.firestore.FieldValue.increment(100)
    });
  });

  document.getElementById("referralForm").style.display = "none";
  showMessage("Referral applied! You received 50 coins.", "ok");
}

window.submitReferral = submitReferral;
window.logout = () => CoinsNest.logout();
