# 서산중앙성결교회 다음세대 홈페이지

청소년부·청년부 홈페이지입니다. 별도 서버 없이 GitHub Pages로 무료 공개합니다.

## 파일 구성

| 파일 | 내용 |
|---|---|
| `index.html` | 첫 화면 (청소년부 / 청년부 선택) |
| `youth.html` | 청소년부 메인 |
| `youth-about.html` | 청소년부·교회 소개, 섬기는 사람들 |
| `young-adult.html` | 청년부 메인 |
| `sermons/YYYY-MM-DD.html` | 설교 노트 (날짜별 파일 하나) |
| `images/` | 사진 (목사님 사진 `pastor.jpg`, 앨범 사진) |
| `assets/site.js` | 메뉴·펼치기 기능 (평소엔 고칠 필요 없음) |

## 처음 한 번: GitHub Pages로 공개하기

1. github.com에 로그인 → 오른쪽 위 **+** → **New repository**
2. 이름 입력 (예: `seosan-nextgen`) → **Public** 선택 → **Create repository**
3. 새 저장소 화면에서 **uploading an existing file** 클릭
4. 압축을 푼 폴더 안의 **파일과 폴더를 모두** 끌어다 놓기 (폴더째가 아니라 안의 내용물을) → **Commit changes**
5. 저장소의 **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main** / **/(root)** → **Save**
6. 1–2분 뒤 같은 화면 위쪽에 주소가 나타납니다: `https://아이디.github.io/저장소이름/`

## 매주 할 일: 설교 노트 올리기

1. 새 설교 노트 HTML을 `sermons/2026-10-18.html`처럼 날짜 이름으로 저장해 `sermons` 폴더에 올립니다.
2. `youth.html`(또는 `young-adult.html`)을 열고 맨 아래 `PAGE_DATA`의 `sermons:` 목록 **맨 위**에 한 항목을 추가합니다.

```js
{
  "date": "2026.10.18",
  "title": "설교 제목",
  "passage": "본문 (예: 요한복음 3:16)",
  "preacher": "김진웅 목사",
  "service": "주일 청소년 예배",
  "headline": "카드에 크게 보일 한 문장\n두 번째 줄",
  "summary": "핵심 구절 · ○○ | 대지 3개 · 적용 · 기도",
  "href": "sermons/2026-10-18.html"
},
```

맨 위 항목이 자동으로 **'이번 주 말씀' 카드**가 되고, 전체 목록에도 들어갑니다.

**줄 맞춤:** 설교 제목과 카드 문장(`headline`)은 줄이 중간에 꺾이지 않고, 화면이 좁으면 글자 크기가 자동으로 줄어듭니다. `headline`은 `\n`으로 직접 줄을 나누되, 한 줄을 10~12자 정도로 비슷하게 끊으면 휴대폰에서도 글자가 크게 보입니다. 쉼표(`,`)와 따옴표(`"`)를 빠뜨리지 않도록 주의하세요.

GitHub에서 파일을 고치려면: 파일 클릭 → 연필 아이콘(✏️) → 수정 → **Commit changes**.

## 공지·사진·영상 채우기

모두 각 페이지 맨 아래 `PAGE_DATA` 안에서 고칩니다. 카드의 개수 표시는 자동으로 바뀝니다.

- **공지사항** `notices`: `{ "tag": "일정", "tagColor": "#FFB86B", "title": "제목", "detail": "장소 · 시간", "date": "11.15" }`
  - 태그 색: 예배 `#D4F36B` · 모임 `#7FD4FF` · 일정 `#FFB86B` · 준비물 `#7FD4FF` · 안내 `#C9C6BE`
- **우리들의 이야기** `albums`: 앨범 하나에 사진 여러 장. 첫 사진이 표지가 됩니다.
  1. `images/albums/` 안에 앨범 폴더를 만들고(예: `2026-fall-retreat`) 사진을 `01.jpg`, `02.jpg`… 로 올립니다. 같은 사진의 작은 버전을 `01-thumb.jpg`처럼 함께 올립니다. (Claude에게 사진을 보내면 크기 줄이기·위치 정보 지우기·작은 버전 만들기를 대신 해 줍니다.)
  2. 페이지 맨 아래 `albums:` 목록 맨 위에 추가합니다.
     `{ "title": "가을 수련회", "date": "2026.11.01", "folder": "images/albums/2026-fall-retreat", "photos": ["01.jpg", "02.jpg"] },`
- **우리들의 추억영상** `videos`: `{ "title": "수련회 하이라이트", "url": "https://youtu.be/..." }`

## 공개 전 확인

- 학생 얼굴 사진은 **보호자 동의를 받은 뒤에만** 올립니다.
- 목사님 휴대폰 번호는 싣지 않습니다. 전화 문의는 교회 대표번호 041-665-1982.
