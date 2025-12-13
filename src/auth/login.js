console.log("login.js 読み込み成功");
// login.js
// 他ファイルからインポート
import { auth } from "../common/firebase-config.js";       // firebase.js のパス
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { saveUserInfo } from "../user/userStore.js";                // userStore.js




//変数
//Googleログインボタン
const loginBtn = document.getElementById("login-btn");
//メールアドレスでのログイン
const emailLoginBtn = document.getElementById("email-login-btn");
//新規登録ボタン
const signupBtn = document.getElementById("signup-btn");



//ログインボタンのクリックイベント
loginBtn.addEventListener("click", () => {

  //グーグルログインのプロパイダのインスタンスを作成
  const provider = new GoogleAuthProvider();

  //ポップアップ（小さいウィンドウ）を開く
  signInWithPopup(auth, provider)
    //成功したら
    .then((result) => {

      //ユーザーの識別
      const user = result.user;

      saveUserInfo(user);

      //ログ表示
      console.log("ログイン成功:", user.displayName);

    })
    .catch((error) => {

      //ログ表示
      console.error("ログイン失敗:", error);

      //警告
      alert("ログインに失敗しました。もう一度お試しください。");
    });
});



// メールアドレスログイン
emailLoginBtn.addEventListener("click", () => {

  //メールアドレスとパスワードを入れる
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  //ファイヤーベースで照合
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("メールログイン成功:", userCredential.user.email);
      saveUserInfo(userCredential.user);
    })
    .catch((error) => {
      console.error("メールログイン失敗:", error);
      alert("ログインに失敗しました。");
    });
});



// 新規登録
signupBtn.addEventListener("click", () => {

  //メールアドレスとパスワードを入れる
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  //メールアドレスがあるかどうか（重複しないため）
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("新規登録成功:", userCredential.user.email);
      saveUserInfo(userCredential.user);
    })
    .catch((error) => {
      console.error("新規登録失敗:", error);
      alert("登録に失敗しました。既に登録済みの可能性があります。");
    });
});




//テスト用ログアウト
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("ログアウト成功");
    })
    .catch((error) => {
      console.error("ログアウト失敗:", error);
    });
});