# 견적한장 — Firebase 인증 세팅 가이드

## 구조

```
사용자 접속
  → 구글 로그인
  → 초기 인증코드 입력 (관리자가 생성해서 전달)
  → 승인 완료 → 다음부터 바로 앱 진입
```

---

## 1단계 — Firebase 프로젝트 생성

1. [console.firebase.google.com](https://console.firebase.google.com) 접속
2. **프로젝트 추가** → 이름 입력 (예: `gyeonjeokhanjang`)
3. Google 애널리틱스는 선택사항 (꺼도 됩니다)

---

## 2단계 — Google 로그인 활성화

1. Firebase 콘솔 → **Authentication** → **Sign-in method**
2. **Google** 클릭 → 사용 설정 ON → 저장

---

## 3단계 — Firestore 데이터베이스 생성

1. Firebase 콘솔 → **Firestore Database** → **데이터베이스 만들기**
2. **프로덕션 모드**로 시작
3. 리전: `asia-northeast3 (서울)` 선택

---

## 4단계 — 보안 규칙 적용

1. Firestore → **규칙** 탭
2. `firestore.rules` 파일 내용을 전체 복사해서 붙여넣기
3. **게시** 클릭

---

## 5단계 — index.html에 Firebase 설정 넣기

1. Firebase 콘솔 → 프로젝트 설정 (톱니바퀴) → **앱 추가** → 웹(`</>`)
2. 앱 이름 입력 후 등록
3. 표시되는 `firebaseConfig` 값을 복사
4. `index.html` 안의 이 부분을 교체:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",        // ← 여기에
  authDomain:        "YOUR_PROJECT...",     // ← 실제 값
  projectId:         "YOUR_PROJECT_ID",    // ← 붙여넣기
  storageBucket:     "YOUR_PROJECT...",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

---

## 6단계 — 인증 도메인 허용 (Vercel 배포 시)

1. Firebase 콘솔 → **Authentication** → **Settings** → **승인된 도메인**
2. **도메인 추가** → 배포된 Vercel 주소 입력
   - 예: `gyeonjeokhanjang.vercel.app`

---

## 7단계 — 관리자 코드 생성 스크립트 세팅

```bash
# 스크립트 폴더에서
npm install firebase-admin
```

1. Firebase 콘솔 → 프로젝트 설정 → **서비스 계정** 탭
2. **새 비공개 키 생성** → JSON 다운로드
3. 파일명을 `serviceAccountKey.json`으로 바꿔서 이 폴더에 넣기
   ⚠️ 이 파일은 절대 GitHub에 올리지 마세요 (.gitignore에 포함됨)

---

## 8단계 — 인증코드 생성 & 배포

```bash
# 코드 1개 생성 (기본 14일 유효)
node generate-code.js

# 코드 3개, 7일 유효
node generate-code.js 3 7

# 코드 10개, 30일 유효
node generate-code.js 10 30
```

생성된 코드를 사용자에게 전달하면 됩니다.

---

## 9단계 — GitHub + Vercel 배포

```bash
git add .
git commit -m "feat: Firebase 인증 추가"
git push
```

Vercel이 자동으로 재배포합니다.

---

## 파일 구조

```
📁 gyeonjeokhanjang/
  ├── index.html           ← 앱 + 인증 레이어
  ├── generate-code.js     ← 인증코드 생성 스크립트
  ├── firestore.rules      ← Firestore 보안 규칙
  ├── serviceAccountKey.json  ← ⚠️ 로컬 전용, git 제외
  ├── vercel.json
  ├── README.md
  └── .gitignore
```

---

## 흐름 요약

| 상황 | 결과 |
|------|------|
| 신규 유저 접속 | 구글 로그인 → 코드 입력 → 승인 → 앱 진입 |
| 기존 승인 유저 접속 | 구글 로그인 → 바로 앱 진입 |
| 잘못된 코드 입력 | 오류 메시지 표시 |
| 만료된 코드 입력 | 만료 메시지 표시 |
| 이미 사용된 코드 | 오류 메시지 표시 |
