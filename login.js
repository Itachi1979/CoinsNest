function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  auth
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      document.getElementById("status").innerText = `Welcome ${user.displayName}`;
      saveUser(user).then(() => {
        window.location.href = "login.html";
      });
    })
    .catch((error) => {
      alert(error.message);
    });
}

function saveUser(user) {
  const userRef = db.collection("users").doc(user.uid);

  return userRef.get().then((doc) => {
    if (!doc.exists) {
      return userRef.set({
        name: user.displayName || "User",
        email: user.email || "",
        coins: 0,
        created: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "login.html";
  }
});
