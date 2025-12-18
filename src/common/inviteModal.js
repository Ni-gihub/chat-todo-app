console.log("inviteModal.js loaded");

import { addMemberByEmail } from "../rooms/roomAddMember.js";
import { subscribeRoomMembers } from "../user/membersDisplay.js";

const inviteBtn = document.getElementById("invite-btn");
const modal = document.getElementById("invite-modal");
const overlay = modal?.querySelector(".modal-overlay");
const cancelBtn = document.getElementById("invite-cancel");
const submitBtn = document.getElementById("invite-submit");
const input = document.getElementById("invite-input");

function openInviteModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeInviteModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  input.value = "";
}

// 開く
inviteBtn?.addEventListener("click", openInviteModal);

// 閉じる
cancelBtn?.addEventListener("click", closeInviteModal);
overlay?.addEventListener("click", closeInviteModal);

// 招待する
submitBtn?.addEventListener("click", async () => {
  const value = input.value.trim();
  if (!value) {
    alert("メールアドレスを入力してください");
    return;
  }

  const result = await addMemberByEmail(value);
  alert(result);

  await subscribeRoomMembers();
  closeInviteModal();
});
