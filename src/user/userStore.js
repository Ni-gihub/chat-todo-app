// userStore.js
console.log("userStore.js 読み込み成功");

import { db } from "../common/firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

export async function saveUserInfo(user) {
  if (!user) return;
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName || "未設定",
      email: user.email || ""
    }, { merge: true });
    console.log("ユーザー情報をFirestoreに保存しました");
  } catch (error) {
    console.error("ユーザー情報保存エラー:", error);
  }
}
