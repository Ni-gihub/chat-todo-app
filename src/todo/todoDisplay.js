// 
console.log("commandParser.js 読み込み成功");

//Firebase 共通設定
import { db } from "../common/firebase-config.js";
//Firestore モジュール
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
//現在選択しているルームを取得
import { getCurrentRoomId } from "../rooms/roomSelect.js";
//現在選択しているチャンネルを取得
import { getCurrentChannelId } from "../channels/channelSelect.js";

//Todoリスト
const todoList = document.getElementById("todo-list");

// フィルター
const filterSelect = document.getElementById("todo-filter");
//ソート
const sortSelect = document.getElementById("todo-sort");
//検索機能
const searchInput = document.getElementById("todo-search");

//リアルタイム監視を開始したときに、後で解除するための変数
let unsubscribeTodos = null;
//Firestore から取得したタスクを 一時的にブラウザ側に保持 する配列です。
let currentTodos = []; 



//特定ルーム・チャンネルのTodoをリアルタイムで取得して表示
export function startTodoListener() {

  //ルームIDとチャンネルIDを取得
  const roomId = getCurrentRoomId();
  const channelId = getCurrentChannelId();

  //ルームIDかチャンネルIDが無い場合は終了
  if (!roomId || !channelId) {
    console.warn("ルームIDまたはチャンネルIDがありません");
    return;
  }

  // すでに監視しているなら一旦解除（多重監視・重複描画防止）
  if (unsubscribeTodos) {
    unsubscribeTodos();
  }

  //Todo一覧のパスを作成
  const todosCol = collection(db, "rooms", roomId, "channels", channelId, "todos");
  //Todo一覧をすべて取得
  const q = query(todosCol);

  //リアルタイムの監視を開始（データが変わるたびに呼ばれる）
  unsubscribeTodos = onSnapshot(q, (snapshot) => {
    //上書きするため、古いデータを消してから新しいデータを入れる。
    currentTodos = [];

    //Todoリストの数だけループする
    snapshot.forEach(docSnap => {
      //取得した各ドキュメントを配列に追加
      currentTodos.push({
        //ドキュメントID
        id: docSnap.id,
        //ドキュメントの参照(更新・削除で使用)
        ref: docSnap.ref,
        //Todoデータ
        data: docSnap.data()
      });
    });

    //Todoリストを表示
    renderTodos();
  });

  // フィルター・ソートの選択変更イベントをセット
  //フィルター
  filterSelect.addEventListener("change", renderTodos);
  //並び替え
  sortSelect.addEventListener("change", renderTodos);
  //検索用のテキスト入力
  searchInput.addEventListener("input", renderTodos);
}



// フィルター・ソートして描画する関数
function renderTodos() {

  //画面を消す（再描写のため）
  todoList.innerHTML = "";

  //セレクトボックスで選ばれている値
  const filterValue = filterSelect.value;
  //並び替えの条件
  const sortValue = sortSelect.value;
  //入力された文字の前後の空白をなくして、小文字にする
  const searchValue = searchInput.value.trim().toLowerCase();

  // フィルター
  //Todoリストの配列から条件に合うものだけ取り出す（dataだけ使用する）
  let filtered = currentTodos.filter(({ data }) => {
    //フィルターが「完了」を選択している時（完了済みのTodoだけ通す）
    if (filterValue === "completed") return data.completed === true;
    //フィルターが「未完了」を選択している時（完了していないTodoだけ通す）
    if (filterValue === "incomplete") return !data.completed;
    //それ以外を選択している時（すべて通す）
    return true;
  });



  // 検索（タスク名か担当に検索語が含まれるか）
  //検索文字があるときだけ検索処理をする（空白文字はfalse扱い）
  if (searchValue) {
    //filter 済みの配列に対して、さらに検索で絞り込む
    filtered = filtered.filter(({ data }) => {
      //入力されたタスク名があったら小文字に変換なかったら空文字
      const taskName = data.taskName ? data.taskName.toLowerCase() : "";
      //入力された担当者名があったら小文字に変換なかったら空文字
      const assignee = data.assignee ? data.assignee.toLowerCase() : "";
      //タスク名か担当者名があったら検索する
      return taskName.includes(searchValue) || assignee.includes(searchValue);
    });
  }

  // ソート
  filtered.sort((a, b) => {

    //
    const aData = a.data;
    const bData = b.data;

    //sortValueに入っている文字列が正しいか（期限でソート（昇順）の文字か）
    if (sortValue === "dueDateAsc") {
      //期限でソート（昇順）dueDateが無い時は空文字
      return (aData.dueDate || "") > (bData.dueDate || "") ? 1 : -1;
    //sortValueに入っている文字列が正しいか（期限でソート（降順）の文字か）
    } else if (sortValue === "dueDateDesc") {
      //期限でソート（降順）
      return (aData.dueDate || "") < (bData.dueDate || "") ? 1 : -1;
    //sortValueに入っている文字列が正しいか（タスク名でソート（昇順）の文字か）
    } else if (sortValue === "taskNameAsc") {
      //タスク名でソート（昇順）
      return aData.taskName.localeCompare(bData.taskName);
    //sortValueに入っている文字列が正しいか（タスク名でソート（降順）の文字か）
    } else if (sortValue === "taskNameDesc") {
      //タスク名でソート（降順）
      return bData.taskName.localeCompare(aData.taskName);
    }
    //どの条件も当てはまらない
    return 0;
  });


  //検索して何もヒットしなかった時の処理
  if (filtered.length === 0) {
    todoList.textContent = "該当するタスクはありません";
    return;
  }


  //フィルター・検索・ソート後の配列のTodoリスト事にループする
  filtered.forEach(({ ref, data }) => {

    //liを作成
    const li = document.createElement("li");
    //CSS用のクラス付与
    li.classList.add("todo-item");
    //後でボタン等を絶対配置するための準備
    li.style.position = "relative";

    // チェックボックス
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    //完了状態を反映
    checkbox.checked = !!data.completed;
    //CSS用のクラス付与
    checkbox.classList.add("todo-checkbox");

    //チェックがON/OFFされた瞬間に実行
    checkbox.addEventListener("change", async () => {
      try {
        //一部更新
        await updateDoc(ref, {
          //完了未完了
          completed: checkbox.checked,
          //更新日時
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Todo完了状態の更新失敗:", error);
        //チェック状態を元に戻す
        checkbox.checked = !checkbox.checked;
      }
    });



    // タスク内容部分
    //タスク名や担当などを入れる親要素
    const contentDiv = document.createElement("div");
    //レイアウト用のコンテナ
    contentDiv.classList.add("todo-content");

    //タスク名表示用
    const taskNameDiv = document.createElement("div");
    taskNameDiv.classList.add("todo-task");
    taskNameDiv.textContent = data.taskName;


    // タスク名をクリックで
    taskNameDiv.addEventListener("click", () => {

      //input を作る（編集用）
      const input = document.createElement("input");
      //テキストタイプ
      input.type = "text";
      input.value = taskNameDiv.textContent;
      input.classList.add("todo-edit-input");



      //taskNameDivを消してinput（表示から編集）
      contentDiv.replaceChild(input, taskNameDiv);
      //文字が打てるようにフォーカス
      input.focus();

      //保存処理を関数
      const saveEdit = async () => {
        //前後の空白を消して入力された文字を入れる
        const newValue = input.value.trim();
        //空文字じゃないと元の値と違う
        if (newValue && newValue !== data.taskName) {
          try {
            //FirestoreのこのTodoだけ更新
            await updateDoc(ref, { taskName: newValue, updatedAt: new Date() });
            //表示用divの中身も更新
            taskNameDiv.textContent = newValue;
          } catch (error) {
            console.error("タスク名更新失敗:", error);
          }
        }
        //inputを消してtaskNameDiv（編集から表示）
        contentDiv.replaceChild(taskNameDiv, input);
      };

      //保存する動作
      input.addEventListener("keydown", (e) => {
        //Enterキーを押したとき
        if (e.key === "Enter") saveEdit();
      });
      //フォーカスが外れた時
      input.addEventListener("blur", saveEdit);
    });



    // 担当者・期限などの 補足情報エリア
    const metaDiv = document.createElement("div");
    //CSS用クラスを設定
    metaDiv.classList.add("todo-meta");

    //値があるときだけ span を出す
    metaDiv.innerHTML = `
      ${data.assignee ? `<span class="todo-assignee">@${data.assignee}</span>` : ""}
      ${data.dueDate ? `<span class="todo-due">期限: ${data.dueDate}</span>` : ""}
    `;

    //担当者の値があれば取得
    const assigneeSpan = metaDiv.querySelector(".todo-assignee");


    //担当者が表示されている時だけ編集できる
    if (assigneeSpan) {

      //カーソルが出る
      assigneeSpan.style.cursor = "pointer";

      //担当者をクリックしたら
      assigneeSpan.addEventListener("click", () => {
        //input要素を入れる
        const input = document.createElement("input");
        //テキストタイプ
        input.type = "text";
        //今の担当者名を初期値になければ空文字
        input.value = data.assignee || "";
        //クラスを追加
        input.classList.add("todo-edit-input");
        //表示 → 編集 に差し替え
        metaDiv.replaceChild(input, assigneeSpan);
        //フォーカスする
        input.focus();



        //保存処理
        const saveEdit = async () => {
          //前後の空白をなくす（空文字だとnull）
          const newValue = input.value.trim() || null;
          try {
            //Firestore 更新
            await updateDoc(ref, { assignee: newValue, updatedAt: new Date() });

            //担当者名があるかどうか
            if (newValue) {
              //担当者名がある場合@名前
              assigneeSpan.textContent = `@${newValue}`;
            } else {
              //担当者が無い場合空白
              assigneeSpan.textContent = "";
            }
          } catch (error) {
            console.error("担当者更新失敗:", error);
          }

          //表示モードに戻す
          metaDiv.replaceChild(assigneeSpan, input);
        };

        //キーが押された時に保存
        input.addEventListener("keydown", (e) => {
          //Enterをクリックした時
          if (e.key === "Enter") saveEdit();
        });

        //フォーカスが外れた時
        input.addEventListener("blur", saveEdit);
      });
    }


    
    // 期限日（担当者編集のほぼ完全コピー）
    //期限表示の span を取得(存在しない場合はnull)
    const dueDateSpan = metaDiv.querySelector(".todo-due");

    //期限が表示されているタスクだけ編集できる。
    if (dueDateSpan) {
      //カーソルが変わる
      dueDateSpan.style.cursor = "pointer";

      //クリックで編集できる
      dueDateSpan.addEventListener("click", () => {

        //ブラウザ標準のカレンダーが出る
        const input = document.createElement("input");
        //データタイプ
        input.type = "date";
        ////今の期限日を初期値になければ空文字
        input.value = data.dueDate || "";
        //クラスを付与
        input.classList.add("todo-edit-input");
        //表示用から編集用に変更
        metaDiv.replaceChild(input, dueDateSpan);
        //フォーカスする
        input.focus();

        //保存処理
        const saveEdit = async () => {
          //未入力の場合はnull
          const newValue = input.value || null;
          try {
            //Firestore更新
            await updateDoc(ref, { dueDate: newValue, updatedAt: new Date() });
            //期限日がある場合
            if (newValue) {
              ////期限日がある場合@名前
              dueDateSpan.textContent = `期限: ${newValue}`;
            } else {
              //期限日が無い場合空白
              dueDateSpan.textContent = "";
            }
          } catch (error) {
            console.error("期限更新失敗:", error);
          }

          //編集から表示に変更
          metaDiv.replaceChild(dueDateSpan, input);
        };

        //キークリックで保存
        input.addEventListener("keydown", (e) => {
          //エンタークリック
          if (e.key === "Enter") saveEdit();
        });

        //フォーカスが外れる時
        input.addEventListener("blur", saveEdit);
      });
    }

    //contentDiv の中身を完成させる
    contentDiv.appendChild(taskNameDiv);
    contentDiv.appendChild(metaDiv);

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    //テキスト
    deleteBtn.textContent = "×";
    //カーソルがあった時に表示
    deleteBtn.title = "削除";
    //クラス付与
    deleteBtn.classList.add("todo-delete-btn");


    //削除ボタンをクリックした時
    deleteBtn.addEventListener("click", async () => {
      //タスクの削除の確認
      if (confirm(`タスク「${data.taskName}」を削除してもよろしいですか？`)) {
        try {
          //Firestoreから削除
          await deleteDoc(ref);
        } catch (error) {
          console.error("Todo削除失敗:", error);
          alert("削除に失敗しました。");
        }
      }
    });

    //liに追加する
    //チェックボックスを追加
    li.appendChild(checkbox);
    //担当者と期限日の編集要素
    li.appendChild(contentDiv);
    //削除ボタン
    li.appendChild(deleteBtn);

    //liをtodoリストに追加
    todoList.appendChild(li);
  });
}
