/* 서산중앙성결교회 다음세대 홈페이지 — 공용 스크립트
   각 페이지 아래쪽의 PAGE_DATA 목록으로 화면을 채우고,
   ☰ 메뉴 · 설교 노트 목록 · 소식과 기록 폴더를 열고 닫습니다.
   평소에는 이 파일을 고칠 필요가 없습니다. */
(function () {
  var D = window.PAGE_DATA || {};
  if (D.sermons && D.sermons.length) D.thisWeek = D.sermons.slice(0, 1);

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 1) <template data-list="…"> 를 목록 데이터로 채우기
  document.querySelectorAll('template[data-list]').forEach(function (t) {
    var list = D[t.dataset.list] || [];
    var as = t.dataset.as;
    var src = t.innerHTML;
    var html = list.map(function (item) {
      return src.replace(/\{\{\s*([\w.]+)\s*\}\}/g, function (m, path) {
        var parts = path.split('.');
        if (parts[0] !== as) return m;
        var v = item;
        for (var i = 1; i < parts.length; i++) v = v == null ? '' : v[parts[i]];
        return esc(v).replace(/\n/g, '<br>');
      });
    }).join('');
    t.insertAdjacentHTML('beforebegin', html);
  });

  // 1-1) data-fit: 줄마다 한 줄로 고정하고, 화면이 좁으면 글자 크기를 줄여 맞춤
  //      (설교 제목·카드 문장은 줄바꿈하고 싶은 곳에 \n 을 넣으면 그 자리에서만 줄이 바뀜)
  var fits = Array.prototype.slice.call(document.querySelectorAll('[data-fit]'));
  fits.forEach(function (el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (line) {
      return '<span style="display:inline-block;white-space:nowrap">' + line.trim() + '</span>';
    }).join('<br>');
  });
  function fitAll() {
    fits.forEach(function (el) {
      if (el.dataset.base == null) el.dataset.base = el.style.fontSize;
      el.style.fontSize = el.dataset.base;
      var size = parseFloat(getComputedStyle(el).fontSize);
      var spans = el.querySelectorAll(':scope > span');
      function widest() {
        var w = 0;
        spans.forEach(function (sp) { w = Math.max(w, sp.getBoundingClientRect().width); });
        return w;
      }
      var room = el.clientWidth;
      while (size > 12 && widest() > room) { size -= 1; el.style.fontSize = size + 'px'; }
    });
  }
  fitAll();
  window.addEventListener('resize', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  // 2) 폴더 카드의 개수
  document.querySelectorAll('[data-count]').forEach(function (el) {
    el.textContent = (D[el.dataset.count] || []).length;
  });

  // 3) ☰ 메뉴
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!btn || !menu) return;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    btn.querySelector('.ic-menu').toggleAttribute('hidden', open);
    btn.querySelector('.ic-close').toggleAttribute('hidden', !open);
  }
  if (btn && menu) {
    btn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) setMenu(false);
      e.stopPropagation();
    });
    document.addEventListener('click', function () { if (!menu.hidden) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // 4) 전체 설교 노트 목록
  var nb = document.getElementById('notesBtn');
  var notes = document.getElementById('notes');
  if (nb && notes) {
    nb.addEventListener('click', function () {
      var open = notes.hidden;
      notes.hidden = !open;
      nb.setAttribute('aria-expanded', open ? 'true' : 'false');
      nb.textContent = open ? '설교 노트 목록 닫기 ▴' : '전체 설교 노트 보기 ▾';
    });
  }

  // 5) 소식과 기록 폴더 (한 번에 하나만 열림)
  var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  var line = getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
  var folders = Array.prototype.slice.call(document.querySelectorAll('[data-folder]'));
  function openFolder(key) {
    folders.forEach(function (f) {
      var on = f.dataset.folder === key;
      f.setAttribute('aria-expanded', on ? 'true' : 'false');
      f.style.borderColor = on ? accent : line;
      var lb = f.querySelector('[data-label]');
      if (lb) lb.textContent = on ? '닫기 ▴' : '열어 보기 ▾';
    });
    document.querySelectorAll('[data-panel]').forEach(function (p) {
      p.hidden = p.dataset.panel !== key;
    });
  }
  folders.forEach(function (f) {
    f.addEventListener('click', function () {
      openFolder(f.getAttribute('aria-expanded') === 'true' ? '' : f.dataset.folder);
    });
  });
  // 메뉴에서 공지사항·이야기·추억영상으로 이동하면 해당 폴더를 열어 줌
  var hashMap = { '#notice': 'notice', '#photos': 'story', '#videos': 'memory' };
  function fromHash() { if (hashMap[location.hash]) openFolder(hashMap[location.hash]); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
