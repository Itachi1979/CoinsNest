const firebaseConfig = {
  apiKey: "AIzaSyCa9Tf1MjwFbvG1IdrWAdaol3Bhkfh_rLU",
  authDomain: "coinsnest-f0a5f.firebaseapp.com",
  projectId: "coinsnest-f0a5f",
  storageBucket: "coinsnest-f0a5f.firebasestorage.app",
  messagingSenderId: "927147839382",
  appId: "1:927147839382:web:bf0b96006647c8a10997b7"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
