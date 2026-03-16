import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Copy, Check, RotateCcw } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import './ToolStyles.css'

export default function SpeechToTextPage() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setTimeout(() => {
        setError('Speech recognition is not supported in this browser. Please try Chrome or Edge.')
      }, 0)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error(event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable permissions.')
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      setError('')
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const copy = () => {
    if (!transcript) return
    navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clear = () => {
    setTranscript('')
  }

  return (
    <ToolPage icon={Mic} title="Speech to Text" color="#c026d3" bg="rgba(192, 38, 211, 0.1)"
      desc="Convert your voice into text in real-time using advanced browser speech recognition.">
      
      <div className="tool-workspace">
        <div className="tool-controls" style={{ flex: 1.5 }}>
           <div className="transcript-box" style={{ background: 'var(--surface2)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px', minHeight: '400px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {transcript || (isListening ? 'Listening...' : 'Click the microphone and start speaking...')}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button className="secondary-button" onClick={copy} disabled={!transcript}>
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy Text'}
                </button>
                <button className="secondary-button" onClick={clear} disabled={!transcript}>
                  <RotateCcw size={16} /> Clear
                </button>
              </div>
           </div>

           {error && (
             <div className="error-badge fade-up" style={{ marginTop: '16px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>
               {error}
             </div>
           )}
        </div>

        <div className="preview-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
           <button 
             onClick={toggleListening}
             style={{ 
               width: '120px', 
               height: '120px', 
               borderRadius: '50%', 
               background: isListening ? '#ef4444' : 'var(--accent)', 
               color: 'white', 
               border: 'none', 
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 8px 16px rgba(0,0,0,0.2)',
               transition: 'all 0.3s ease'
             }}
           >
             {isListening ? <MicOff size={48} /> : <Mic size={48} />}
           </button>
           <div style={{ textAlign: 'center' }}>
             <p style={{ fontWeight: 600, fontSize: '1.2rem', margin: 0 }}>{isListening ? 'Listening...' : 'Push to Talk'}</p>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
               {isListening ? 'Speak clearly into your microphone' : 'Click the button to start transcribing'}
             </p>
           </div>

           {isListening && (
             <div className="audio-visualizer" style={{ display: 'flex', gap: '4px', height: '40px', alignItems: 'center' }}>
                {Array.from({length: 10}).map((_, i) => (
                  <div key={i} className="audio-bar" style={{ 
                    width: '4px', 
                    height: '20px', 
                    background: '#ef4444', 
                    borderRadius: '2px',
                    animation: 'audio-bounce 0.5s infinite ease-in-out',
                    animationDelay: `${i * 0.1}s`
                  }} />
                ))}
             </div>
           )}
        </div>
      </div>

      <style>{`
        @keyframes audio-bounce {
          0%, 100% { height: 10px; }
          50% { height: 35px; }
        }
      `}</style>
    </ToolPage>
  )
}
