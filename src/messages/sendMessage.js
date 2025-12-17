// 
console.log("sendMessage.js 読み込み成功");

// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";
// Firestore モジュール
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// 選択しているルームを取得
import { getCurrentRoomId } from "../rooms/roomSelect.js";
// 選択しているチャンネルを取得
import { getCurrentChannelId } from "../channels/channelSelect.js";
// 
import { parseTodoCommand } from "../todo/commandParser.js";
// 
import { handleTodoCommand } from "../todo/todoService.js";



// メッセージ入力欄
const messageInput = document.getElementById("message-input");
// 送信ボタン
const sendBtn = document.getElementById("send-message-btn");

//送信ボタンをクリック（非同期）
sendBtn.addEventListener("click", async () => {

  //現在選択しているルーム・チャンネルを取得
  const roomId = getCurrentRoomId();
  const channelId = getCurrentChannelId();
  //ログイン中のユーザーを取得
  const user = auth.currentUser;
  //入力テキストを取得
  const text = messageInput.value.trim();

  //エラー処理
  //ルーム、チャンネル、ユーザー、メッセージ本文のどれかが無ければ送信取り消し
  if (!roomId || !channelId || !user || !text) {
    console.log("送信条件が揃っていません");
    return;
  }

  try {

    //マンド処理の結果メッセージを入れる変数を初期化。
    let commandResultMessage = null;

    // コマンドがあるかの確認
    const parsedCommand = parseTodoCommand(text);

    //コマンドの場合
    if (parsedCommand) {
      // コマンド処理を実行して結果をcommandResultMessageに入れる
      commandResultMessage = await handleTodoCommand(parsedCommand, roomId, channelId);
    }

    // Firestore に ユーザーのメッセージを送信。
    await addDoc(
      collection(db, "rooms", roomId, "channels", channelId, "messages"),
      {
        //本文
        text,
        //送信した時間
        createdAt: serverTimestamp(),
        //ユーザーID
        createdBy: user.uid,
        //ユーザー名（なければ匿名）
        createdByName: user.displayName || "匿名",
      }
    );

    // コマンド結果があればシステムメッセージとして送信
    if (commandResultMessage) {
      await addDoc(
        collection(db, "rooms", roomId, "channels", channelId, "messages"),
        {
          //コマンドの処理結果
          text: commandResultMessage,
          //送信した時間
          createdAt: serverTimestamp(),
          //区別用の特別id
          createdBy: "system",
          //ユーザー名にシステム
          createdByName: "システム",
        }
      );
    }

    //メッセージ入力欄を空欄にする
    messageInput.value = "";
    console.log("メッセージ送信成功");
  } catch (error) {
    console.error("送信エラー:", error);
  }
});
