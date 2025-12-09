// channelCreate.js
console.log("channelCreate.js 読み込み成功");

// 共通の Firebase 設定を import
import { db, auth } from "../common/firebase-config.js";  

// Firestore モジュール
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム関連モジュール
import { getCurrentRoomId } from "../rooms/roomSelect.js";
import { loadChannels } from "./loadChannels.js";

//HTML要素を取得
//チャンネル作成ボタン
const createChannelBtn = document.getElementById("create-channel-btn");
//メッセージ
const channelCreateMsg = document.getElementById("channel-create-msg");

//チャンネルの作成ボタンのクリックイベント
createChannelBtn.addEventListener("click", async () => {

  //入力欄
  const channelNameInput = document.getElementById("channel-name");

  //入力されたチャンネル名を入れる
  const channelName = channelNameInput.value.trim();

  //現在選択されているルームIDを取得
  const roomId = getCurrentRoomId();

  //ログイン中のユーザーを取得
  const user = auth.currentUser;

  //エラー処理
  //チャンネル名が入っているか
  if (!channelName) {
    channelCreateMsg.textContent = "チャンネル名を入力してください。";
    return;
  }

  //ルームIDがあるか
  if (!roomId) {
    channelCreateMsg.textContent = "ルームを選択してください。";
    return;
  }

  //アカウントがあるか
  if (!user) {
    channelCreateMsg.textContent = "ログイン状態が不明です。";
    return;
  }
  
  try {

    //rooms/roomId/channelsに出来る
    await addDoc(collection(db, "rooms", roomId, "channels"), {
      //チャンネル名
      name: channelName,
      //製作者のID
      createdBy: user.uid,
      //作成時間
      createdAt: serverTimestamp(),
    });

    //メッセージの表示
    channelCreateMsg.textContent = `チャンネル「${channelName}」を作成しました！`;

    //入力欄を空欄にする
    channelNameInput.value = "";
    //チャンネルを読み込む
    loadChannels();
  } catch (error) {
    console.error("チャンネル作成エラー:", error);
    channelCreateMsg.textContent = "チャンネルの作成に失敗しました。";
  }
});
