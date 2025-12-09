// membersAdd.js
// membersAdd.js

// ルームメンバー関連モジュール
import { addMemberByEmail } from "./roomAddMember.js";    // 同じ rooms/ フォルダ内なら ./ でOK
import { showCurrentRoomMembers } from "../user/membersDisplay.js";  // membersDisplay.js を user/ フォルダに移動した場合

const inviteBtn = document.getElementById("invite-btn");
const inviteEmail = document.getElementById("invite-email");
const inviteMsg = document.getElementById("invite-msg");

if (inviteBtn && inviteEmail && inviteMsg) {
  inviteBtn.addEventListener("click", async () => {
    const email = inviteEmail.value.trim();
    if (!email) {
      inviteMsg.textContent = "メールアドレスを入力してください";
      return;
    }

    try {
      const resultMessage = await addMemberByEmail(email); 
      inviteMsg.textContent = resultMessage;
      inviteEmail.value = "";

      showCurrentRoomMembers();

    } catch (err) {
      console.error(err);
      inviteMsg.textContent = "招待に失敗しました";
    }
  });
}
