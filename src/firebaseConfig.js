
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiNob1xIsei0wKWHsz6u0IGutoD6XffYA",
  authDomain: "cnpm-a89e0.firebaseapp.com",
  projectId: "cnpm-a89e0",
  storageBucket: "cnpm-a89e0.appspot.com",
  messagingSenderId: "53560668651",
  appId: "1:53560668651:web:b889632b536ee0a17329ae",
  measurementId: "G-FY87J8DXKX",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Khởi tạo Firestore

export { auth, analytics, db }; // Xuất khẩu db
