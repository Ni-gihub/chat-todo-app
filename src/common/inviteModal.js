console.log("inviteModal.js loaded");

//メンバーを追加する
import { addMemberByEmail } from "../rooms/roomAddMember.js";
//メンバーを表示する
import { subscribeRoomMembers } from "../user/membersDisplay.js";

//招待ボタン
const inviteBtn = document.getElementById("invite-btn");
//招待用モーダル
const modal = document.getElementById("invite-modal");
//モーダル背景のオーバーレイ
const overlay = modal?.querySelector(".modal-overlay");
// キャンセルボタン
const cancelBtn = document.getElementById("invite-cancel");
// 送信ボタン
const submitBtn = document.getElementById("invite-submit");
//メールアドレス入力欄
const input = document.getElementById("invite-input");

// モーダルを開く
function openInviteModal() {
  //モーダルがない時は何もしない（削除した時の保険）
  if (!modal) return;
  //クラスhiddenを外してモーダルを表示
  modal.classList.remove("hidden");
}

//モーダルを閉じる
function closeInviteModal() {
  // モーダルが存在しなければ何もしない（削除した時の保険）
  if (!modal) return;
  //クラスhiddenを付けてモーダルを非表示
  modal.classList.add("hidden");
  // メールアドレス入力欄を空にする
  input.value = "";
}

// 招待ボタンをクリックしたらモーダルを開く
inviteBtn?.addEventListener("click", openInviteModal);

//キャンセルボタンをクリックしたらモーダルを閉じる 
cancelBtn?.addEventListener("click", closeInviteModal);
//モーダル背景をクリックしたらモーダルを閉じる
overlay?.addEventListener("click", closeInviteModal);

// 送信ボタンをクリックしたとき
submitBtn?.addEventListener("click", async () => {
  //入力値の前後の空白を削除
  const value = input.value.trim();

  //入力されていない場合は終了
  if (!value) {
    alert("メールアドレスを入力してください");
    return;
  }

  //メールアドレスでメンバーを追加
  const result = await addMemberByEmail(value);
  //結果報告
  alert(result);

  //メンバーリストを更新
  await subscribeRoomMembers();

  //モーダルを閉じる
  closeInviteModal();
});
