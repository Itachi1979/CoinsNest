let totalCoins = 0;
const coinValue = 120; // 120 coins = ₹1

function redeem() {

    let coins = document.getElementById("coinInput").value;
    let details = document.getElementById("paymentDetails").value;

    if (coins < 1200) {
        alert("Minimum withdrawal is 1200 coins");
        return;
    }

    if (details === "") {
        alert("Enter payment details");
        return;
    }

    // Deduct coins
    totalCoins -= coins;
    document.getElementById("coins").innerText = totalCoins + " Coins";

    let rupees = (totalCoins / coinValue).toFixed(2);
    document.getElementById("rupees").innerText = "≈ ₹" + rupees;

    // Add history
    let li = document.createElement("li");
    li.innerText = coins + " Coins Withdrawal Requested";
    document.getElementById("historyList").appendChild(li);

    // Show popup
    let popup = document.getElementById("popup");
    popup.style.display = "block";

    setTimeout(() => {
        popup.style.display = "none";
    }, 2000);
}const userId = "user123";

// Load Coins
function loadWallet() {

    db.collection("users").doc(userId).get().then((doc) => {

        if (doc.exists) {

            let coins = doc.data().coins;

            document.getElementById("coins").innerText =
                coins + " Coins";

        } else {

            db.collection("users").doc(userId).set({
                coins: 5000
            });

        }

    });

}

// Redeem
function redeem() {

    let coins =
        parseInt(document.getElementById("coinInput").value);

    db.collection("users").doc(userId).get().then((doc) => {

        let currentCoins = doc.data().coins;

        let newCoins = currentCoins - coins;

        db.collection("users").doc(userId).update({
            coins: newCoins
        });

        db.collection("withdrawals").add({
            userId: userId,
            coins: coins,
            status: "pending",
            date: new Date()
        });

        alert("Withdrawal Requested ✅");

        loadWallet();

    });

}

loadWallet();
loadcoins();


