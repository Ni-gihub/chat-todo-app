// commandParser.js
console.log("commandParser.js 読み込み成功");

/**
 * @param {string} text ユーザー入力メッセージ全文
 * @returns {object|null} 解析成功時にオブジェクト、失敗やコマンドでなければ null
 */
export function parseTodoCommand(text) {
  // 前後の空白を削除
  const trimmed = text.trim();

  // まず /todo delete タスク名 のパターンをチェック
  const deletePattern = /^\/todo\s+delete\s+(.+)$/i;
  const deleteMatch = trimmed.match(deletePattern);
  if (deleteMatch) {
    return {
      action: "delete",
      taskName: deleteMatch[1].trim(),
      assignee: null,
      dueDate: null,
    };
  }
  const addPattern = /^\/todo\s+([^\s@\/]+)(?:\s+@(\S+))?(?:\s+\/(\S+))?$/i;
  const addMatch = trimmed.match(addPattern);
  if (addMatch) {
    return {
      action: "add",
      taskName: addMatch[1].trim(),
      assignee: addMatch[2] ? addMatch[2].trim() : null,
      dueDate: addMatch[3] ? addMatch[3].trim() : null,
    };
  }


  // 完了コマンド
  let matchDone = text.match(/^\/todo\s+done\s+(.+)$/);
  if (matchDone) {
    return {
      action: "done",
      taskName: matchDone[1].trim(),
    };
  }

  // 未完了コマンド
  let matchUndone = text.match(/^\/todo\s+undone\s+(.+)$/);
  if (matchUndone) {
    return {
      action: "undone",
      taskName: matchUndone[1].trim(),
    };
  }


  return null;
}

