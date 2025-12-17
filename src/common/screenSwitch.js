//ログイン画面とチャット画面の切り替え
console.log("screenSwitch.js 読み込み成功");

//ログイン画面とチャット画面の DOM 要素
export const screens = {
  login: document.getElementById("login-screen"),
  chat: document.getElementById("chat-screen"),
};

export function switchScreen(newScreen) {

  console.log("画面切り替え:", newScreen.id);

  //すべての画面から active クラスを削除
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  //新しい画面にactiveクラスを追加
  newScreen.classList.add("active");

  console.log("login:", screens.login.className);
  console.log("chat:", screens.chat.className);
}
