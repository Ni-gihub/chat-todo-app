import { db } from "../common/firebase-config.js";  // Firebase 設定
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { getCurrentRoomId } from "../rooms/roomSelect.js";
import { getCurrentChannelId } from "../channels/channelSelect.js";

const todoList = document.getElementById("todo-list");

// フィルター・ソート用のselect要素を取得
const filterSelect = document.getElementById("todo-filter");
const sortSelect = document.getElementById("todo-sort");
const searchInput = document.getElementById("todo-search");

let unsubscribeTodos = null;
let currentTodos = [];  // 取得データを一時保持

export function startTodoListener() {
  const roomId = getCurrentRoomId();
  const channelId = getCurrentChannelId();

  if (!roomId || !channelId) {
    console.warn("ルームIDまたはチャンネルIDがありません");
    return;
  }

  if (unsubscribeTodos) {
    unsubscribeTodos();
  }

  const todosCol = collection(db, "rooms", roomId, "channels", channelId, "todos");
  const q = query(todosCol);

  unsubscribeTodos = onSnapshot(q, (snapshot) => {
    currentTodos = [];
    snapshot.forEach(docSnap => {
      currentTodos.push({
        id: docSnap.id,
        ref: docSnap.ref,
        data: docSnap.data()
      });
    });
    renderTodos();
  });

  // フィルター・ソートの選択変更イベントをセット
  filterSelect.addEventListener("change", renderTodos);
  sortSelect.addEventListener("change", renderTodos);
  searchInput.addEventListener("input", renderTodos);
}

// フィルター・ソートして描画する関数
function renderTodos() {
  todoList.innerHTML = "";

  const filterValue = filterSelect.value;
  const sortValue = sortSelect.value;
  const searchValue = searchInput.value.trim().toLowerCase();

  // フィルター
  let filtered = currentTodos.filter(({ data }) => {
    if (filterValue === "completed") return data.completed === true;
    if (filterValue === "incomplete") return !data.completed;
    return true;
  });

  // 検索（タスク名か担当に検索語が含まれるか）
  if (searchValue) {
    filtered = filtered.filter(({ data }) => {
      const taskName = data.taskName ? data.taskName.toLowerCase() : "";
      const assignee = data.assignee ? data.assignee.toLowerCase() : "";
      return taskName.includes(searchValue) || assignee.includes(searchValue);
    });
  }

  // ソート
  filtered.sort((a, b) => {
    const aData = a.data;
    const bData = b.data;

    if (sortValue === "dueDateAsc") {
      return (aData.dueDate || "") > (bData.dueDate || "") ? 1 : -1;
    } else if (sortValue === "dueDateDesc") {
      return (aData.dueDate || "") < (bData.dueDate || "") ? 1 : -1;
    } else if (sortValue === "taskNameAsc") {
      return aData.taskName.localeCompare(bData.taskName);
    } else if (sortValue === "taskNameDesc") {
      return bData.taskName.localeCompare(aData.taskName);
    }
    return 0;
  });

  if (filtered.length === 0) {
    todoList.textContent = "タスクはありません";
    return;
  }

  filtered.forEach(({ ref, data }) => {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    li.style.position = "relative";

    // チェックボックス
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!data.completed;
    checkbox.classList.add("todo-checkbox");
    checkbox.addEventListener("change", async () => {
      try {
        await updateDoc(ref, {
          completed: checkbox.checked,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Todo完了状態の更新失敗:", error);
        checkbox.checked = !checkbox.checked;
      }
    });

    // タスク内容部分
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("todo-content");

    const taskNameDiv = document.createElement("div");
    taskNameDiv.classList.add("todo-task");
    taskNameDiv.textContent = data.taskName;

    // taskName編集（クリックでinput化）
    taskNameDiv.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = taskNameDiv.textContent;
      input.classList.add("todo-edit-input");

      contentDiv.replaceChild(input, taskNameDiv);
      input.focus();

      const saveEdit = async () => {
        const newValue = input.value.trim();
        if (newValue && newValue !== data.taskName) {
          try {
            await updateDoc(ref, { taskName: newValue, updatedAt: new Date() });
            taskNameDiv.textContent = newValue;
          } catch (error) {
            console.error("タスク名更新失敗:", error);
          }
        }
        contentDiv.replaceChild(taskNameDiv, input);
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
      });
      input.addEventListener("blur", saveEdit);
    });

    // 担当・期限のmeta部分
    const metaDiv = document.createElement("div");
    metaDiv.classList.add("todo-meta");
    metaDiv.innerHTML = `
      ${data.assignee ? `<span class="todo-assignee">@${data.assignee}</span>` : ""}
      ${data.dueDate ? `<span class="todo-due">期限: ${data.dueDate}</span>` : ""}
    `;

    // assignee編集
    const assigneeSpan = metaDiv.querySelector(".todo-assignee");
    if (assigneeSpan) {
      assigneeSpan.style.cursor = "pointer";
      assigneeSpan.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = data.assignee || "";
        input.classList.add("todo-edit-input");
        metaDiv.replaceChild(input, assigneeSpan);
        input.focus();

        const saveEdit = async () => {
          const newValue = input.value.trim() || null;
          try {
            await updateDoc(ref, { assignee: newValue, updatedAt: new Date() });
            if (newValue) {
              assigneeSpan.textContent = `@${newValue}`;
            } else {
              assigneeSpan.textContent = "";
            }
          } catch (error) {
            console.error("担当者更新失敗:", error);
          }
          metaDiv.replaceChild(assigneeSpan, input);
        };

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") saveEdit();
        });
        input.addEventListener("blur", saveEdit);
      });
    }

    // dueDate編集
    const dueDateSpan = metaDiv.querySelector(".todo-due");
    if (dueDateSpan) {
      dueDateSpan.style.cursor = "pointer";
      dueDateSpan.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "date";
        input.value = data.dueDate || "";
        input.classList.add("todo-edit-input");
        metaDiv.replaceChild(input, dueDateSpan);
        input.focus();

        const saveEdit = async () => {
          const newValue = input.value || null;
          try {
            await updateDoc(ref, { dueDate: newValue, updatedAt: new Date() });
            if (newValue) {
              dueDateSpan.textContent = `期限: ${newValue}`;
            } else {
              dueDateSpan.textContent = "";
            }
          } catch (error) {
            console.error("期限更新失敗:", error);
          }
          metaDiv.replaceChild(dueDateSpan, input);
        };

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") saveEdit();
        });
        input.addEventListener("blur", saveEdit);
      });
    }

    contentDiv.appendChild(taskNameDiv);
    contentDiv.appendChild(metaDiv);

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.title = "削除";
    deleteBtn.classList.add("todo-delete-btn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm(`タスク「${data.taskName}」を削除してもよろしいですか？`)) {
        try {
          await deleteDoc(ref);
        } catch (error) {
          console.error("Todo削除失敗:", error);
          alert("削除に失敗しました。");
        }
      }
    });

    li.appendChild(checkbox);
    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
  });
}
