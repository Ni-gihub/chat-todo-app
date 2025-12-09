// Firebase 共通設定
import { db, auth } from "../common/firebase-config.js";

// Firestore モジュール
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ルーム・チャンネル関連モジュール
import { getCurrentRoomId } from "../rooms/roomSelect.js";
import { getCurrentChannelId } from "../channels/channelSelect.js";

// メッセージを表示するリストのDOM
const messageList = document.getElementById("message-list");

// リアルタイム監視の解除関数を入れておく変数
let unsubscribeMessages = null;

// ユーザーID→名前キャッシュ（Firestoreへのアクセス回数を減らすため）
const userNameCache = {};

// メッセージリスナーの開始関数をエクスポート
export function startMessageListener() {
  // 今選択されているルームとチャンネルのIDを取得
  const roomId = getCurrentRoomId();
  const channelId = getCurrentChannelId();

  // IDがなければ警告を出して終了
  if (!roomId || !channelId) {
    console.warn("ルームIDまたはチャンネルIDがありません");
    return;
  }

  // すでに監視しているなら一旦解除（多重監視防止）
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  // メッセージコレクションを作成日時順に並べるクエリ
  const q = query(
    collection(db, "rooms", roomId, "channels", channelId, "messages"),
    orderBy("createdAt", "asc")
  );

  // FirestoreのonSnapshotでリアルタイム監視を開始
  unsubscribeMessages = onSnapshot(q, async (snapshot) => {
    // 画面のメッセージ一覧をリセット
    messageList.innerHTML = "";

    // 全メッセージに対して処理
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // li要素を作成しクラス付与
      const li = document.createElement("li");
      li.classList.add("message");

      // 自分のメッセージか他人かでクラス追加
      if (data.createdBy === auth.currentUser?.uid) {
        li.classList.add("my-message");
      } else {
        li.classList.add("other-user");
      }

      // メッセージ投稿時間の整形
      let time = "";
      if (data.createdAt?.toDate) {
        const dateObj = data.createdAt.toDate();
        time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      // 投稿者の名前取得（Firestore usersコレクションから）
      let userName = "匿名";

      // もしキャッシュにあればそこから取得
      if (userNameCache[data.createdBy]) {
        userName = userNameCache[data.createdBy];
      } else {
        // Firestoreのusersコレクションから取得
        try {
          const userDocRef = doc(db, "users", data.createdBy);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            userName = userDocSnap.data().name || "匿名";
          }
          // キャッシュに保存
          userNameCache[data.createdBy] = userName;
        } catch (error) {
          console.error("ユーザー名取得エラー:", error);
        }
      }

      // 名前と時間をまとめたdivを作成
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("message-info");
      infoDiv.textContent = `${userName}・${time}`;

      // メッセージ本文のdivを作成
      const bubbleDiv = document.createElement("div");
      bubbleDiv.classList.add("message-bubble");
      bubbleDiv.textContent = data.text;

      // liに要素を組み立てていく
      li.appendChild(infoDiv);
      li.appendChild(bubbleDiv);

      // メッセージリストに追加
      messageList.appendChild(li);
    }

    // 最新メッセージが見えるようスクロール
    messageList.scrollTop = messageList.scrollHeight;
  });
}
