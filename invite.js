let currentUser;
let myReferralCode = "";

auth.onAuthStateChanged(async (user) => {
  if (!user) return (window.location.href = "login.html");
  currentUser = user;

  const userRef = db.collection("users").doc(user.uid);
  const snap = await userRef.get();
  if (!snap.exists) return;

  myReferralCode = snap.data().referralCode || user.uid.slice(0, 6).toUpperCase();
  document.getElementById("myCode").innerText = myReferralCode;
});

function copyCode() {
  navigator.clipboard.writeText(myReferralCode);
  document.getElementById("inviteMsg").innerText = "Referral code copied.";
}

function applyCode() {
  const code = document.getElementById("refCodeInput").value.trim().toUpperCase();
  if (!code) return;
  if (code === myReferralCode) return alert("You cannot use your own code.");

  db.collection("users")
    .where("referralCode", "==", code)
    .limit(1)
    .get()
    .then((snap) => {
      if (!snap.size) return alert("Invalid referral code.");

      const owner = snap.docs[0];
      const ownerId = owner.id;
      const meRef = db.collection("users").doc(currentUser.uid);

      return db.runTransaction(async (tx) => {
        const meSnap = await tx.get(meRef);
        if (meSnap.data().referredBy) throw new Error("Referral already set for your account.");

        tx.update(meRef, {
          referredBy: ownerId,
          coins: firebase.firestore.FieldValue.increment(300),
        });

        tx.update(db.collection("users").doc(ownerId), {
          coins: firebase.firestore.FieldValue.increment(500),
          referralsCount: firebase.firestore.FieldValue.increment(1),
        });
      });
    })
    .then(() => {
      document.getElementById("inviteMsg").innerText = "Referral linked! You received 300 coins.";
    })
    .catch((e) => alert(e.message));
}
