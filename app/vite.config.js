import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/' 전제 = 조직 루트 사이트(<org>.github.io repo)로 배포.
// 프로젝트 사이트(<org>.github.io/<repo>)로 가면 base를 '/<repo>/'로 변경할 것.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
