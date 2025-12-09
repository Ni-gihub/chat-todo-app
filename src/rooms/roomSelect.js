// roomSelect.js
console.log("roomSelect.js 読み込み成功");

// ルーム関連モジュール
import { loadChannels } from "../channels/loadChannels.js"; // 同じ rooms/ フォルダ内なので ./ でOK
import { showCurrentRoomMembers } from "../user/membersDisplay.js"; 

// 現在選択されているルームIDを保存する変数
let currentRoomId = null;

/**
 * ルームを選択（クリック）した時の処理
 * @param {string} roomId - FirestoreのルームドキュメントID
 * @param {string} roomName - ルーム名（画面表示用）
 */
export function selectRoom(roomId, roomName) {
  currentRoomId = roomId;
  console.log("選択されたルームID:", roomId);


  
   // すべてのルームアイテムから selected を外す
  const roomItems = document.querySelectorAll(".room-item");
  roomItems.forEach(item => {
    item.classList.remove("selected");
  });

  // クリックされたルームに selected をつける
  const clickedItem = document.querySelector(`[data-room-id="${roomId}"]`);
  if (clickedItem) {
    clickedItem.classList.add("selected");
  }



  // 画面上にルーム名を表示する要素を取得
  const currentRoomTitle = document.getElementById("current-room-title");
  if (currentRoomTitle) {
    currentRoomTitle.textContent = `# ${roomName}`;
  }
  
  showCurrentRoomMembers();

  //チャンネルを読み込む
  loadChannels();
}

/**
 * 現在の選択中ルームIDを返す
 * @returns {string|null}
 */
export function getCurrentRoomId() {
  return currentRoomId;
}
