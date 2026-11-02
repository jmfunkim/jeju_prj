import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Myth from './pages/Myth'
import Stone from './pages/Stone'
import Places from './pages/Places'
import Notebook from './pages/Notebook'
import NotFound from './pages/NotFound'

// 페이지 추가: ① pages/ 에 파일 ② NAV_ITEMS 한 줄 ③ routes 한 줄  (아이콘: icons.getbootstrap.com)
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house-heart' },
  { to: '/map', label: '3D 지도', icon: 'globe-asia-australia' },
  { to: '/myth', label: '신화·설화', icon: 'stars' },
  { to: '/stone', label: '돌문화', icon: 'bricks' },
  { to: '/places', label: '위치정보', icon: 'pin-map' },
  { to: '/notebook', label: '내 수첩', icon: 'journal-bookmark' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'map', element: <MapPage /> },
      { path: 'myth', element: <Myth /> },
      { path: 'stone', element: <Stone /> },
      { path: 'places', element: <Places /> },
      { path: 'notebook', element: <Notebook /> },
    ],
  },
])
