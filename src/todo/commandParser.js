// 
console.log("commandParser.js 読み込み成功");

/**
 * @param {string} text ユーザー入力メッセージ全文
 * @returns {object|null} 解析成功時にオブジェクト、失敗やコマンドでなければ null
 */
export function parseTodoCommand(text) {
  // コマンドの前後の空白を削除
  const trimmed = text.trim();

  // /todo delete タスク名 
  const deletePattern = /^\/todo\s+delete\s+(.+)$/i;
  //マッチングし、結果をdeleteMatchに入れる
  const deleteMatch = trimmed.match(deletePattern);

  //deleteにマッチしたら
  if (deleteMatch) {
    return {
      //削除アクションに変更
      action: "delete",
      // (.+) が入る（必須）
      taskName: deleteMatch[1].trim(),
      //deleteでは不要なのでnull
      assignee: null,
      dueDate: null,
    };
  }

  //  /todo タスク名 @担当 /期限 
  const addPattern = /^\/todo\s+([^\s@\/]+)(?:\s+@(\S+))?(?:\s+\/(\S+))?$/i;
  //マッチングし、結果をaddMatchに入れる
  const addMatch = trimmed.match(addPattern);

  //addMatchにマッチしたら
  if (addMatch) {
    return {
      //追加アクションに変更
      action: "add",
      // ([^\s@\/]+) の部分が入る（必須）
      taskName: addMatch[1].trim(),
      //１つ目の (\S+) の部分が入る（任意）
      assignee: addMatch[2] ? addMatch[2].trim() : undefined,
      //２つ目の (\S+) の部分が入る（任意）
      dueDate: addMatch[3] ? addMatch[3].trim() : undefined,
    };
  }


  // /todo done タスク名
  let matchDone = text.match(/^\/todo\s+done\s+(.+)$/);

  //matchDoneにマッチしたら
  if (matchDone) {
    return {
      //完了アクションに変更
      action: "done",
      // (.+) が入る（必須）
      taskName: matchDone[1].trim(),
    };
  }

  // /todo undone タスク名
  let matchUndone = text.match(/^\/todo\s+undone\s+(.+)$/);

  //matchUndoneにマッチしたら
  if (matchUndone) {
    return {
      //未完了アクションに変更
      action: "undone",
      // (.+) が入る（必須）
      taskName: matchUndone[1].trim(),
    };
  }

  //上記のいずれにもマッチしなかった場合(通常メッセージかエラー)
  return null;
}

