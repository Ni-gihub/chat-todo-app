//選択しているチャンネルのハイライトの変更
//チャンネルのTodoリストとメッセージの変更
//現在選択されているチャンネルIDを管理（取得）
console.log("channelSelect.js 読み込み成功");

// メッセージを表示する関数
import { startMessageListener } from "../messages/messageDisplay.js";
// Todoリストを表示する関数
import { startTodoListener } from "../todo/todoDisplay.js";

//現在選択中のチャンネルIDを保持する(初期値はnull)
let currentChannelId = null;

/**
 * チャンネルを選択（クリック）した時の処理
 * @param {string} channelId - FirestoreのチャンネルドキュメントID
 * @param {string} channelName - チャンネル名（画面表示用）
*/


//クリックされたチャンネルを選択する関数
export function selectChannel(channelId) {

  //現在選択チャンネルを更新
  currentChannelId = channelId;

  console.log("選択されたチャンネルID:", channelId);

  // すべてのチャンネルアイテムから selected を外す
  //前に選択されていたチャンネルのハイライトを外す
  const channelItems = document.querySelectorAll(".channel-item");
  channelItems.forEach(item => {
    item.classList.remove("selected");
  });

  // クリックされたチャンネルに selected をつける
  //選択中のチャンネルをハイライト表示
  const clickedItem = document.querySelector(`[data-channel-id="${channelId}"]`);
  if (clickedItem) {
    clickedItem.classList.add("selected");
  }

  //選択したチャンネルのTodoリストを画面に表示
  startTodoListener();

  //選択したチャンネルのメッセージを表示
  startMessageListener();

}

//現在選択されているチャンネルを取得
export function getCurrentChannelId() {
  return currentChannelId;
}
