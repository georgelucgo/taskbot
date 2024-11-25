const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDXFfEiwVfhyKd93wSk_1sGv5BL_-_uFKA",
  authDomain: "tarefex-53e37.firebaseapp.com",
  projectId: "tarefex-53e37",
  storageBucket: "tarefex-53e37.firebasestorage.app",
  messagingSenderId: "86242267181",
  appId: "1:86242267181:web:b0389d86923ed17cbbe8a4",
  measurementId: "G-311T5EN9PV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = db;
