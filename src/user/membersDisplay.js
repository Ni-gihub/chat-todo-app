// membersDisplay.js
console.log("membersDisplay.js 読み込み成功");

//Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";
//Firestore モジュール
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
//現在選択しているルームを取得
import { getCurrentRoomId } from "../rooms/roomSelect.js";

//メンバー一覧
const membersContainer = document.getElementById("members-list");


// 現在選択中のルームのメンバーを取得し、名前を表示（自分はクリックで編集可）
export async function showCurrentRoomMembers() {

  //現在選択しているルームIDを取得
  const roomId = getCurrentRoomId();

  //ルームを選択していない時
  if (!roomId) {
    console.warn("ルームが選択されていません");
    membersContainer.innerHTML = "<li>ルームが選択されていません</li>";
    return;
  }

  try {

    //Firestore の rooms コレクションからルームドキュメントを取得
    const roomDocRef = doc(db, "rooms", roomId);
    const roomDocSnap = await getDoc(roomDocRef);

    //
    //ルームドキュメントが存在しない場合
    if (!roomDocSnap.exists()) {
      console.error("ルームが存在しません");
      membersContainer.innerHTML = "<li>ルームが存在しません</li>";
      return;
    }

    //ルームの members 配列を取得
    const members = roomDocSnap.data().members || [];
    //空の場合は「メンバーがいません」と表示
    if (members.length === 0) {
      membersContainer.innerHTML = "<li>メンバーがいません</li>";
      return;
    }

    //メンバー一覧一旦削除
    membersContainer.innerHTML = "";

    //
    for (const uid of members) {
      //メンバー UID からユーザー情報を取得
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      let userName = "匿名";
      //名前があれば表示（無い場合は匿名）
      if (userDocSnap.exists()) {
        userName = userDocSnap.data().name || "匿名";
      }

      //liを作成
      const li = document.createElement("li");
      //liにユーザー名を入れる
      li.textContent = userName;
      //CSS用にmember-itemを付与する
      li.className = "member-item";

      // 自分のUIDの場合だけクリックで名前編集可能
      if (uid === auth.currentUser?.uid) {

        //カーソルを合わすと出てくる表示
        li.title = "クリックして名前を変更";
        li.style.cursor = "pointer";


        //liのクリックイベントを設定
        li.addEventListener("click", () => {

          // liを編集用のinputに置き換える準備
          const input = document.createElement("input");
          //文字入力用。
          input.type = "text";
          //現在の名前（li.textContent）を設定。
          input.value = li.textContent;
          //CSS用にmember-edit-inputを付与
          input.className = "member-edit-input";

          //liをinputに置き換え。
          li.replaceWith(input);
          //自動的に入力フォーカスを当てる
          input.focus();
          //全選択状態にして、すぐに上書き入力可能にする
          input.select();

          //編集キャンセル用の関数。
          const cancel = () => {
            //inputをliに戻す
            input.replaceWith(li);
          };

          //保存処理を行う関数。
          const save = async () => {

            //名前の前後の空白を除去。
            const newName = input.value.trim();

            //新しい名前が同じか空欄の時はキャンセル
            if (!newName || newName === li.textContent) {
              cancel();
              return;
            }

            try {
              //Firestoreのユーザー情報を更新。
              await updateDoc(userDocRef, {
                //新しい名前を上書き
                name: newName,
                //変更時の時間を記録
                updatedAt: serverTimestamp(),
              });
              //liの表示を新しい名前にする
              li.textContent = newName;
            } catch (e) {
              console.error("名前更新失敗:", e);
              alert("名前変更に失敗しました");
            }
            //inputをliに戻す
            input.replaceWith(li);
          };

          // キー操作とフォーカス外れ時の処理
          input.addEventListener("keydown", (e) => {
            //Enter → 保存
            if (e.key === "Enter") save();
            //Escape → キャンセル
            if (e.key === "Escape") cancel();
          });
          //blur（フォーカスが外れる） → 保存
          input.addEventListener("blur", save);
        });
      }

      //メンバー一覧にliを追加する
      membersContainer.appendChild(li);
    }
  } catch (error) {
    console.error("メンバー取得エラー:", error);
    membersContainer.innerHTML = "<li>メンバーの取得に失敗しました</li>";
  }
}
