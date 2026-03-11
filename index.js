const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// 🔐 Your TimeWall Secret
const SECRET_KEY = "YOUR_TIMEWALL_SECRET";

exports.postback = functions.https.onRequest(async (req, res) => {
  try {

    const userId = req.query.user_id;
    const reward = parseInt(req.query.reward);
    const txId = req.query.transaction_id;
    const secret = req.query.secret;

    // ✅ Secret validation
    if (secret !== SECRET_KEY) {
      return res.status(403).send("Invalid Secret");
    }

    if (!userId || !reward || !txId) {
      return res.status(400).send("Missing Params");
    }

    const txRef = db.collection("transactions").doc(txId);
    const txDoc = await txRef.get();

    // ✅ Duplicate protection
    if (txDoc.exists) {
      return res.send("Duplicate Ignored");
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    let coins = 0;

    if (userDoc.exists) {
      coins = userDoc.data().coins || 0;
    }

    coins += reward;

    // ✅ Update user coins
    await userRef.set({ coins }, { merge: true });

    // ✅ Save transaction
    await txRef.set({
      userId,
      reward,
      time: Date.now()
    });

    console.log(`Reward Added: ${userId} +${reward}`);

    res.send("OK");

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});





