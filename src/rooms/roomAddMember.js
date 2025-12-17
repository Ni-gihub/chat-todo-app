// 
console.log(" roomAddMember.js読み込み成功");

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
// ルーム選択時の処理
import { getCurrentRoomId } from "./roomSelect.js"; 


export async function addMemberByEmail(email) {

  //メールアドレスが無ければ終了
  if (!email) return "メールアドレスが入力されていません";

  try {
    // users コレクションでメールアドレスを検索
    const usersCol = collection(db, "users");
    //同じメールアドレスの人を検索
    const q = query(usersCol, where("email", "==", email));
    //検索結果を取得
    const querySnapshot = await getDocs(q);

    //一致するメールアドレスじゃなければ終了
    if (querySnapshot.empty) {
      return "指定したメールアドレスのユーザーは存在しません";
    }

    // 最初の一致ユーザーを取得（メールアドレスはユニーク想定）
    const userDoc = querySnapshot.docs[0];
    //Firestore ドキュメント IDでユーザーの識別
    const uid = userDoc.id;

    // 現在の選択しているルームに追加
    const roomId = getCurrentRoomId();
    //選択しているルームが無ければ終了
    if (!roomId) return "ルームが選択されていません";

    //Firestore の rooms コレクション内の該当ルームにアクセス。
    const roomRef = doc(db, "rooms", roomId);
    //更新
    await updateDoc(roomRef, {
      //members 配列に UID を追加
      members: arrayUnion(uid)
    });

    return `${email} をルームに追加しました`;
    
  } catch (error) {
    console.error("メンバー追加失敗:", error);
    return "メンバーの追加に失敗しました";
  }
}
