let currentUser;
let userCoins = 0;

// Detect login
auth.onAuthStateChanged((user) => {

    if (user) {

        currentUser = user;
        listenCoins();

    } else {

        window.location.href = "login.html";

    }

});


// Real-time coins listener
function listenCoins() {

    db.collection("users").doc(currentUser.uid)
    .onSnapshot((doc) => {

        if (doc.exists) {

            userCoins = doc.data().coins || 0;

            updateCoinsUI();
            updateLevel(userCoins);

        } else {

            db.collection("users").doc(currentUser.uid).set({
                coins: 0
            });

        }

    });

}


// Update coins everywhere
function updateCoinsUI() {

    let coinElements = document.querySelectorAll(".coins");

    coinElements.forEach(el => {
        el.innerText = userCoins;
    });
}
function addCoins(amount){

let user = firebase.auth().currentUser;

db.collection("users")
.doc(user.uid)
.update({

coins: firebase.firestore.FieldValue.increment(amount)

});

}

// Deduct coins
function deductCoins(amount) {

    if (!currentUser) return;

    db.collection("users").doc(currentUser.uid).update({
        coins: firebase.firestore.FieldValue.increment(-amount)
    });

}


// Level system
function updateLevel(coins) {

  let level = 1;
  let min = 0;
  let max = 12000;

  if (coins >= 12000 && coins < 36000) {
    level = 2;
    min = 12000;
    max = 36000;
  }

  if (coins >= 36000) {
    level = 3;
    min = 36000;
    max = 60000;
  }

  let progress = ((coins - min) / (max - min)) * 100;

  if (progress > 100) progress = 100;
  if (progress < 0) progress = 0;

  document.getElementById("level").innerText = level;
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("progressText").innerText =
    coins + " / " + max + " coins";

}


function addCoins(amount){

let userRef=db.collection("users").doc(currentUser.uid);

userRef.get().then(doc=>{

let referredBy=doc.data().referredBy;

userRef.update({
coins:firebase.firestore.FieldValue.increment(amount)
});

if(referredBy){

let bonus=Math.floor(amount*0.10);

db.collection("users").doc(referredBy).update({
coins:firebase.firestore.FieldValue.increment(bonus)
});

}

});

}