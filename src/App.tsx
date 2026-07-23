import './App.css'
import YouTubePlaylistDuration from './components/Page'
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YouTubePlaylistDuration/>
      <Analytics />
    </>
  )
}

export default App
