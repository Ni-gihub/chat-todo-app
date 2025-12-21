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

//メールアドレスでルームにメンバーを追加
export async function addMemberByEmail(email) {

  //メールアドレスがないと終了
  if (!email) return "メールアドレスが入力されていません";

  try {
    //users コレクションでメール検索
    const usersCol = collection(db, "users");
    //email が一致する条件
    const q = query(usersCol, where("email", "==", email));
    //条件に合うドキュメントを取得
    const querySnapshot = await getDocs(q);

    //該当ユーザーがいなければ終了
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
      //メンバーの役割を設定
      role: "member",
      //参加時刻
      joinedAt: serverTimestamp()
    });

    //成功のメッセージを返す
    return `${email} をルームに追加しました`;

  } catch (error) {
    console.error("メンバー追加失敗:", error);
    return "メンバーの追加に失敗しました";
  }
}
