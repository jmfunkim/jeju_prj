<div align="center">

# 🌋 돌빛 제주길

### 돌이 말하고, 바람이 전하는 섬 — 오늘 걸을 제주 이야기 길을 짜 드립니다

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![three.js](https://img.shields.io/badge/three.js-3D-000000?logo=threedotjs&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth·DB-3FCF8E?logo=supabase&logoColor=white)
![Claude](https://img.shields.io/badge/AI-Claude_agent-D97757)

<img src="docs/home.jpg" alt="돌빛 제주길 홈 화면" width="760" />

</div>

---

## ✨ 한눈에 보기

> **기획 의도** — 신화·돌·역사가 남은 장소를 지도에 모으고, **지금 내 위치와 쓸 수 있는 시간에 맞춰 이야기 산책 코스**를 짜 줍니다. 가서 도장을 찍고, 계정에 수첩으로 남깁니다.

| | 갈래 | 담은 것 | 지도 표지 |
|---|---|---|---|
| 🟠 | **신화·설화** | 설문대할망, 오백장군, 산방산, 삼성혈, 천제연 선녀 등 9곳 | 동그라미 |
| ⚪ | **돌문화** | 돌하르방, 밭담, 방사탑, 정낭, 불턱, 돌문화공원, 만장굴, 거문오름 8곳 | 네모 |
| 🔵 | **역사문화** | 제주목 관아, 항파두리, 4·3평화공원, 추사 유배지, 해녀박물관 등 7곳 | 마름모 |

## 🧭 사용자 관점에서 다시 만든 부분

"여행자가 실제로 다시 열어 볼까?"를 기준으로 약했던 곳을 보강했습니다.

| 부족했던 점 | 이렇게 바꿨어요 |
|---|---|
| 내용이 얇다 (20곳) | **24곳**으로 늘리고, 장소마다 **머무는 시간·현장에서 볼 것·팁·비 오는 날/아이와 가기 좋은지**를 추가 (`src/data/walk.js`) |
| 3D가 정보를 가린다 | 지도에 **2D ↔ 3D 전환**. 찾을 때는 2D(기본), 둘러볼 때는 3D |
| 재방문할 이유가 없다 | **방문 도장판** + **로그인 계정에 수첩 저장** (Supabase) |
| 위치에서 이어지는 게 없다 | **이야기 산책**: 출발지·시간·이동수단으로 코스를 짜고, 이동 시간·현장 팁·**길찾기** 링크까지 연결 |
| 공공데이터가 숨어 있다 | 장소 상세와 산책 카드에서 **주변 볼거리·맛집(TourAPI)** 을 바로 조회 |
| 과제의 AI 에이전트 | **AI 가이드**: "아이와 1시간, 비 오는 날" 같은 질문에 도구(코스·날씨·주변 관광정보)를 불러 코스를 추천 |

## 🗺️ 주요 기능

<table>
<tr>
<td width="50%"><img src="docs/walk.jpg" alt="이야기 산책 코스" /></td>
<td width="50%"><img src="docs/guide.jpg" alt="AI 가이드" /></td>
</tr>
<tr>
<td align="center"><b>이야기 산책</b><br/>시간·이동수단·갈래로 코스를 짜고, 장소마다 도장을 찍습니다.</td>
<td align="center"><b>AI 가이드</b><br/>질문을 말하면 도구를 불러 코스를 만들고 산책으로 열어 줍니다.</td>
</tr>
<tr>
<td width="50%"><img src="docs/map2d.jpg" alt="2D 문화 지도" /></td>
<td width="50%"><img src="docs/stone.jpg" alt="돌하르방 3D" /></td>
</tr>
<tr>
<td align="center"><b>2D · 3D 문화 지도</b><br/>OpenStreetMap 실제 지도 위의 2D, 오름 368개의 3D 지도.</td>
<td align="center"><b>돌하르방 3D</b><br/>현무암 질감 모델. 한낮·노을·달밤 조명, 감귤 소품.</td>
</tr>
</table>

- **이야기 산책** — 가까운 곳부터 갈래가 겹치지 않게 고르는 코스 알고리즘(`src/lib/course.js`). 비 오는 날·아이와 함께 옵션, 이동 시간은 직선거리에 우회 계수를 곱한 어림값
- **방문 도장** — 장소 500m 안에서 찍으면 **현장 도장**, 아니면 **체험 도장**
- **로그인·회원가입** — Supabase Auth. 키가 없으면 브라우저 안에서만 도는 체험 모드(비밀번호는 솔트+SHA-256 해시)
- **계정 수첩** — 담은 장소와 도장을 계정에 저장(`notebooks` 테이블, RLS). 기기를 바꿔도 이어집니다
- **AI 가이드** — `ANTHROPIC_API_KEY`가 있으면 Claude가 도구를 골라 부르고, 없으면 규칙 기반 가이드가 같은 도구를 직접 호출
- **내 위치 연동** — Geolocation으로 거리 계산·정렬 (권한이 없으면 제주시청 기준 체험 모드)
- **신화·설화 / 돌문화 도감** — 갈래별 이야기 모달, 돌하르방 3D 뷰어
- **공공데이터 6종** — 한국관광공사 TourAPI, 국가유산청, 기상청 단기예보, 그리고 **제주도청 신화 콘텐츠(182건)**, **제주돌문화공원 소장유물(77점)**, **제주역사문화위치정보**

## 🎨 디자인 컨셉 — "제주 블루 · 감귤 오렌지"

Bootstrap 5 위에 **밝고 깔끔한 여행 앱** 느낌의 테마를 덧입혔습니다.

- **상단 내비게이션** — 흰 유리 질감의 sticky 헤더. 좁은 화면에서는 햄버거 메뉴(Offcanvas)와 **하단 탭바**(홈·지도·이야기 산책·AI 가이드·내 수첩)
- **카드** — 흰 배경, 얇은 테두리와 부드러운 그림자, 둥근 모서리. 갈래별 색(신화 주황, 돌 회청, 역사 파랑)은 아이콘 타일로 표시
- **홈** — 큰 제목 + 3D 섬 카드, 숫자 요약 줄, 바로가기 3개(산책·가이드·지도), 세 갈래 카드, 내 주변 장소
- **갈래 무늬 머리띠** — 사진이 없는 장소 카드에 신화(별빛), 돌문화(현무암), 역사문화(기와선) 무늬를 얹어 카드마다 얼굴을 줍니다
- **오늘의 코스 · 세 걸음 안내** — 홈에서 바로 걸어 볼 2시간 코스와, 위치→시간→도장의 사용법을 보여 줍니다
- **도장 효과** — 도장을 찍으면 쾅 찍히는 움직임과 `n/24` 진행도가 나옵니다
- **로고** — 오름과 떠오르는 해, 파도를 그린 SVG 마크(헤더와 파비콘 공통)
- **3D 장면** — 돌하르방 뷰어는 밝은 하늘과 풀밭 배경, 페이지 전환은 가볍게 올라오는 효과(동작 줄이기 설정 시 꺼짐)
- **색** — 바다 `#0f8b9d`, 감귤 `#ff8a1f`, 잉크 `#13222d`, 배경 `#f4f8fa`
- **글꼴** — Noto Sans KR

## 🧱 폴더 구조

```
project/
├─ api/                 Vercel 서버 함수 (주소 = /api/파일이름) — 비밀 키는 여기서만
│  ├─ hello.js            동작 확인
│  ├─ tour.js             한국관광공사 (위치기반·키워드)
│  ├─ heritage.js         국가유산청
│  ├─ weather.js          기상청
│  ├─ myth.js · stonepark.js   제주도청 신화 콘텐츠 / 돌문화공원 유물
│  ├─ history.js          제주역사문화위치정보 (odcloud)
│  └─ guide.js            AI 가이드 (GET /api/guide?q=)
├─ server/              공공 API·에이전트 호출 함수 (api/ 가 import)
│  ├─ jejugo.js           제주도청 API 두 개(XML 파싱·전체 페이지 수집·1시간 캐시)
│  ├─ history.js          odcloud 호출 (serviceKey)
│  └─ guide.js            도구(plan_course·get_weather·nearby_tour·search_places) + Claude 루프 + 규칙 기반 대체
├─ supabase/schema.sql  notebooks 테이블 + RLS
├─ src/
│  ├─ router.jsx          메뉴(NAV_ITEMS) + 주소별 페이지
│  ├─ layouts/            공통 틀 (상단 내비, 모바일 탭바·Offcanvas, 계정 버튼)
│  ├─ pages/              Home · MapPage · Myth · Stone · Walk · Guide · Places · Notebook · Login
│  ├─ components/         ThreeStage · JejuMapView(3D) · RealMap(2D 실제 지도) · ui · MythArchive · RelicShelf · HistoryPlaces
│  ├─ scenes/             terrain · jejuMap · harbang · helpers  (three.js)
│  ├─ data/               places(24곳) · walk(현장 정보) · stones(돌문화 해설)
│  ├─ store/              Zustand — useAppStore(수첩·도장·지도) · useAuthStore(로그인)
│  ├─ lib/                geo(거리) · course(코스 알고리즘) · auth · cloud · sync
│  └─ api/client.js       화면 → /api 호출
└─ docs/                README 스크린샷
```

## 🚀 실행하기

```bash
npm install
cp .env.example .env.local     # 키 입력 (모두 선택)
npm run dev                    # http://localhost:5173
```

`npm run dev` 만으로도 `/api/*` 서버 함수가 동작합니다. (`vite.config.js`의 개발용 미들웨어가 `api/` 폴더를 그대로 불러 줍니다. 배포 시에는 Vercel이 같은 파일을 서버 함수로 실행합니다.)

> 키가 없어도 지도·신화·돌문화·산책·도장·로그인(체험 모드)·기본 AI 가이드는 모두 동작합니다.

### 환경변수

| 이름 | 용도 | 비고 |
|---|---|---|
| `DATA_GO_KR_KEY` | 한국관광공사 TourAPI · 기상청 단기예보 | 공공데이터포털 **Decoding 키**. 브라우저에 노출되지 않음 |
| `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` | 로그인·회원가입, 계정 수첩 | anon 키는 공개용. 비우면 체험 모드. `supabase/schema.sql` 을 먼저 실행 |
| `ANTHROPIC_API_KEY` | AI 가이드(Claude 에이전트) | 서버 전용. 비우면 규칙 기반 가이드. `ANTHROPIC_MODEL` 로 모델 변경 가능 |

국가유산청과 제주도청 두 API(신화 콘텐츠, 돌문화공원 유물)는 키가 필요 없습니다. 제주역사문화위치정보는 `DATA_GO_KR_KEY` 로 호출하며, 공공데이터포털에서 해당 데이터의 활용신청이 필요합니다. 값을 바꾼 뒤에는 개발 서버를 다시 시작하세요.

### Supabase 설정 (선택)

1. Supabase 프로젝트를 만들고 **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql)을 실행합니다.
2. **Settings → API**의 Project URL과 `anon` `public` 키를 `.env.local`에 넣습니다. (`service_role` 키는 넣지 마세요)
3. 이메일 확인을 켜 두었다면 가입 후 메일의 링크를 눌러야 로그인됩니다.

> **2D 지도**는 Leaflet + OpenStreetMap 타일(인증키 없음)입니다. 지도 오른쪽 아래에 출처를 표시하며, 많은 트래픽을 받는 서비스로 공개할 때는 [OSM 타일 사용 정책](https://operations.osmfoundation.org/policies/tiles/)에 맞게 자체 타일 서버나 상용 타일로 바꾸세요.

## 🌐 사용한 API

| API | 엔드포인트 | 화면 |
|---|---|---|
| 한국관광공사 국문 관광정보(KorService2) | `/api/tour?lat=&lng=&radius=` | 장소 상세·산책 카드의 주변 정보, 위치정보 › 내 주변 |
| 국가유산청 국가유산 검색 | `/api/heritage?keyword=` | 위치정보 › 국가유산 |
| 기상청 단기예보 | `/api/weather?place=` | 홈, AI 가이드(비 확인) |
| 제주 신화 콘텐츠 (제주도청, 키 없음) | `/api/myth?keyword=&type=` ← `jeju.go.kr/rest/JejuMythContents/getJejuMythContentsList` | 신화·설화 › 신화 아카이브(제목·구분·태그), AI 가이드 |
| 제주돌문화공원 소장유물 (제주도청, 키 없음) | `/api/stonepark?keyword=&material=&age=` ← `jeju.go.kr/api/jejustonepark/have` | 돌문화 › 소장 유물 |
| 제주역사문화위치정보 (공공데이터포털 15109570) | `/api/history?page=&perPage=` ← `api.odcloud.kr/api/15109570/v1/uddi:8781…` | 위치정보 › 역사문화 위치 (2D 지도 + 목록) |
| AI 가이드(자체) | `/api/guide?q=&lat=&lng=` | AI 가이드 |

## 🧠 구현 메모

- **지형 생성** — 외부 모델 없이 높이함수(섬 윤곽 + 한라산 가우시안 + 기복)로 메시를 만들고. 오름 368개는 고정 시드의 `InstancedMesh`입니다.
- **3D ↔ React 연결** — `ThreeStage`가 렌더 루프·리사이즈·정리(dispose)를 맡고, 장면은 React 값을 담은 `live` ref를 읽습니다.
- **코스 알고리즘** — 현재 위치에서 시간 안에 들어가는 후보 중 `이동 시간 + 같은 갈래 가산점 − 아이 동반 가산점`이 가장 낮은 곳을 반복해서 고릅니다. 화면과 서버(AI 도구)가 같은 함수를 씁니다.
- **에이전트** — 서버가 `plan_course`·`get_weather`·`nearby_tour`·`search_places` 도구를 Claude에 노출하고, `tool_use`가 끝날 때까지 최대 6번 반복합니다. 코스의 사실(시간·거리·장소)은 도구 결과에서만 가져오게 지시했습니다.
- **수첩 동기화** — 로그인하면 계정 수첩을 불러와 로컬과 합집합으로 합친 뒤 변경마다 저장합니다. 불러오기에 실패하면 저장하지 않아 빈 값으로 덮어쓰지 않습니다. 로그아웃하면 이 기기의 수첩을 비웁니다.

## ⚠️ 알아두기

- **전승은 지역과 채록자에 따라 다릅니다.** 대표적인 이야기를 요약한 것이며, 발표·배포 전 검수가 필요합니다.
- 지도의 **좌표와 머무는 시간은 대략값**입니다. 운영 시간·예약(한라산, 거문오름 등)은 방문 전에 확인하세요.
- 제주도청 두 API와 국가유산청 API는 키 없이 실제 응답을 확인했습니다(신화 182건, 유물 77점, 국가유산 검색). 제주도청 API는 조건 파라미터를 무시하거나 페이지 크기를 9로 고정하므로 서버에서 전체를 받아 걸러 냅니다.
- 제주역사문화위치정보, 한국관광공사, 기상청, Supabase, Claude 연동은 **키 없이는 실제 호출을 검증하지 못했습니다.** 키를 넣은 뒤 `/api/hello`, `/api/tour?lat=33.5&lng=126.53`, 가입·로그인, AI 가이드 질문을 차례로 확인하세요.
- 체험 모드(Supabase 없음)의 계정은 그 브라우저에만 있고 보안 수단이 아닙니다.
- AI 가이드 API는 호출 횟수 제한이 없습니다. 공개 배포 전에 제한을 두세요.

---

<div align="center">
제주대 청년도약 부트캠프 · 제주 IP 프로젝트<br/>
<sub>돌 · 바람 · 이야기</sub>
</div>
