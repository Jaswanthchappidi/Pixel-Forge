import { Layers } from 'lucide-react'
import './LoadingScreen.css'

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <Layers size={22} strokeWidth={1.5} />
      </div>
      <p>Loading tool…</p>
    </div>
  )
}