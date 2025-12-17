// roomSelect.js
console.log("roomSelect.js 読み込み成功");

// チャンネル一覧を表示
import { loadChannels } from "../channels/loadChannels.js"; 
//
import { showCurrentRoomMembers } from "../user/membersDisplay.js"; 

// 現在選択されているルームIDを保存する変数(初期値はnull)
let currentRoomId = null;

/**
 * ルームを選択（クリック）した時の処理
 * @param {string} roomId - FirestoreのルームドキュメントID
 * @param {string} roomName - ルーム名（画面表示用）
 */
export function selectRoom(roomId, roomName) {

  //選択したルーム ID を変数に保存
  currentRoomId = roomId;
  console.log("選択されたルームID:", roomId);


  
  // すべてのルームアイテムから selected を外す
  //前に選択されていたルームのハイライトを外す
  const roomItems = document.querySelectorAll(".room-item");
  roomItems.forEach(item => {
    item.classList.remove("selected");
  });

  // クリックされたルームに selected をつける
  //選択中のチャンネルをハイライト表示
  const clickedItem = document.querySelector(`[data-room-id="${roomId}"]`);
  if (clickedItem) {
    clickedItem.classList.add("selected");
  }



  // 画面上にルーム名を表示する要素を取得
  const currentRoomTitle = document.getElementById("current-room-title");
  //ルームが存在して表示できるなら、タイトルに # ルーム名 を書く
  if (currentRoomTitle) {
    currentRoomTitle.textContent = `# ${roomName}`;
  }
  
  //ルーム内のメンバーを表示
  showCurrentRoomMembers();

  //チャンネル一覧を読み込む
  loadChannels();
}

/**
 * 現在の選択中ルームIDを返す
 * @returns {string|null}
 */
//現在選択中のルーム ID を取得
export function getCurrentRoomId() {
  return currentRoomId;
}
