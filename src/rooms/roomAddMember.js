// Firebase 共通設定
import { db } from "../common/firebase-config.js";

// Firestore モジュール
import { 
  collection,
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム関連モジュール
import { getCurrentRoomId } from "./roomSelect.js";  // 同じ rooms/ フォルダ内なら ./ でOK


export async function addMemberByEmail(email) {
  if (!email) return "メールアドレスが入力されていません";

  try {
    // users コレクションでメールアドレスを検索
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return "指定したメールアドレスのユーザーは存在しません";
    }

    // 最初の一致ユーザーを取得（メールアドレスはユニーク想定）
    const userDoc = querySnapshot.docs[0];
    const uid = userDoc.id;

    // 現在のルームに追加
    const roomId = getCurrentRoomId();
    if (!roomId) return "ルームが選択されていません";

    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      members: arrayUnion(uid)
    });

    return `${email} をルームに追加しました`;
  } catch (error) {
    console.error("メンバー追加失敗:", error);
    return "メンバーの追加に失敗しました";
  }
}
