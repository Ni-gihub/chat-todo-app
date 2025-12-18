// 
console.log("roomAddMember.js 読み込み成功");

// Firebase 共通設定
import { db } from "../common/firebase-config.js";

// Firestore モジュール
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム選択時の処理
import { getCurrentRoomId } from "./roomSelect.js";

export async function addMemberByEmail(email) {

  if (!email) return "メールアドレスが入力されていません";

  try {
    // users コレクションでメール検索
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "指定したメールアドレスのユーザーは存在しません";
    }

    // UID 取得
    const userDoc = querySnapshot.docs[0];
    const uid = userDoc.id;

    // 現在のルームID取得
    const roomId = getCurrentRoomId();
    if (!roomId) return "ルームが選択されていません";

    // subcollection members に追加
    const memberRef = doc(db, "rooms", roomId, "members", uid);

    await setDoc(memberRef, {
      role: "member",
      joinedAt: serverTimestamp()
    });

    return `${email} をルームに追加しました`;

  } catch (error) {
    console.error("メンバー追加失敗:", error);
    return "メンバーの追加に失敗しました";
  }
}
