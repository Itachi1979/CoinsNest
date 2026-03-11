function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  auth
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      document.getElementById("status").innerText = `Welcome ${user.displayName}`;
      saveUser(user).then(() => {
        setTimeout(() => {
          window.location.href = "index.html";
        }, 700);
      });
    })
    .catch((error) => {
      document.getElementById("status").innerText = error.message;
    });
}

function saveUser(user) {
  const userRef = db.collection("users").doc(user.uid);
  return userRef.get().then((doc) => {
    if (!doc.exists) {
      return userRef.set({
        name: user.displayName,
        email: user.email,
        coins: 1000,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        referralCode: user.uid.slice(0, 6).toUpperCase(),
        referredBy: null,
        referralsCount: 0,
      });
    }
    return Promise.resolve();
  });
}

auth.onAuthStateChanged((user) => {
  if (user) window.location.href = "index.html";
});
