// 右側のスライドパネルの表示操作
console.log("sideBar.js 読み込み成功");

//右端の縦バー
const sideBar = document.getElementById('side-bar');
//スライドして出てくるパネル
const slidePanel = document.getElementById('slide-panel');
//バー内のアイコン
const icons = sideBar.querySelectorAll('div');
//パネル内の各セクション
const panels = slidePanel.querySelectorAll('.panel-content');

//現在開いているパネルの ID を保持（初期値はnull）
let openedPanelId = null;

//アイコン事にクリックしたときの動作の設定
icons.forEach((icon, index) => {

  //アイコンがクリックされた時
  icon.addEventListener('click', () => {

    //配列の作成
    const panelIds = ['todo-panel', 'members-panel', 'settings-panel'];
    //現在選択しているアイコンの変数を入れる
    const targetPanelId = panelIds[index];

    //同じパネルを開いている時
    if (openedPanelId === targetPanelId) {
      // スライドを閉じる
      slidePanel.classList.remove('open');
      //パネル内コンテンツ非表示
      panels.forEach(p => p.classList.remove('active'));
      //null（開いているパネルなし）
      openedPanelId = null;

     // 違うパネルを開いている時
    } else {
      // スライドパネルを表示
      slidePanel.classList.add('open');

      //パネル事にループする
      panels.forEach(p => {
        // 選択されたパネル表示
        if (p.id === targetPanelId) p.classList.add('active');
        // 他は非表示
        else p.classList.remove('active');
      });
      //開いたパネルを更新
      openedPanelId = targetPanelId;
    }
  });
});