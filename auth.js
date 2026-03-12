(function () {
  function requireElements(ids) {
    return ids.reduce((acc, id) => {
      acc[id] = document.getElementById(id);
      return acc;
    }, {});
  }

  function levelInfo(coins) {
    if (coins < 12000) return { level: 1, next: 12000, min: 0 };
    if (coins < 36000) return { level: 2, next: 36000, min: 12000 };
    return { level: 3, next: 60000, min: 36000 };
  }

  async function ensureUserDoc(user) {
    const userRef = db.collection("users").doc(user.uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      await userRef.set({
        name: user.displayName || "Player",
        email: user.email || "",
        photoURL: user.photoURL || "",
        coins: 0,
        tickets: 0,
        referralCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
        referredBy: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    return userRef;
  }

  function watchUser(uid, callback) {
    return db.collection("users").doc(uid).onSnapshot((doc) => {
      callback(doc.exists ? doc.data() : null);
    });
  }

  function logout() {
    return auth.signOut().then(() => (window.location.href = "index.html"));
  }

  window.CoinsNest = {
    requireElements,
    levelInfo,
    ensureUserDoc,
    watchUser,
    logout
  };
})();
