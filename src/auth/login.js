console.log("login.js 読み込み成功");


//Firebase認証に関する情報や操作をまとめたオブジェクト
import { auth } from "../common/firebase-config.js";    
// 
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
//ログインしたユーザー情報をストアに保存する関数
import { saveUserInfo } from "../user/userStore.js";               




//変数
//Googleログインボタン
const loginBtn = document.getElementById("login-btn");
//メールアドレスでのログイン
const emailLoginBtn = document.getElementById("email-login-btn");
//新規登録ボタン
const signupBtn = document.getElementById("signup-btn");



//Googleアカウントでログイン
loginBtn.addEventListener("click", () => {

  //グーグルログインのプロパイダのインスタンスを作成
  const provider = new GoogleAuthProvider();

  //ポップアップ（小さいウィンドウ）を開く
  signInWithPopup(auth, provider)

  //認証成功
  .then((result) => {

    //Googleアカウント情報
    const user = result.user;

    //アプリ内のデータベースや状態に保存
    saveUserInfo(user);

    //ログ表示
    console.log("ログイン成功:", user.displayName);
  })
  //認証失敗
  .catch((error) => {

    //ログ表示
    console.error("ログイン失敗:", error);

    //警告
    alert("ログインに失敗しました。もう一度お試しください。");

  });
});



// ログインボタンをクリック
emailLoginBtn.addEventListener("click", () => {

  //フォームに入力されたメールアドレスとパスワードをそれぞれ入れる
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  //ファイヤーベースで照合
  signInWithEmailAndPassword(auth, email, password)
  //ログイン成功時
  .then((userCredential) => {
    console.log("メールログイン成功:", userCredential.user.email);
    //Firestore にユーザー情報を保存・同期
    //アプリ側のデータを最新の状態
    saveUserInfo(userCredential.user);
  })
  //ログイン失敗時
  .catch((error) => {
    console.error("メールログイン失敗:", error);
    alert("ログインに失敗しました。");
  });

});



// 新規登録ボタンをクリック
signupBtn.addEventListener("click", () => {

   //フォームに入力されたメールアドレスとパスワードをそれぞれ入れる
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  //メールアドレスがあるかどうか（重複しないため）
  createUserWithEmailAndPassword(auth, email, password)
  //成功
  .then((userCredential) => {
    console.log("新規登録成功:", userCredential.user.email);
    //Firestore にユーザー情報を保存
    saveUserInfo(userCredential.user);
  })
  //失敗
  .catch((error) => {
    console.error("新規登録失敗:", error);
    alert("登録に失敗しました。既に登録済みの可能性があります。");
  });
});




//ログアウトボタン
const logoutBtn = document.getElementById("logout-btn");
//テスト用ログアウトボタンをクリック
logoutBtn.addEventListener("click", () => {
  //現在ログイン中のユーザーをログアウトする
  signOut(auth)
  //成功
  .then(() => {
    console.log("ログアウト成功");
  })
  //失敗
  .catch((error) => {
    console.error("ログアウト失敗:", error);
  });
});