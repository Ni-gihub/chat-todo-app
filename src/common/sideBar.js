// sideBar.js
console.log("sideBar.js 読み込み成功");

//
const sideBar = document.getElementById('side-bar');
//
const slidePanel = document.getElementById('slide-panel');
//
const icons = sideBar.querySelectorAll('div');
//
const panels = slidePanel.querySelectorAll('.panel-content');

//開いているパネル管理
let openedPanelId = null;

//
icons.forEach((icon, index) => {
  //
  icon.addEventListener('click', () => {
    //
    const panelIds = ['todo-panel', 'members-panel', 'settings-panel'];
    //
    const targetPanelId = panelIds[index];

    //
    if (openedPanelId === targetPanelId) {
      // 同じアイコンで閉じる
      slidePanel.classList.remove('open');
      //
      panels.forEach(p => p.classList.remove('active'));
      //
      openedPanelId = null;
    } else {
      // 違うアイコンなら開く＆切り替え
      slidePanel.classList.add('open');
      //
      panels.forEach(p => {
        //
        if (p.id === targetPanelId) p.classList.add('active');
        //
        else p.classList.remove('active');
      });
      //
      openedPanelId = targetPanelId;
    }
  });
});