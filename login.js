function googleLogin() {

    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
    .then((result) => {

        const user = result.user;

        document.getElementById("status").innerText =
            "Welcome " + user.displayName;

        saveUser(user);

        // Redirect to home page
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1500);

    })
    .catch((error) => {
        alert(error.message);
    });

}


function googleLogin() {

    const provider = new firebase.auth.GoogleAuthProvider();

    provider.setCustomParameters({
        prompt: "select_account"
    });

    auth.signInWithPopup(provider)
    .then((result) => {

        const user = result.user;

        document.getElementById("status").innerText =
            "Welcome " + user.displayName;

        saveUser(user);

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    })
    .catch((error) => {
        alert(error.message);
    });

}


// Auto login if already signed in
auth.onAuthStateChanged((user) => {

    if (user) {
        window.location.href = "index.html";
    }

});
function saveUser(user) {

    const userRef = db.collection("users").doc(user.uid);

    userRef.get().then((doc) => {

        if (!doc.exists) {

            userRef.set({
                name: user.displayName,
                email: user.email,
                coins: 1000
            });

        }

    });

}


auth.onAuthStateChanged((user)=>{

if(user){

let userRef = db.collection("users").doc(user.uid);

userRef.onSnapshot((doc)=>{

if(doc.exists){

let coins = doc.data().coins || 0;

document.getElementById("coins").innerText = coins;

}else{

userRef.set({
coins:0
});

}

});

}

});

function logout(){

firebase.auth().signOut().then(()=>{

window.location.href = "index.html";

});

}