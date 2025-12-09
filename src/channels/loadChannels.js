// loadChannels.js
console.log("loadChannels.js 読み込み成功");

// ルーム選択・チャンネル関連モジュール
import { selectChannel } from "./channelSelect.js";

// Firebase 共通設定
import { db } from "../common/firebase-config.js";

// Firestore モジュール
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム関連モジュール
import { getCurrentRoomId } from "../rooms/roomSelect.js";



//チャンネルを表示する場所を入れる
const channelListElement = document.getElementById("channel-list");

//チャンネルをfirestoreから読み取って表示する関数（非同期）
export async function loadChannels() {

  //現在選択しているチャンネルを取得
  const roomId = getCurrentRoomId();
  
  //エラー処理
  //ルームIDがあるかどうか
  if (!roomId) {
    console.warn("チャンネルを読み込むにはルームを選択してください。");
    return;
  }

  try {

    //rooms/roomId/channelsから情報を探す定義する
    const channelsRef = collection(db, "rooms", roomId, "channels");

    //定義したのを持ってくる
    const querySnapshot = await getDocs(channelsRef);

    // 古いチャンネルリストを削除
    channelListElement.innerHTML = "";

    //チャンネルごとにループ処理
    querySnapshot.forEach((doc) => {
      //チャンネルの中に入っている情報を入れる
      const channel = doc.data();
      //liを作成
      const li = document.createElement("li");
      //liにチャンネル名をいれる
      li.textContent = `${channel.name}`;
      //liにチャンネルIDを付与
      li.dataset.channelId = doc.id;
      //CSS用にクラス（channel-item）を追加
      li.classList.add("channel-item");
      //チャンネルをクリック時のクリックイベントを作成
      li.addEventListener("click", () => {
      selectChannel(doc.id, channel.name);
      });
      //作成したliをHTMLに追加
      channelListElement.appendChild(li);
    });

    console.log("チャンネル一覧読み込み成功");
  } catch (error) {
    console.error("チャンネル一覧読み込み失敗:", error);
  }
}