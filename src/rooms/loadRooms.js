// 
console.log("loadRooms.js 読み込み成功");

// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";
// Firestore モジュール
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// ルーム選択
import { selectRoom } from "./roomSelect.js";


// ルーム一覧
const roomListElement = document.getElementById("room-list");

//ログインしているユーザーが所属するルーム一覧を読み込む処理（非同期）
export async function loadUserRooms() {

  //現在ログイン中のユーザーを入れる
  const user = auth.currentUser;

  //エラー処理
  //ログインしていない場合は終了
  if (!user) {
    console.log("未ログインのためルームは取得しません");
    return;
  }

  try {
    // members に自分の UID を含むルームを取得
    //クエリ q を定義
    const q = query(
      //roomsのコレクションを参照（firestore）
      collection(db, "rooms"),
      //membersに自分のUIDが含まれているルームを探す
      where("members", "array-contains", user.uid)
    );

     // onSnapshotでリアルタイム更新
    onSnapshot(q, (querySnapshot) => {
      // 古いデータを削除
      roomListElement.innerHTML = "";

      //ルーム事にループする
      querySnapshot.forEach((doc) => {
        //ルームのデータを入れる
        const room = doc.data();
        //liを作成
        const li = document.createElement("li");
        //room.name を表示
        li.textContent = room.name;
        //dataset.roomId にドキュメント ID を保存
        li.dataset.roomId = doc.id;
        //css用に"room-item"を付与
        li.classList.add("room-item");
        //クリックで selectRoomを呼ぶ
        li.addEventListener("click", () => {
          selectRoom(doc.id, room.name);
        });
        //liをルーム一覧に追加する
        roomListElement.appendChild(li);
      });

      console.log("ルーム一覧更新");
    });
  } catch (error) {
    console.error("ルーム読み込み失敗:", error);
  }
}
