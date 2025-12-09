// membersDisplay.js
console.log("membersDisplay.js 読み込み成功");

import { db, auth } from "../common/firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getCurrentRoomId } from "../rooms/roomSelect.js";

const membersContainer = document.getElementById("members-list");

// 現在選択中のルームのメンバーを取得し、名前を表示（自分はクリックで編集可）
export async function showCurrentRoomMembers() {
  const roomId = getCurrentRoomId();

  if (!roomId) {
    console.warn("ルームが選択されていません");
    membersContainer.innerHTML = "<li>ルームが選択されていません</li>";
    return;
  }

  try {
    const roomDocRef = doc(db, "rooms", roomId);
    const roomDocSnap = await getDoc(roomDocRef);

    if (!roomDocSnap.exists()) {
      console.error("ルームが存在しません");
      membersContainer.innerHTML = "<li>ルームが存在しません</li>";
      return;
    }

    const members = roomDocSnap.data().members || [];
    if (members.length === 0) {
      membersContainer.innerHTML = "<li>メンバーがいません</li>";
      return;
    }

    membersContainer.innerHTML = "";

    for (const uid of members) {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      let userName = "匿名";
      if (userDocSnap.exists()) {
        userName = userDocSnap.data().name || "匿名";
      }

      const li = document.createElement("li");
      li.textContent = userName;
      li.className = "member-item";

      // 自分の名前だけ編集可能
      if (uid === auth.currentUser?.uid) {
        li.title = "クリックして名前を変更";
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
          // inputに置き換えて編集モード
          const input = document.createElement("input");
          input.type = "text";
          input.value = li.textContent;
          input.className = "member-edit-input";

          li.replaceWith(input);
          input.focus();
          input.select();

          const cancel = () => {
            input.replaceWith(li);
          };

          const save = async () => {
            const newName = input.value.trim();
            if (!newName || newName === li.textContent) {
              cancel();
              return;
            }
            try {
              await updateDoc(userDocRef, {
                name: newName,
                updatedAt: serverTimestamp(),
              });
              li.textContent = newName;
            } catch (e) {
              console.error("名前更新失敗:", e);
              alert("名前変更に失敗しました");
            }
            input.replaceWith(li);
          };

          // Enterで保存、Escでキャンセル、blurでも保存
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          });
          input.addEventListener("blur", save);
        });
      }

      membersContainer.appendChild(li);
    }
  } catch (error) {
    console.error("メンバー取得エラー:", error);
    membersContainer.innerHTML = "<li>メンバーの取得に失敗しました</li>";
  }
}
