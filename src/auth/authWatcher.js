console.log("authWatcher.js 読み込み成功");

import { auth } from "../common/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { switchScreen, screens } from "../common/screenSwitch.js";
import { loadUserRooms } from "../rooms/loadRooms.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("→ chat に切り替え");
    switchScreen(screens.chat);
    loadUserRooms();
  } else {
    console.log("→ login に切り替え");
    switchScreen(screens.login);
  }
});