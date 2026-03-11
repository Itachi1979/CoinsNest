function googleLogin() {

    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
    .then((result) => {

        const user = result.user;

        document.getElementById("userName").innerText =
            "Welcome " + user.displayName;

        saveUser(user);

    })
    .catch((error) => {
        alert(error.message);
    });

}


// Save User in Database
function saveUser(user) {

    const userRef = db.collection("users").doc(user.uid);

    userRef.get().then((doc) => {

        if (!doc.exists) {

            userRef.set({
                name: user.displayName,
                email: user.email,
                coins: 1000,
                created: new Date()
            });

        }

    });




}auth.onAuthStateChanged((user) => {

    if (user) {

        document.getElementById("userName").innerText =
            "Welcome " + user.displayName;

        loadWallet(user.uid);

    }

});




function loadWallet(uid) {

    db.collection("users").doc(uid).get().then((doc) => {

        if (doc.exists) {

            let coins = doc.data().coins;

            document.getElementById("coins").innerText =
                coins + " Coins";

        }

    });

}
