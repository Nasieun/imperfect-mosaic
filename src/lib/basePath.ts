/**
 * 앱이 놓인 하위 경로. GitHub Pages(https://아이디.github.io/저장소/)처럼
 * 도메인 루트가 아닌 곳에 올릴 때만 값이 있다. 로컬·일반 서버에서는 빈 문자열.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Next의 Link·router가 처리하지 않는 경로(서비스 워커, history API 등)에 붙인다. */
export const withBase = (path: string) => `${BASE_PATH}${path}`;
