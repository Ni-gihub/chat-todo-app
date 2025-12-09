// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";

// Firestore モジュール
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム関連モジュール
import { loadUserRooms } from "./loadRooms.js";


// ルーム作成ボタンを取得
const createRoomBtn = document.getElementById("create-room-btn");

// 作成メッセージ表示欄
const roomCreateMsg = document.getElementById("room-create-msg");

//ルームボタンのクリックイベント
createRoomBtn.addEventListener("click", async () => {

  //ユーザー名を入れる
  const user = auth.currentUser;

  //ルーム名を入れれるようにする（HTML要素を取得）
  const roomNameInput = document.getElementById("room-name");
  //ルーム名を入れる
  const roomName = roomNameInput.value.trim();

  // 入力チェック（ユーザー名は存在するか、ルーム名は空白じゃないか）
  if (!user) {
    roomCreateMsg.textContent = "ログインしてください。";
    return;
  }
  if (!roomName) {
    roomCreateMsg.textContent = "ルーム名を入力してください。";
    return;
  }

  try {
    // Firestoreにルームの初期情報を追加
    const docRef = await addDoc(collection(db, "rooms"), {
      //ルーム名
      name: roomName,
      //作成したユーザー名
      createdBy: user.uid,
      //作成した日時
      createdAt: serverTimestamp(),
      //製作者をメンバーに追加
      members: [user.uid], 
    });

    //ルーム作成成功のメッセージ
    roomCreateMsg.textContent = `ルーム「${roomName}」を作成しました。`;
    //入力欄を空欄にする
    roomNameInput.value = "";
    //ルームを表示
    loadUserRooms();
  } catch (error) {
    console.error("ルーム作成エラー:", error);
    roomCreateMsg.textContent = "ルーム作成に失敗しました。";
  }
});
