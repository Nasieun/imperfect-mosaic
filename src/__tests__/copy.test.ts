import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 화면 문구 검사: 회복을 강요하거나, 완성을 요구하거나, 들뜬 보상 톤의 표현을 막는다.
 * 소스의 문자열 리터럴과 JSX 텍스트 중 한글이 들어간 것만 검사한다.
 */
const FORBIDDEN = ['극복', '이겨내', '완성도', '채워', '채우세요', '성장해야'];
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const HANGUL = /[가-힣]/;

const SRC = join(__dirname, '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === '__tests__' ? [] : walk(p);
    return /\.(ts|tsx)$/.test(name) ? [p] : [];
  });
}

function userFacingStrings(code: string, isTsx: boolean): string[] {
  const noComments = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const out: string[] = [];
  const literal = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  for (const m of noComments.matchAll(literal)) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  if (isTsx) {
    const jsxText = />([^<>{}]+)</g;
    for (const m of noComments.matchAll(jsxText)) out.push(m[1]);
  }
  return out.filter((s) => HANGUL.test(s));
}

const files = walk(SRC);

describe('화면 문구 가이드', () => {
  it('검사할 파일이 있다', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const file of files) {
    const strings = userFacingStrings(readFileSync(file, 'utf8'), file.endsWith('.tsx'));
    if (!strings.length) continue;
    it(`${relative(SRC, file)}: 금지 표현·느낌표·이모지가 없다`, () => {
      for (const s of strings) {
        for (const word of FORBIDDEN) expect(s, `"${s}"`).not.toContain(word);
        expect(s, `"${s}"`).not.toContain('!');
        expect(EMOJI.test(s), `"${s}"`).toBe(false);
      }
    });
  }
});
