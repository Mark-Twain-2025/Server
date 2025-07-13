# 💰 Lunch Coin 모의 투자 대회 – 친구들의 점심 메뉴에 투자하라!
매일 아침, 친구들이 점심에 어떤 음식을 가장 많이 먹을지를 예측해서 **런치 코인을 투자**하고,<br>
실제 점심을 먹은 이후 **투표한 결과에 따라 수익**을 얻는 게임형 웹 서비스<br>
➡️ "전략 + 확률 + 소셜 + 게임"을 융합한 점심 투자 게임 플랫폼
<br><br><br>

## 프로젝트 개요

### 기획 의도
매일 반복되는 점심 선택, 이제 게임처럼 즐기자!  
**Lunch Coin**은 사용자가 점심 메뉴에 **가상의 코인을 투자**하고,  
**실제 친구들의 식사 선택**에 따라 수익을 얻는 **게임형 예측 플랫폼**입니다.
<br><br>

### 개발 기간
2025.06.24 - 2025.06.30 (7일)
<br><br>

### 팀 소개

| ![김지연](http://github.com/todayiswindy.png)               | ![곽예경](https://github.com/kyun9-cloud.png)            | ![김준호](https://github.com/Mr-Tongyoung.png)               | ![이민주](https://github.com/minju00.png)                   |
|:----------------------:|:-------------------:|:------------------------:|:---------------------------:|
| **김지연**               | **곽예경**            | **김준호**               | **이민주**                   |
| [@todayiswindy](http://github.com/todayiswindy)               | [@kyun9-cloud](http://github.com/kyun9-cloud)            | [@Mr-Tongyoung](http://github.com/Mr-Tongyoung)               | [@minju00](http://github.com/minju00)                   |
| 팀장 / FE / BE / Infra    | FE / BE            | FE / BE            | FE / BE                  |
| 메인 화면, 사이드바, <br>회원가입/로그인, 배포 | 마이페이지, 랭킹 페이지 | 퀴즈 페이지, 퀴즈 결과 페이지 | 투자 기능, 투표 기능, <br>수익 정산 페이지       |

<br><br>
## 사용 기술 및 도구

### Frontend
- `JavaScript`
- `React`
- `Tailwind CSS` / `CSS-in-JS`
- `Bootstrap`

### Backend
- `Node.js`
- `MongoDB` (Mongoose ODM)
- `JWT` 기반 인증 및 사용자 세션 관리

### Infra / DevOps
- `AWS EC2` (Ubuntu + PM2 + Nginx + GitHub Actions)
- `GitHub Actions` (CI/CD 자동 배포)

### 협업 도구
- `GitHub` (버전 관리)
- `Notion` (기획 및 일정 공유)
- `Figma` (UI/UX 설계)
- `Google Docs` (문서 협업)

<br><br>

## 주요 기능 소개

| 기능 구분 | 상세 설명 |
|-----------|-----------|
| 코인 투자 | 매일 아침 오늘 친구들이 가장 많이 먹을 것 같은 메뉴(한/중/일/양식)에 투자 |
| 배당금 | 투자 분포에 따라 각 메뉴별 배당금 자동 계산 |
| 실제 메뉴 투표 | 점심 식사 후 실제 먹은 음식 분류에 투표 |
| 결과 계산 | 투자 수익/손실 계산 및 시각화 |
| 일간/주간 랭킹 | 누적 수익금을 기준으로 랭킹 제공 |
| 마이페이지 | 투자/수익 히스토리, 누적 코인, 성공률 시각화 |

<br><br>

## 실행 화면
| **메인 화면** | **nav bar** |
|:-----------:|:-----------:|
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 09 08" src="https://github.com/user-attachments/assets/56350066-e513-44a6-bc1d-42546b6d2f8e" /> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 09 13" src="https://github.com/user-attachments/assets/125627ff-3e02-462c-bf9a-2e8833a8ce58" /> |
| **회원가입** | **회원가입 축하 팝업** |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 09 40" src="https://github.com/user-attachments/assets/48b4d35b-a355-4318-8175-418962d92977" /> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 09 43" src="https://github.com/user-attachments/assets/feb0b5d2-9a9a-44ff-b43e-5e1cbcfe8205" /> |
| **로그인** | **로그인 축하 팝업** |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 09 54" src="https://github.com/user-attachments/assets/4e6d6ac7-5c39-4fb7-997e-7edb2eb63be3" /> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 09 57" src="https://github.com/user-attachments/assets/290b8f72-f950-438b-a33a-e5ad73e961a9" /> |
| **오전 투자** | **투자 결과** |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 10 11" src="https://github.com/user-attachments/assets/451f7c23-3e81-47ca-b5c9-2630374d9b36" /> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 10 15" src="https://github.com/user-attachments/assets/e06821f5-5de2-4062-8e36-50efb5006b5d" /> |
| **오후 투표** | **투표 결과** |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 10 30" src="https://github.com/user-attachments/assets/a57cc0e4-4057-4986-935f-2760409e2e19" /> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 10 37" src="https://github.com/user-attachments/assets/7cad11f3-8833-4be4-ab4a-7bc86a0d6863" /> |
| **금융 퀴즈** | **퀴즈 풀이 결과** |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 11 07" src="https://github.com/user-attachments/assets/df2e301c-9f5a-4f63-940f-db5e5e3374ce" /> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 11 10" src="https://github.com/user-attachments/assets/00c86888-c631-449e-a968-0e0ae2f53f8f" /> |
| **일간 랭킹** | **주간 랭킹** |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 10 57" src="https://github.com/user-attachments/assets/ab2c54e3-4c91-4b4a-9e81-be3b039ce78c"/> | <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 11 01" src="https://github.com/user-attachments/assets/06d0129e-f8e0-49e3-abc2-7ad55992c3f2"/>|
| **마이페이지** |  |
| <img width="1889" height="1105" alt="스크린샷 2025-07-03 오전 8 11 17" src="https://github.com/user-attachments/assets/d32c6ddd-450f-40db-bf90-1f8b14c67881"/> | |

<br><br>

## ERD
<img width="1200" height="850" alt="LunchCoin" src="https://github.com/user-attachments/assets/c9882589-2ba1-4b58-a53a-2c45f76e004e" />

<br><br>

## API 명세서
<img width="1085" height="800" alt="스크린샷 2025-07-13 오전 9 32 31" src="https://github.com/user-attachments/assets/1789f58b-2f5b-4698-8946-b9d431fb0777" />

<br><br>

## Figma
<img width="1085" height="610" alt="스크린샷 2025-07-13 오전 9 36 28" src="https://github.com/user-attachments/assets/7ea6b1b0-c6a0-46ae-a2b9-41c09290ccd8" />

<br><br>

## 아키텍처 구성
<img width="1055" height="552" alt="스크린샷 2025-07-13 오전 9 28 40" src="https://github.com/user-attachments/assets/f24b0ddc-1fe0-4d2e-bb60-c3c4bd9c46d1" />

<br><br>

## 구성도
```bash
/
├── 회원가입 및 로그인
│   ├── 이메일 기반 회원가입 / 로그인
│   ├── 약관 및 개인정보 수집 동의
│   └── 로그인 후 사용자 정보에 따라 서비스 접근 가능
│
├── 온보딩
│   ├── 사용자 이름 설정 (실명)
│   └── 기본 자산 1000 런치 코인 지급 → /home 이동
│
├── /home
│   ├── 출석 체크
│   │   ├── 첫 접속 시 출석 버튼 노출
│   │   ├── 클릭 시 10 런치 지급
│   │
│   ├── 오늘의 점심 투자
│   │   ├── 메뉴 분류: 한식 / 중식 / 양식 / 일식 / 기타
│   │   ├── 투자 금액 입력: 1~1000 런치
│   │   └── 투자 완료 시 UI 피드백 제공
│   │
│   └── 오늘의 퀴즈
│       ├── 하루 1회 응시
│       ├── 주제: 금융 랜덤 퀴즈
│       ├── 정답: +30 런치 지급
│       └── 오답 시 해설 제공 (재응시 불가)
│
├── /vote
│   ├── 점심 이후 실제 먹은 메뉴 분류 투표
│   ├── 하루 1회 투표 가능
│   └── 결과는 /result에서 집계에 사용
│
├── /result
│   ├── 오늘의 실제 1위 메뉴 분류 발표
│   ├── 전체 투표 분포 그래프 표시
│   └── 나의 투자 결과 요약
│       ├── 투자 내역 (메뉴 / 금액)
│       └── 수익 or 손실 계산 결과
│
├── /mypage
│   ├── 현재 보유 런치 표시
│   ├── 누적 수익, 수익률(%), 출석, 퀴즈 정답 횟수
│   ├── 투자 히스토리 리스트 (날짜 / 메뉴 / 결과)
│   └── 히스토리 그래프 (꺾은선 or 바 차트)
│
├── /ranking
│   ├── 일일 랭킹
│   │   ├── 당일 수익 기준 리스트업 (2:00 기준)
│   │   └── TOP 3 트로피 뱃지 제공
│   │
│   └── 주간 랭킹
│       ├── 월~금 수익 기준 TOP 3 발표
│       ├── 수익률(%) 함께 표기
│       └── 금요일 시상 및 트로피 배포
│
└── Cf) 사용자 흐름 요약
    ├── 1단계: 회원가입 → 온보딩 → 자산 획득
    ├── 2단계: /home에서 출석 + 퀴즈 + 투자 진행
    ├── 3단계: /vote에서 실제 메뉴 투표
    ├── 4단계: /result에서 결과 확인 및 수익 정산
    └── 5단계: /mypage, /ranking에서 통계 및 랭킹 확인
```
