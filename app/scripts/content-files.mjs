// content/ 파일 읽기 공용 모듈 — 검증기(validate-content.mjs)와 DB 동기화(sync-content-db.mjs)가 공유.
// 파싱·판별 규칙의 원천은 여전히 src/content/{frontmatter,schema}.js — 여기는 "디스크에서 읽는 방법"만 담는다.
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from '../src/content/frontmatter.js'
import { isContentFile } from '../src/content/schema.js'

export const CONTENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')

// kind('기사'·'세미나'·'프로젝트') 폴더의 게재 대상 파일 목록.
// `_` 시작 파일(템플릿·초안)은 isContentFile이 걸러낸다 — 로더·검증기와 같은 판별.
// 폴더가 없으면 빈 배열(오류 아님).
export function readEntries(kind) {
  let files = []
  try {
    files = readdirSync(join(CONTENT_ROOT, kind)).filter(isContentFile).sort()
  } catch {
    return []
  }
  return files.map((file) => {
    const path = join(CONTENT_ROOT, kind, file)
    const { data, body } = parseFrontmatter(readFileSync(path, 'utf8'))
    // slug = 파일명 스템 — DB upsert 키(articles.슬러그)이자 공개 URL의 ?p= 값(loader.js와 동일 규칙).
    return { kind, file, path, slug: file.replace(/\.md$/, ''), data, body }
  })
}
