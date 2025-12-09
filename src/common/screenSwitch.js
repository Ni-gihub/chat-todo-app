console.log("screenSwitch.js 読み込み成功");
//screenSwitch.js

// Todo関連モジュール
import { startTodoListener } from "../todo/todoDisplay.js";

//画面の要素一覧
export const screens = {
  login: document.getElementById('login-screen'),
  chat: document.getElementById('chat-screen'),
};

//現在表示している画面
let currentScreen = screens.login;

//画面切り替えの関数
export function switchScreen(newScreen) {
  
  startTodoListener();
  
  //activeの付け替えが正しいかの確認
  console.log("画面を切り替え前:", currentScreen?.id);
  console.log("画面を切り替え後:", newScreen?.id);

  //activeの付け替え
  currentScreen.classList.remove('active');
  newScreen.classList.add('active');
  currentScreen = newScreen;

  //activeの付け替えが出来ているかの確認用
  console.log("login-screen クラス:", screens.login?.className);
  console.log("chat-screen クラス:", screens.chat?.className);

}
