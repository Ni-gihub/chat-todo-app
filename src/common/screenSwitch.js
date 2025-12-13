console.log("screenSwitch.js 読み込み成功");

export const screens = {
  login: document.getElementById("login-screen"),
  chat: document.getElementById("chat-screen"),
};

export function switchScreen(newScreen) {
  console.log("画面切り替え:", newScreen.id);

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  newScreen.classList.add("active");

  console.log("login:", screens.login.className);
  console.log("chat:", screens.chat.className);
}
