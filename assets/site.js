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
  // 공지 이미지: image가 없는 공지는 이미지 자리를 지움
  document.querySelectorAll('[data-notice-image]').forEach(function (a) {
    if (!a.getAttribute('data-notice-image')) a.remove();
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

  // 1-2) 우리들의 이야기: 사진 앨범 (PAGE_DATA.albums)
  var albumHost = document.querySelector('#panel-story > div');
  var albums = D.albums || [];
  function thumbOf(a, f) { return a.folder + '/' + f.replace(/\.jpg$/i, '-thumb.jpg'); }
  function fullOf(a, f) { return a.folder + '/' + f; }
  if (albumHost) {
    if (!albums.length) {
      albumHost.innerHTML = '<div style="aspect-ratio:4/3;border-radius:16px;background:var(--card);border:1.5px dashed var(--line);display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;color:var(--muted);font-size:15px">첫 사진 앨범을 준비하고 있어요</div>';
    } else {
      albumHost.innerHTML = albums.map(function (a, i) {
        var cover = a.photos && a.photos.length ? thumbOf(a, a.photos[0]) : '';
        return '<button type="button" data-album="' + i + '" style="all:unset;cursor:pointer;display:block;border-radius:16px;overflow:hidden;background:var(--card);border:1.5px solid var(--line)">' +
          '<span style="display:block;aspect-ratio:4/3;background:var(--card) url(\'' + esc(cover) + '\') center/cover no-repeat"></span>' +
          '<span style="display:block;padding:14px 16px 16px">' +
          '<span style="display:block;font-family:\'Black Han Sans\',sans-serif;font-size:20px;color:#FFFFFF">' + esc(a.title) + '</span>' +
          '<span style="display:block;margin-top:4px;font-size:14px;color:var(--muted)">' + (a.date ? esc(a.date) + ' · ' : '') + '사진 ' + a.photos.length + '장</span>' +
          '</span></button>';
      }).join('');
      var view = document.createElement('div');
      view.hidden = true;
      view.style.cssText = 'margin-top:16px;background:var(--card);border-radius:22px;padding:18px clamp(14px,3vw,24px) 22px';
      albumHost.parentNode.appendChild(view);
      var current = null;
      function openAlbum(i) {
        if (current === i) { view.hidden = true; current = null; return; }
        current = i;
        var a = albums[i];
        view.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px">' +
          '<span><span style="display:block;font-family:\'Black Han Sans\',sans-serif;font-size:22px;color:#FFFFFF">' + esc(a.title) + '</span>' +
          '<span style="font-size:14px;color:var(--muted)">' + (a.date ? esc(a.date) + ' · ' : '') + '사진 ' + a.photos.length + '장 · 누르면 크게 보여요</span></span>' +
          '<button type="button" data-album-close style="flex:none;min-height:44px;padding:0 18px;border-radius:999px;border:1.5px solid var(--line);background:transparent;color:#FFFFFF;font:inherit;font-size:14px;cursor:pointer">닫기</button></div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(140px,30%),1fr));gap:8px">' +
          a.photos.map(function (f, k) {
            return '<button type="button" data-photo="' + k + '" aria-label="사진 ' + (k + 1) + ' 크게 보기" style="all:unset;cursor:pointer;display:block;aspect-ratio:1;border-radius:10px;background:#000 url(\'' + esc(thumbOf(a, f)) + '\') center/cover no-repeat"></button>';
          }).join('') + '</div>';
        view.hidden = false;
      }
      albumHost.addEventListener('click', function (e) {
        var b = e.target.closest('[data-album]');
        if (b) openAlbum(+b.dataset.album);
      });
      view.addEventListener('click', function (e) {
        if (e.target.closest('[data-album-close]')) { view.hidden = true; current = null; return; }
        var p = e.target.closest('[data-photo]');
        if (p) showPhoto(albums[current], +p.dataset.photo);
      });

      // 크게 보기
      var lb = document.createElement('div');
      lb.hidden = true;
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-label', '사진 크게 보기');
      lb.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.94);display:flex;align-items:center;justify-content:center';
      lb.innerHTML = '<img alt="" style="max-width:100%;max-height:100%;object-fit:contain;user-select:none">' +
        '<button type="button" data-lb="prev" aria-label="이전 사진" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:24px;cursor:pointer">‹</button>' +
        '<button type="button" data-lb="next" aria-label="다음 사진" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:24px;cursor:pointer">›</button>' +
        '<button type="button" data-lb="close" aria-label="닫기" style="position:absolute;right:12px;top:12px;width:48px;height:48px;border-radius:999px;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:22px;cursor:pointer">✕</button>' +
        '<span data-lb-count style="position:absolute;left:0;right:0;bottom:16px;text-align:center;color:#fff;font-size:14px;font-family:\'IBM Plex Sans KR\',sans-serif"></span>';
      document.body.appendChild(lb);
      var lbImg = lb.querySelector('img'), lbCount = lb.querySelector('[data-lb-count]');
      var lbAlbum = null, lbIndex = 0;
      function showPhoto(a, k) {
        lbAlbum = a; lbIndex = (k + a.photos.length) % a.photos.length;
        lbImg.src = fullOf(a, a.photos[lbIndex]);
        lbImg.alt = a.title + ' 사진 ' + (lbIndex + 1);
        lbCount.textContent = (lbIndex + 1) + ' / ' + a.photos.length;
        lb.hidden = false;
        document.documentElement.style.overflow = 'hidden';
      }
      function closeLb() { lb.hidden = true; lbImg.src = ''; document.documentElement.style.overflow = ''; }
      lb.addEventListener('click', function (e) {
        var b = e.target.closest('[data-lb]');
        if (b && b.dataset.lb === 'prev') showPhoto(lbAlbum, lbIndex - 1);
        else if (b && b.dataset.lb === 'next') showPhoto(lbAlbum, lbIndex + 1);
        else if ((b && b.dataset.lb === 'close') || e.target === lb) closeLb();
      });
      document.addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') showPhoto(lbAlbum, lbIndex - 1);
        if (e.key === 'ArrowRight') showPhoto(lbAlbum, lbIndex + 1);
      });
      var sx = null;
      lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (sx == null) return;
        var dx = e.changedTouches[0].clientX - sx; sx = null;
        if (Math.abs(dx) > 50) showPhoto(lbAlbum, lbIndex + (dx < 0 ? 1 : -1));
      });
    }
  }

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
