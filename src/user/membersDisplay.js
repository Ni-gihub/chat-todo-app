// membersDisplay.js
console.log("membersDisplay.js 読み込み成功（リアルタイム）");

//Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";
//Firestore モジュール
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
//ルームIDを取得
import { getCurrentRoomId } from "../rooms/roomSelect.js";

//メンバー一覧
const membersContainer = document.getElementById("members-list");

// リアルタイム監視解除用
let unsubscribeMembers = null;


//現在のルームのメンバーをリアルタイムで監視・表示する
export function subscribeRoomMembers() {
  //現在選択中のルームIDを取得
  const roomId = getCurrentRoomId();

  //ルームが選択されていない場合
  if (!roomId) {
    membersContainer.innerHTML = "<li>ルームが選択されていません</li>";
    return;
  }

  // 前回の監視を解除
  if (unsubscribeMembers) {
    unsubscribeMembers();
    unsubscribeMembers = null;
  }

  //rooms/{roomId}/members コレクションを参照
  const membersCol = collection(db, "rooms", roomId, "members");

  // リアルタイム監視開始
  unsubscribeMembers = onSnapshot(membersCol, async (snapshot) => {

    //表示をクリア
    membersContainer.innerHTML = "";

    //メンバーがいない場合
    if (snapshot.empty) {
      membersContainer.innerHTML = "<li>メンバーがいません</li>";
      return;
    }

    //各メンバーを1人ずつ
    for (const memberDoc of snapshot.docs) {
      //メンバーのUID
      const uid = memberDoc.id;
      
      //users/{uid} からユーザー情報を取得
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      //表示用の名前
      let userName = "匿名";
      if (userSnap.exists()) {
        userName = userSnap.data().name || "匿名";
      }

      //li 要素を作成
      const li = document.createElement("li");
      //CSS用のクラス設定
      li.className = "member-item";
      li.textContent = userName;

      // 自分だけ編集可
      if (uid === auth.currentUser?.uid) {
        li.title = "クリックして名前を変更";
        li.style.cursor = "pointer";

        //
        li.addEventListener("click", () => {
          //クリックすると編集モードへ
          const input = document.createElement("input");
          // input 要素を作成
          input.type = "text";
          input.value = userName;
          input.className = "member-edit-input";

          // li を input に置き換える
          li.replaceWith(input);
          input.focus();
          input.select();

          //編集キャンセル処理
          const cancel = () => input.replaceWith(li);

          //保存処理
          const save = async () => {
            const newName = input.value.trim();

            //空 or 変更なしなら何もしない
            if (!newName || newName === userName) {
              cancel();
              return;
            }

            try {
              // Firestore の users/{uid} を更新
              await updateDoc(userDocRef, {
                //名前
                name: newName,
                //更新時間
                updatedAt: serverTimestamp(),
              });
              // 表示名も更新
              li.textContent = newName;
            } catch (e) {
              console.error("名前更新失敗:", e);
              alert("名前変更に失敗しました");
            }

            //input を li に戻す
            input.replaceWith(li);
          };

          // Enter → 保存 / Escape → キャンセル
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          });

          //フォーカスが外れたら保存
          input.addEventListener("blur", save);
        });
      }

      //メンバー一覧に追加
      membersContainer.appendChild(li);
    }
  });
}
