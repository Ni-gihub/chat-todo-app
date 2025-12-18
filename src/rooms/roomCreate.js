// 
console.log(" roomCreate.js読み込み成功");

// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";
// Firestore モジュール
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// ルーム一覧を表示
import { loadUserRooms } from "./loadRooms.js";


// ルーム作成ボタン
const createRoomBtn = document.getElementById("create-room-btn");
// 作成メッセージ表示欄
const roomCreateMsg = document.getElementById("room-create-msg");


//ルーム作成ボタンのクリックイベント
createRoomBtn.addEventListener("click", async () => {

  //ログイン中のユーザー名を入れる
  const user = auth.currentUser;

  //ルーム名を入れれるようにする
  const roomNameInput = document.getElementById("room-name");
  //ルーム名を入れる（前後の空白を削除）
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
      //作成したユーザーID
      createdBy: user.uid,
      //作成した日時
      createdAt: serverTimestamp(),
    });

    //
    const memberRef = doc(db, "rooms", docRef.id, "members", user.uid);
    //
    await setDoc(memberRef, {
      role: "owner",
      joinedAt: serverTimestamp(),
    });

    //ルーム作成成功のメッセージ
    roomCreateMsg.textContent = `ルーム「${roomName}」を作成しました。`;
    //入力欄を空欄にする
    roomNameInput.value = "";
    //ルーム一覧の最新を表示
    loadUserRooms();

  } catch (error) {
    console.error("ルーム作成エラー:", error);
    roomCreateMsg.textContent = "ルーム作成に失敗しました。";
  }
});
