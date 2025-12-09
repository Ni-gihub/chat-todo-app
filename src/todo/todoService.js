// todoService.js
console.log("todoService.js 読み込み成功");

import { db } from "../common/firebase-config.js";
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
  if (!command || !roomId || !channelId) {
    throw new Error("引数が不足しています");
  }

  const todosCol = collection(db, "rooms", roomId, "channels", channelId, "todos");

  // タスク名で検索
  const q = query(todosCol, where("taskName", "==", command.taskName));
  const querySnapshot = await getDocs(q);

  if (command.action === "delete") {
    // 削除処理
    if (querySnapshot.empty) {
      return `タスク「${command.taskName}」は存在しません。`;
    }
    // 1件だけ想定なので最初のドキュメントを削除
    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);
    return `タスク「${command.taskName}」を削除しました。`;
  } else if (command.action === "add") {
    // 追加・更新処理
    if (command.action === "add") {
  if (querySnapshot.empty) {
    // 新規追加
    await addDoc(todosCol, {
      taskName: command.taskName,
      assignee: command.assignee || null,
      dueDate: command.dueDate || null,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return `タスク「${command.taskName}」を追加しました。`;
  } else {
    // 既存のドキュメントを更新
    const docRef = querySnapshot.docs[0].ref;

    // 更新するフィールドだけ抽出
    const updateData = {};
    if (command.assignee !== undefined && command.assignee !== "") {
      updateData.assignee = command.assignee;
    }
    if (command.dueDate !== undefined && command.dueDate !== "") {
      updateData.dueDate = command.dueDate;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = serverTimestamp();
      await updateDoc(docRef, updateData);
      return `タスク「${command.taskName}」を更新しました。`;
    } else {
      return `更新項目がありません。`;
    }
  }
}
  } else if (command.action === "done" || command.action === "undone") {
    if (querySnapshot.empty) {
      return `タスク「${command.taskName}」は存在しません。`;
    }
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      completed: command.action === "done",
      updatedAt: serverTimestamp(),
    });
    return `タスク「${command.taskName}」を${command.action === "done" ? "完了" : "未完了"}にしました。`;
  }else {
    throw new Error(`未知のアクション: ${command.action}`);
  }
}
