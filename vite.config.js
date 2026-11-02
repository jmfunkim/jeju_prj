import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// npm run dev 만으로도 /api/*.js 서버 함수를 쓸 수 있게 해 주는 개발용 미들웨어.
// (배포 환경 Vercel 에서는 같은 파일이 그대로 서버 함수로 동작합니다)
function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, env)   // .env.local 의 비밀 키를 서버 함수에서 쓸 수 있게
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice('/api/'.length)
        if (!/^[a-z0-9_-]+$/i.test(name)) return next()
        const reply = (code, body) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(body))
        }
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          const shim = { status: (c) => ({ json: (b) => reply(c, b) }) }
          await mod.default({ query: Object.fromEntries(url.searchParams), method: req.method }, shim)
        } catch (e) {
          reply(e.code === 'ERR_MODULE_NOT_FOUND' || /Failed to load/.test(e.message) ? 404 : 500, { error: e.message })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), ''))],
  // 개발 서버가 의존성을 다시 최적화하다 React 가 둘로 갈라지는 문제를 막는다
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom', 'react-router-dom', 'react-bootstrap', 'three', 'zustand'] },
}))
