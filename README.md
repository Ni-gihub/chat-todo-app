[chat ＆ Todo Webページ](https://ni-gihub.github.io/chat-todo-app/)
## 使用技術
- **フロントエンド**: HTML, CSS, JavaScript
- **リアルタイム通信 / データベース**：Firebase Firestore, Firebase Authentication
- **ホスティング / デプロイ**：GitHub Pages



## プロジェクト概要
- **プロジェクト名**：Chat & Todoアプリ
- **概要**：チャットとタスク管理を組み合わせた、学生や小規模チーム向けのリアルタイム協働アプリ
- **詳細資料**：[Notion プロジェクトページ](https://airy-rudbeckia-9cf.notion.site/chat-Todo-2d08ca5ddca2803797cbd425de7589f2)



## 開発環境の立ち上げ
1. VS Codeでプロジェクトフォルダを開く
2. 「Go Live」をクリックしてローカルサーバーを起動



## ディレクトリ構成
.  
├─ index.html  
├─ README.md  
├─ assets  
│   └─ google-color.svg  
├─ src  
│   ├─ auth  
│   │   ├─ authWatcher.js  
│   │   └─ login.js  
│   ├─ channels  
│   │   ├─ channelCreate.js  
│   │   ├─ channelSelect.js  
│   │   └─ loadChannels.js  
│   ├─ common  
│   │   ├─ firebase-config.js  
│   │   ├─ inviteModal.js  
│   │   ├─ screenSwitch.js  
│   │   └─ sideBar.js  
│   ├─ messages  
│   │   ├─ messageDisplay.js  
│   │   └─ sendMessage.js  
│   ├─ rooms  
│   │   ├─ loadRooms.js  
│   │   ├─ membersAdd.js  
│   │   ├─ roomAddMember.js  
│   │   ├─ roomCreate.js  
│   │   └─ roomSelect.js  
│   ├─ todo  
│   │   ├─ commandParser.js  
│   │   ├─ todoDisplay.js  
│   │   └─ todoService.js  
│   └─ user  
│       ├─ membersDisplay.js  
│       └─ userStore.js  
└─ style  
    └─ common.css  



## 機能一覧
- ユーザー登録・ログイン
  - 新規登録（メール/パスワード、Googleアカウント）
  - ログイン（メール/パスワード、Googleアカウント）
- タスク管理
  - タスクの追加、編集、削除
  - 担当者指定
  - 期限設定
  - /todo コマンドによるタスク管理
- チャット機能
  - チャット画面でタスクやメッセージを表示
  - リアルタイム更新（他ユーザーにも即時反映）
- ルーム・チャンネル管理 **（※ルール・チャンネルの削除機能がついていません）**
  - ルーム内で複数チャンネルを作成可能
  - チャンネル単位でタスク管理
- テスト用
  - ログアウト



## アプリ内コマンドの使い方
- **タスクの追加・更新**  
`/todo タスク名 @担当 /期限`
  - タスク名（必須）
  - @担当（任意）: タスク担当者を指定（複数は不可）
  - /期限（任意）: 期限を設定（例: 2025-02-01 , 2025-2-1）
- **タスク削除**  
`/todo delete タスク名`
  - タスク名（必須）
- **タスク完了**  
`/todo done タスク名`
   - タスク名（必須）
- **タスク未完了**  
`/todo undone タスク名`
   - タスク名（必須）



