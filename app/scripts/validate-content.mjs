// content/ 전체를 SPEC §5 계약으로 검사. 위반 1건이라도 있으면 exit 1 → CI가 배포 차단.
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from '../src/content/frontmatter.js'
import { validateEntry, KINDS, isContentFile } from '../src/content/schema.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')
let failed = false
for (const kind of KINDS) {
  let files = []
  try { files = readdirSync(join(root, kind)).filter(isContentFile) } catch { continue }
  for (const f of files) {
    const { data, body } = parseFrontmatter(readFileSync(join(root, kind, f), 'utf8'))
    const errs = validateEntry(kind, f, data, body)
    if (errs.length) { failed = true; console.error(`FAIL ${kind}/${f}\n  - ${errs.join('\n  - ')}`) }
    else console.log(`OK   ${kind}/${f}`)
  }
}
process.exit(failed ? 1 : 0)
