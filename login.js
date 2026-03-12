async function googleLogin() {
  const statusEl = document.getElementById("status");
  statusEl.textContent = "Signing you in...";

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await auth.signInWithPopup(provider);
    await CoinsNest.ensureUserDoc(result.user);

    statusEl.textContent = `Welcome ${result.user.displayName || "Player"}! Redirecting...`;
    setTimeout(() => (window.location.href = "login.html"), 700);
  } catch (error) {
    statusEl.textContent = "Sign in failed. Please try again.";
    alert(error.message);
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "login.html";
  }
});
