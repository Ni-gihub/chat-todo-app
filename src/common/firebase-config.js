// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase設定情報
const firebaseConfig = {
  apiKey: "AIzaSyAvRIG77Idf7DZqpVTPClqzIhUyylq4Gag",
  authDomain: "siken-a2f5b.firebaseapp.com",
  projectId: "siken-a2f5b",
  storageBucket: "siken-a2f5b.firebasestorage.app",
  messagingSenderId: "970033760717",
  appId: "1:970033760717:web:9ea2b5a6bd3a8576ae9c84",
  measurementId: "G-SMHF1BR3HK"
};

// Firebaseを指定
const app = initializeApp(firebaseConfig);
//プロパイダ認証機能（メールアドレス・Googleアカウント）
const auth = getAuth(app);
//ファイアーストア
const db = getFirestore(app);

// 他のファイルでも使えるようにエクスポート
export { auth, db };
