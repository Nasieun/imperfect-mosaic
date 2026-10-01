import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

// 서비스 워커가 설치될 때 미리 담아 둘 빌드 파일 목록.
// 빌드할 때 한 번 만들어 정적 파일로 둔다(일반 서버와 GitHub Pages 모두에서 동작).
export const dynamic = 'force-static';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : Promise.resolve([join(dir, e.name)]))),
  );
  return nested.flat();
}

export async function GET() {
  const staticDir = join(process.cwd(), '.next', 'static');
  let urls: string[] = [];
  try {
    urls = (await walk(staticDir))
      .map((f) => `${BASE}/_next/static/` + f.slice(staticDir.length + 1).split('\\').join('/'))
      .filter((u) => !u.endsWith('.map'))
      .sort();
  } catch {
    // 개발 모드처럼 빌드 파일이 없으면 빈 목록
  }
  // 파일 목록이 바뀌면 버전도 바뀐다 → 서비스 워커가 새 캐시를 만든다.
  const version = createHash('sha256').update(urls.join('\n')).digest('hex').slice(0, 12);
  return Response.json({ version, urls });
}
