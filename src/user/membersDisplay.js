// membersDisplay.js
console.log("membersDisplay.js 読み込み成功（リアルタイム）");

import { db, auth } from "../common/firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { getCurrentRoomId } from "../rooms/roomSelect.js";

const membersContainer = document.getElementById("members-list");

// リアルタイム監視解除用
let unsubscribeMembers = null;

export function subscribeRoomMembers() {
  const roomId = getCurrentRoomId();

  if (!roomId) {
    membersContainer.innerHTML = "<li>ルームが選択されていません</li>";
    return;
  }

  // 前回の監視を解除（超重要）
  if (unsubscribeMembers) {
    unsubscribeMembers();
    unsubscribeMembers = null;
  }

  const membersCol = collection(db, "rooms", roomId, "members");

  // リアルタイム監視
  unsubscribeMembers = onSnapshot(membersCol, async (snapshot) => {
    membersContainer.innerHTML = "";

    if (snapshot.empty) {
      membersContainer.innerHTML = "<li>メンバーがいません</li>";
      return;
    }

    for (const memberDoc of snapshot.docs) {
      const uid = memberDoc.id;

      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      let userName = "匿名";
      if (userSnap.exists()) {
        userName = userSnap.data().name || "匿名";
      }

      const li = document.createElement("li");
      li.className = "member-item";
      li.textContent = userName;

      // 自分だけ編集可
      if (uid === auth.currentUser?.uid) {
        li.title = "クリックして名前を変更";
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
          const input = document.createElement("input");
          input.type = "text";
          input.value = userName;
          input.className = "member-edit-input";

          li.replaceWith(input);
          input.focus();
          input.select();

          const cancel = () => input.replaceWith(li);

          const save = async () => {
            const newName = input.value.trim();
            if (!newName || newName === userName) {
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

          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          });

          input.addEventListener("blur", save);
        });
      }

      membersContainer.appendChild(li);
    }
  });
}
