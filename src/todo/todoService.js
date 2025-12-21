// todoService.js
console.log("todoService.js 読み込み成功");

//Firebase 共通設定
import { db } from "../common/firebase-config.js";
//Firestore モジュール
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

/**
 * /todo コマンドの処理
 * @param {object} command { action, taskName, assignee, dueDate }
 * @param {string} roomId 
 * @param {string} channelId 
 * @returns 処理結果メッセージなど
 */
export async function handleTodoCommand(command, roomId, channelId) {

  //引数チェック
  if (!command || !roomId || !channelId) {
    throw new Error("引数が不足しています");
  }

  //タスクを保存しているコレクションを取得
  const todosCol = collection(db, "rooms", roomId, "channels", channelId, "todos");

  // タスク名で検索
  const q = query(todosCol, where("taskName", "==", command.taskName));
  //一致するドキュメントが格納される
  const querySnapshot = await getDocs(q);

  //アクションがdeleteの場合
  if (command.action === "delete") {

    // タスクが存在しない場合はメッセージを返却
    if (querySnapshot.empty) {
      return `タスク「${command.taskName}」は存在しません。`;
    }

    // 1件だけ想定なので最初のドキュメントを削除
    const docRef = querySnapshot.docs[0].ref;
    //Firestore の deleteDoc で削除
    await deleteDoc(docRef);
    //メッセージを返却
    return `タスク「${command.taskName}」を削除しました。`;

  //アクションがaddの場合
  } else if (command.action === "add") {
    //アクションがaddの場合
    if (command.action === "add") {

      //タスクが存在しない場合
      if (querySnapshot.empty) {
        // 指定したコレクションに新しいドキュメントを追加する
        const newTodo = {
          taskName: command.taskName,
          completed: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (command.assignee !== undefined) {
          newTodo.assignee = command.assignee;
        }

        if (command.dueDate !== undefined) {
          newTodo.dueDate = command.dueDate;
        }

        await addDoc(todosCol, newTodo);

        //メッセージを返却
        return `タスク「${command.taskName}」を追加しました。`;

      //タスクが存在する場合
      } else {
        // 既存のドキュメントを更新
        const docRef = querySnapshot.docs[0].ref;

        // 更新するフィールドだけまとめる
        const updateData = {};


        //担当者が指定されている
        if (command.assignee !== undefined && command.assignee !== "") {
          //updateData に追加。
          updateData.assignee = command.assignee;
        }
        //期限日が指定されている
        if (command.dueDate !== undefined && command.dueDate !== "") {
          //updateData に追加
          updateData.dueDate = command.dueDate;
        }


        //更新対象があるかをチェック
        if (Object.keys(updateData).length > 0) {
          //更新日時を上書き
          updateData.updatedAt = serverTimestamp();
          //Firestore 上の既存ドキュメントを更新
          await updateDoc(docRef, updateData);
          //メッセージを返却
          return `タスク「${command.taskName}」を更新しました。`;

        //何も指定されていなければ「更新項目がありません」
        } else {
          return `更新項目がありません。`;
        }
      }
    }
  
  //アクションがdoneとundoneの場合
  } else if (command.action === "done" || command.action === "undone") {

    //タスクが存在しない場合
    if (querySnapshot.empty) {
      //メッセージを返却
      return `タスク「${command.taskName}」は存在しません。`;
    }

    //対象タスクの Firestore ドキュメント参照
    const docRef = querySnapshot.docs[0].ref;

    //既存ドキュメントを更新。
    await updateDoc(docRef, {
      //"done" なら true、 "undone" なら false
      completed: command.action === "done",
      //更新日時を上書き
      updatedAt: serverTimestamp(),
    });

    //完了のメッセージを返却
    return `タスク「${command.taskName}」を${command.action === "done" ? "完了" : "未完了"}にしました。`;

  //上記の４種類以外のアクションが来た場合
  }else {
    throw new Error(`未知のアクション: ${command.action}`);
  }
}
