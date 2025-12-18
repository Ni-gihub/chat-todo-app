// 
console.log("loadRooms.js（subcollection対応）読み込み成功");

// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";

// Firestore モジュール
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム選択
import { selectRoom } from "./roomSelect.js";

// ルーム一覧
const roomListElement = document.getElementById("room-list");

// ログインユーザーが所属しているルーム一覧を取得
export async function loadUserRooms() {

  const user = auth.currentUser;

  if (!user) {
    console.log("未ログインのためルームは取得しません");
    return;
  }

  try {
    // 一旦一覧をクリア
    roomListElement.innerHTML = "";

    // 全ルーム取得
    const roomsSnapshot = await getDocs(collection(db, "rooms"));

    for (const roomDoc of roomsSnapshot.docs) {
      const roomId = roomDoc.id;
      const roomData = roomDoc.data();

      // このルームの members/{uid} が存在するか確認
      const memberRef = doc(db, "rooms", roomId, "members", user.uid);
      const memberSnap = await getDoc(memberRef);

      // メンバーでなければスキップ
      if (!memberSnap.exists()) continue;

      // ルーム表示
      const li = document.createElement("li");
      li.textContent = roomData.name;
      li.dataset.roomId = roomId;
      li.classList.add("room-item");

      li.addEventListener("click", () => {
        selectRoom(roomId, roomData.name);
      });

      roomListElement.appendChild(li);
    }

    console.log("ルーム一覧更新（subcollection）");

  } catch (error) {
    console.error("ルーム読み込み失敗:", error);
  }
}
