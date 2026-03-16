import { useEffect, useRef } from 'react'
import './Histogram.css'

export function Histogram({ sourceCanvas, trigger }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!sourceCanvas || !ref.current) return

    try {
      const ctx       = sourceCanvas.getContext('2d')
      const { width, height } = sourceCanvas
      if (width === 0 || height === 0) return
      const imageData = ctx.getImageData(0, 0, width, height)
      const data      = imageData.data

      const r = new Array(256).fill(0)
      const g = new Array(256).fill(0)
      const b = new Array(256).fill(0)
      const l = new Array(256).fill(0)

      for (let i = 0; i < data.length; i += 4) {
        r[data[i]]++
        g[data[i + 1]]++
        b[data[i + 2]]++
        const lum = Math.round(0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2])
        l[lum]++
      }

      const max = Math.max(...r, ...g, ...b)

      const hc     = ref.current
      hc.width     = 256
      hc.height    = 80
      const hctx   = hc.getContext('2d')
      hctx.clearRect(0, 0, 256, 80)

      // Background
      hctx.fillStyle = 'rgba(0,0,0,0.0)'
      hctx.fillRect(0, 0, 256, 80)

      // Luminosity
      hctx.fillStyle = 'rgba(255,255,255,0.08)'
      for (let i = 0; i < 256; i++) {
        const h = (l[i] / max) * 80
        hctx.fillRect(i, 80 - h, 1, h)
      }

      // RGB channels
      const channels = [
        { data: r, color: 'rgba(255,80,80,0.65)'   },
        { data: g, color: 'rgba(80,200,80,0.65)'   },
        { data: b, color: 'rgba(80,140,255,0.65)'  },
      ]
      channels.forEach(({ data: ch, color }) => {
        hctx.fillStyle = color
        for (let i = 0; i < 256; i++) {
          const h = (ch[i] / max) * 80
          hctx.fillRect(i, 80 - h, 1, h)
        }
      })

      // Grid lines
      hctx.strokeStyle = 'rgba(255,255,255,0.06)'
      hctx.lineWidth   = 1
      ;[64, 128, 192].forEach(x => {
        hctx.beginPath()
        hctx.moveTo(x, 0)
        hctx.lineTo(x, 80)
        hctx.stroke()
      })
    } catch {
      // Canvas tainted or not ready
    }
  }, [sourceCanvas, trigger])

  return (
    <div className="histogram-wrap">
      <div className="histogram-header">
        <span className="hist-label r">R</span>
        <span className="hist-label g">G</span>
        <span className="hist-label b">B</span>
        <span className="hist-title">Histogram</span>
      </div>
      <canvas ref={ref} className="histogram-canvas" />
      <div className="histogram-axis">
        <span>0</span><span>64</span><span>128</span><span>192</span><span>255</span>
      </div>
    </div>
  )
}