// 
console.log("messageDisplay.js 読み込み成功");

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
//選択しているルームを取得
import { getCurrentRoomId } from "../rooms/roomSelect.js";
//選択しているチャンネルを取得
import { getCurrentChannelId } from "../channels/channelSelect.js";



// メッセージを表示するリスト
const messageList = document.getElementById("message-list");

// リアルタイム監視を開始したときに、後で解除するための変数
let unsubscribeMessages = null;

// ユーザーID→名前キャッシュ（Firestoreへのアクセス回数を減らすため）一度取得したユーザー名をメモリに保持
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

  // すでに監視しているなら一旦解除（多重監視・重複描画防止）
  //重複して表示されないため
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  // メッセージコレクションを作成日時順に並べるクエリを作成
  //rooms/ルームID/channels/チャンネルID/messages コレクションを取得
  //投稿時間の昇順にする
  const q = query(
    collection(db, "rooms", roomId, "channels", channelId, "messages"),
    orderBy("createdAt", "asc")
  );

  // FirestoreのonSnapshotでリアルタイム監視を開始
  //メッセージの追加・変更・削除があるたびに コールバックが呼ばれる
  unsubscribeMessages = onSnapshot(q, async (snapshot) => {
    // 画面のメッセージ一覧をリセット
    messageList.innerHTML = "";

    // 全メッセージに対して処理(クエリにヒットした全てのドキュメント)
    for (const docSnapshot of snapshot.docs) {

      //Firestore のドキュメントの内容を取得
      const data = docSnapshot.data();

      // メッセージ事にliを作成
      const li = document.createElement("li");
      //CSS用の"message" を付与
      li.classList.add("message");

      // 自分のメッセージか他人かを分ける為にクラスを追加
      if (data.createdBy === auth.currentUser?.uid) {
        //自分のメッセージ
        li.classList.add("my-message");
      } else {
        //他人のメッセージ
        li.classList.add("other-user");
      }

      // メッセージ投稿時間
      let time = "";
      if (data.createdAt?.toDate) {
        //TimestampをJavaScript の Date に変換
        const dateObj = data.createdAt.toDate();
        //時間をHH:MMに形式変更
        time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }


      // ユーザー名の変数作成（初期値は匿名）
      let userName = "匿名";

      // もしキャッシュにあればそこから取得
      if (userNameCache[data.createdBy]) {

        //userNameCacheに保存していたらFirestoreへの問い合わせをスキップ
        userName = userNameCache[data.createdBy];

      
      //名前がキャッシュに存在しない場合
      } else {

        // Firestoreのusersコレクションから取得
        try {

          //対象ユーザードキュメントを指定
          const userDocRef = doc(db, "users", data.createdBy);
          //指定した場所から取得
          const userDocSnap = await getDoc(userDocRef);

          //ドキュメントが存在すれば、name フィールドを取得。
          //なければ匿名
          if (userDocSnap.exists()) {
            userName = userDocSnap.data().name || "匿名";
          }
          // 今回取得した名前をキャッシュに保存。
          userNameCache[data.createdBy] = userName;


        } catch (error) {
          console.error("ユーザー名取得エラー:", error);
        }
      }

      // 投稿者名と時間をまとめて表示する <div> を作成。
      const infoDiv = document.createElement("div");
      //CSS用のmessage-infoを付与する
      infoDiv.classList.add("message-info");
      //ユーザー名と時間を文字列としてそのまま表示
      infoDiv.textContent = `${userName}・${time}`;

      // メッセージ本文のdivを作成
      const bubbleDiv = document.createElement("div");
      //CSS用のmessage-bubbleを付与
      bubbleDiv.classList.add("message-bubble");
      //メッセージ本文を文字列としてそのまま表示
      bubbleDiv.textContent = data.text;

      // liの中に投稿者情報と本文を追加。
      li.appendChild(infoDiv);
      li.appendChild(bubbleDiv);

      // 作成したliをメッセージリストに追加
      messageList.appendChild(li);
    }

    // 最新メッセージが見えるようスクロール
    messageList.scrollTop = messageList.scrollHeight;
  });
}
