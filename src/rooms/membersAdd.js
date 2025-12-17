// メンバー招待のエラー処理や成功・失敗の表示する処理
console.log("membersAdd.js 読み込み成功");

// ルームにメンバーを入れる
import { addMemberByEmail } from "./roomAddMember.js";    
// メンバーを表示
import { showCurrentRoomMembers } from "../user/membersDisplay.js";  

//招待ボタン
const inviteBtn = document.getElementById("invite-btn");
//メールアドレス入力欄
const inviteEmail = document.getElementById("invite-email");
//結果メッセージを表示
const inviteMsg = document.getElementById("invite-msg");

//すべての要素が存在する場合のみクリックイベントを設定。
// 今後、メンバー招待の場所を移動する予定の保険
if (inviteBtn && inviteEmail && inviteMsg) {

  //招待ボタンをクリック
  inviteBtn.addEventListener("click", async () => {

    //入力されたメールアドレスを取得し、前後の空白を削除。
    const email = inviteEmail.value.trim();

    //メールアドレスが無いと終了
    if (!email) {
      inviteMsg.textContent = "メールアドレスを入力してください";
      return;
    }

    try {

      //addMemberByEmail(email) でルームにユーザーを追加
      const resultMessage = await addMemberByEmail(email); 
      //成功メッセージを inviteMsg に表示。
      inviteMsg.textContent = resultMessage;
      //メールアドレス欄を空欄にする
      inviteEmail.value = "";
      //ルームのメンバー一覧を更新して画面に表示
      showCurrentRoomMembers();

    } catch (err) {
      console.error(err);
      inviteMsg.textContent = "招待に失敗しました";
    }
  });
}
