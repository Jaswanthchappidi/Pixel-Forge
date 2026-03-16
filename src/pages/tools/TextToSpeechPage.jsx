import { useState, useEffect } from 'react'
import { Volume2, Play, Pause, RotateCcw, Settings2 } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import './ToolStyles.css'

export default function TextToSpeechPage() {
  const [text, setText] = useState('Hello! Welcome to the Image & PDF Tool suite. How can I help you today?')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(0)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)

  useEffect(() => {
    const synth = window.speechSynthesis
    const updateVoices = () => {
      setVoices(synth.getVoices())
    }
    updateVoices()
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices
    }
  }, [])

  const speak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voices[selectedVoice]
    utterance.rate = rate
    utterance.pitch = pitch

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }


  return (
    <ToolPage icon={Volume2} title="Text to Speech" color="#7c3aed" bg="rgba(124, 58, 237, 0.1)"
      desc="Convert any written text into high-quality spoken audio using your device's native voices.">
      
      <div className="tool-workspace">
        <div className="tool-controls">
          <div className="control-section">
            <label className="control-label">Enter Text</label>
            <textarea 
              className="styled-textarea" 
              value={text} 
              onChange={e => setText(e.target.value)}
              placeholder="Type something here..."
              style={{ height: '200px' }}
            />
          </div>

          <div className="control-group">
            <label>Select Voice</label>
            <select className="styled-select" value={selectedVoice} onChange={e => setSelectedVoice(Number(e.target.value))}>
              {voices.map((voice, idx) => (
                <option key={idx} value={idx}>{voice.name} ({voice.lang})</option>
              ))}
            </select>
          </div>

          <div className="control-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="control-group">
              <label>Speed ({rate}x)</label>
              <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Pitch ({pitch})</label>
              <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button className="primary-button" onClick={speak} style={{ flex: 1 }}>
              {isSpeaking ? <><Pause size={18} /> Stop Reading</> : <><Play size={18} /> Start Reading</>}
            </button>
            <button className="secondary-button" onClick={() => setText('')}>
               <RotateCcw size={18} /> Clear
            </button>
          </div>
        </div>

        <div className="preview-area" style={{ background: 'var(--surface2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
           <div className={`speaking-visualizer ${isSpeaking ? 'active' : ''}`} style={{ width: '200px', height: '200px', borderRadius: '50%', border: '4px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Volume2 size={64} color="var(--accent)" className={isSpeaking ? 'pulse' : ''} />
              {isSpeaking && Array.from({length: 3}).map((_, i) => (
                <div key={i} className="wave-ring" style={{ animationDelay: `${i * 0.5}s` }} />
              ))}
           </div>
        </div>
      </div>

      <style>{`
        .speaking-visualizer.active { border-color: var(--accent); }
        .pulse { animation: pulse 1s infinite ease-in-out; }
        .wave-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--accent);
          animation: wave 1.5s infinite linear;
          opacity: 0;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes wave {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </ToolPage>
  )
}
