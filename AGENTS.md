# Strata Front 작업 지침

## 프로젝트 개요

- 이 프로젝트는 Unity WebGL로 빌드된 애플리케이션을 실행하기 위한 SvelteKit 프론트엔드 서버다.
- 사용자는 Svelte/SvelteKit을 처음부터 차근차근 학습하는 용도로도 이 프로젝트를 사용한다.
- 현재 Unity 애플리케이션은 `/play` 경로에서 실행한다.
- 코드의 간결함뿐 아니라 학습하기 쉬운 구조와 설명 가능성을 중요하게 여긴다.

## 기술 구성

- Svelte 5
- SvelteKit 2
- TypeScript
- Vite
- `@sveltejs/adapter-auto`
- Node.js v24.18.0
- npm v12.0.1

배포 대상 플랫폼과 최종 SvelteKit adapter는 아직 결정되지 않았다. 배포 환경을 추측해 adapter를 변경하지 않는다.

## 주요 경로

- `src/routes/+page.svelte`: 루트(`/`) 페이지
- `src/routes/play/+page.svelte`: Unity WebGL 실행 페이지
- `src/app.d.ts`: Unity WebGL 전역 TypeScript 타입 선언
- `static/unity/`: Unity WebGL 빌드 결과물
- `static/unity/Build/`: Unity 로더, 데이터, 프레임워크, WASM 파일
- `vite.config.ts`: SvelteKit 설정과 Unity Brotli 응답 헤더 설정

현재 Unity 빌드 파일명은 다음과 같다.

- `result.loader.js`
- `result.data.br`
- `result.framework.js.br`
- `result.wasm.br`

Unity 빌드를 교체하면 실제 파일명을 확인하고 `/play`의 설정과 일치시키거나, 파일명 변경에 강한 구조로 개선한다.

## Unity WebGL 관련 주의사항

- Unity 빌드는 현재 Brotli로 압축되어 있다.
- `.br` 파일은 올바른 `Content-Encoding`과 `Content-Type` 헤더가 필요하다.
- Vite 개발 서버와 preview 서버의 헤더는 `vite.config.ts`에서 설정한다.
- 실제 배포 서버나 CDN에도 같은 헤더 설정이 별도로 필요할 수 있다.
- WASM 파일의 `Content-Type`은 `application/wasm`이어야 한다.
- Unity 인스턴스는 페이지를 벗어날 때 `Quit()`으로 정리한다.
- 브라우저 전용 API와 Unity 초기화는 SSR 중 실행하지 말고 `onMount` 안에서 실행한다.

## 로컬 명령 실행

Node와 npm은 nvm으로 설치되어 있다. 비대화형 셸에서는 nvm이 자동 초기화되지 않을 수 있으므로 명령 실행 전에 다음을 사용한다.

```bash
source /home/hjs/.nvm/nvm.sh
nvm use 24.18.0
```

검사와 빌드:

```bash
npm run check
npm run build
```

이 환경에서는 일반 개발 서버 실행 시 파일 감시 한도 때문에 `EMFILE: too many open files` 오류가 발생할 수 있다. 그 경우 폴링 감시를 사용한다.

```bash
CHOKIDAR_USEPOLLING=true npm run dev
```

검증된 로컬 주소는 `http://127.0.0.1:5173/play`이다.

## 작업 방식

### 작은 코드리뷰 단위

- 기능을 가능한 한 작고 독립적으로 나눠 작업한다.
- 한 번에 여러 개념이나 대규모 리팩터링을 섞지 않는다.
- 각 단위는 사용자가 읽고 실행해 확인할 수 있는 크기로 유지한다.
- 안전하고 관련 있는 다음 단계가 남아 있더라도, 학습 흐름상 별도 리뷰 단위가 더 적합하면 먼저 현재 단위를 설명하고 다음 진행 여부를 확인한다.

### 변경 전

- 이번 변경의 목적과 수정할 범위를 짧게 설명한다.
- 기존 코드를 먼저 확인하고 이미 사용 중인 패턴을 존중한다.
- 새로운 라이브러리나 복잡한 추상화는 꼭 필요한 경우에만 도입한다.

### 변경 후 설명

각 코드리뷰 단위가 끝나면 다음 내용을 한국어로 설명한다.

1. 이번 변경으로 무엇이 달라졌는지
2. 어떤 파일을 왜 수정했는지
3. 관련된 Svelte/SvelteKit 핵심 개념
4. 사용자가 직접 확인하는 방법
5. 알아둘 주의점이나 선택 가능한 다른 방식
6. 다음에 진행하기 좋은 작은 작업

코드 설명은 사용자가 Svelte를 잘 모른다고 가정하되, 불필요하게 장황하거나 모든 문법을 한꺼번에 설명하지 않는다. 현재 변경을 이해하는 데 필요한 개념부터 설명한다.

### 구현 원칙

- Svelte 5의 현재 프로젝트 스타일을 따른다.
- 브라우저 생명주기가 필요한 코드는 `onMount`를 사용한다.
- 전역 JavaScript API에는 TypeScript 타입을 선언한다.
- 상태, DOM 참조, 외부 스크립트 로딩의 역할을 명확히 분리한다.
- 학습 단계에서는 과도한 컴포넌트 분리나 범용화를 피한다.
- 사용자 요청 범위 밖의 UI 재설계나 구조 변경은 임의로 진행하지 않는다.

## 검증 원칙

코드를 변경한 뒤 가능한 범위에서 다음을 실행한다.

```bash
npm run check
npm run build
```

Unity 실행과 관련된 변경은 추가로 확인한다.

- `/play`가 HTTP 200으로 응답하는지
- Unity loader가 로드되는지
- `.data.br`, `.framework.js.br`, `.wasm.br`가 HTTP 200인지
- Brotli 및 MIME 응답 헤더가 올바른지
- 브라우저에서 로딩이 시작되는지
- 페이지 이탈 시 인스턴스 정리가 가능한지

검증하지 못한 항목은 성공한 것처럼 표현하지 말고 이유와 사용자가 확인할 방법을 명시한다.

## 현재까지 완료된 작업

- Unity WebGL 빌드를 `static/unity/`에 배치했다.
- `/play` 라우트에서 Unity의 `createUnityInstance()`를 호출하도록 구현했다.
- 로딩 진행률, 경고, 오류, 전체 화면 버튼을 추가했다.
- 반응형 Unity canvas를 구성했다.
- 페이지 이탈 시 Unity 인스턴스를 종료하도록 처리했다.
- Unity 전역 API의 TypeScript 타입을 `src/app.d.ts`에 선언했다.
- Vite 개발 및 preview 서버에 Brotli와 MIME 응답 헤더를 추가했다.
- `npm run check`에서 오류와 경고가 없음을 확인했다.
- `npm run build`가 성공함을 확인했다.
- 헤드리스 Chrome에서 `/play` 페이지와 Unity 로딩 시작을 확인했다.

