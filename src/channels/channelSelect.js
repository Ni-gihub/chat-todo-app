// channelSelect.js
console.log("channelSelect.js 読み込み成功");
// メッセージ関連モジュール
import { startMessageListener } from "../messages/messageDisplay.js";

// Todo関連モジュール
import { startTodoListener } from "../todo/todoDisplay.js";

let currentChannelId = null;

/**
 * チャンネルを選択（クリック）した時の処理
 * @param {string} channelId - FirestoreのチャンネルドキュメントID
 * @param {string} channelName - チャンネル名（画面表示用）
 */
export function selectChannel(channelId, channelName) {
  currentChannelId = channelId;
  console.log("選択されたチャンネルID:", channelId);

  // すべてのチャンネルアイテムから selected を外す
  const channelItems = document.querySelectorAll(".channel-item");
  channelItems.forEach(item => {
    item.classList.remove("selected");
  });

  // クリックされたチャンネルに selected をつける
  const clickedItem = document.querySelector(`[data-channel-id="${channelId}"]`);
  if (clickedItem) {
    clickedItem.classList.add("selected");
  }

  startTodoListener();

  //チャンネル内のメッセージを表示
  startMessageListener();
}

/**
 * 現在の選択中チャンネルIDを返す
 */
export function getCurrentChannelId() {
  return currentChannelId;
}
