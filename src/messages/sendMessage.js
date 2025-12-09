// sendMessage.js
console.log("sendMessage.js 読み込み成功");

// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";

// Firestore モジュール
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム・チャンネル関連モジュール
import { getCurrentRoomId } from "../rooms/roomSelect.js";
import { getCurrentChannelId } from "../channels/channelSelect.js";

// Todo関連モジュール
import { parseTodoCommand } from "../todo/commandParser.js";
import { handleTodoCommand } from "../todo/todoService.js";

// メッセージ入力欄
const messageInput = document.getElementById("message-input");
// 送信ボタン
const sendBtn = document.getElementById("send-message-btn");

sendBtn.addEventListener("click", async () => {
  const roomId = getCurrentRoomId();
  const channelId = getCurrentChannelId();
  const user = auth.currentUser;
  const text = messageInput.value.trim();

  if (!roomId || !channelId || !user || !text) {
    console.log("送信条件が揃っていません");
    return;
  }

  try {
    let commandResultMessage = null;

    // コマンド解析
    const parsedCommand = parseTodoCommand(text);

    if (parsedCommand) {
      // コマンド処理を実行
      commandResultMessage = await handleTodoCommand(parsedCommand, roomId, channelId);
    }

    // 元のメッセージはそのまま送信
    await addDoc(
      collection(db, "rooms", roomId, "channels", channelId, "messages"),
      {
        text,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: user.displayName || "匿名",
      }
    );

    // コマンド結果があればシステムメッセージとして送信
    if (commandResultMessage) {
      await addDoc(
        collection(db, "rooms", roomId, "channels", channelId, "messages"),
        {
          text: commandResultMessage,
          createdAt: serverTimestamp(),
          createdBy: "system",       // 特別IDなど
          createdByName: "システム",
        }
      );
    }

    messageInput.value = "";
    console.log("メッセージ送信成功");
  } catch (error) {
    console.error("送信エラー:", error);
  }
});
