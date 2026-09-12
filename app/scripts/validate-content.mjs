// content/ 전체를 SPEC §5 계약으로 검사. 위반 1건이라도 있으면 exit 1 → CI가 배포 차단.
import { KINDS, validateEntry, validateCandidateLock } from '../src/content/schema.js'
import { readEntries } from './content-files.mjs'

let failed = false
for (const kind of KINDS) {
  for (const { file, data, body } of readEntries(kind)) {
    const errs = validateEntry(kind, file, data, body)
    if (errs.length) { failed = true; console.error(`FAIL ${kind}/${file}\n  - ${errs.join('\n  - ')}`) }
    else console.log(`OK   ${kind}/${file}`)
  }
}
// 2차: 후보출처 잠금(파일 간 교차 검사 — 심층은 주간 보고 후보 표에 있는 소재만)
for (const { file, errs } of validateCandidateLock(readEntries('기사'))) {
  failed = true
  console.error(`FAIL 기사/${file}\n  - ${errs.join('\n  - ')}`)
}
process.exit(failed ? 1 : 0)
