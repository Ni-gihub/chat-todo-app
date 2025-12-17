// 
console.log("userStore.js 読み込み成功");

//Firebase 共通設定
import { db } from "../common/firebase-config.js";
//Firestore モジュール
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

//ユーザー情報を保存
export async function saveUserInfo(user) {

  //user が渡されていなければ処理中止
  if (!user) return;

  try {
    //Firestoreのusersコレクション内にuser.uidをIDとするドキュメントを作成・更新
    await setDoc(doc(db, "users", user.uid), {
      //ユーザーID
      uid: user.uid,
      //表示名（なければ "未設定"）
      name: user.displayName || "未設定",
      //メールアドレス（なければ空文字）
      email: user.email || ""
      //上書きせず、渡したフィールドだけ更新
    }, { merge: true });

    console.log("ユーザー情報をFirestoreに保存しました");
  } catch (error) {
    console.error("ユーザー情報保存エラー:", error);
  }
}
