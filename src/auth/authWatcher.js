//Firebase認証の状態を監視して、ログイン済みかどうかでログイン画面とチャット画面を切り替える処理
console.log("authWatcher.js 読み込み成功");

//Firebase認証に関する情報や操作をまとめたオブジェクト
import { auth } from "../common/firebase-config.js";
// Firebase Auth のログイン状態の変化を監視する関数
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
//画面を切り替えるための自作関数と画面定義
import { switchScreen, screens } from "../common/screenSwitch.js";
//ログインしたユーザーの参加しているルーム一覧を読み込む関数
import { loadUserRooms } from "../rooms/loadRooms.js";

//ログイン状態の変化
onAuthStateChanged(auth, (user) => {

  //ログインしている場合
  if (user) {
    console.log("→ chat に切り替え");
    //チャット画面に切り替え
    switchScreen(screens.chat);
    //ユーザーが参加しているルームを読み込む
    loadUserRooms();

  //未ログインかログアウト時
  } else {
    console.log("→ login に切り替え");
    //ログイン画面に切り替え
    switchScreen(screens.login);
  }

});