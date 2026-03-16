import { Unlock, LockOpen } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function UnlockPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    setError('')
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // Attempt to load. If it requires a password and we don't have it, it will throw.
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password: password || undefined })
      
      // Saving it WITHOUT specifying a password will remove the encryption
      const pdfBytes = await pdfDoc.save()
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `unlocked_${file.name}`
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error(err)
      if (err.message && err.message.includes('password')) {
         setError('Incorrect or missing password. Please provide the correct password to unlock this file.')
      } else {
         setError(err.message || 'Error unlocking PDF. It might be corrupted or use unsupported encryption.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={Unlock} 
      title="Unlock PDF" 
      color="#22c55e" 
      bg="rgba(34, 197, 94, 0.1)"
      desc="Remove PDF password security to read and edit freely.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls" style={{ alignItems: 'center', textAlign: 'center', padding: '40px' }}>
             <LockOpen size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
             <h3 style={{marginTop:0}}>Unlock {file.name}</h3>
             
             <div className="control-group" style={{ textAlign: 'left', width: '300px', margin: '0 auto' }}>
                <label>Enter Current Password</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="Password required to open file" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isProcessing}
                />
             </div>
             
             {error && <div style={{color: 'var(--red)', fontSize: '0.9rem', marginTop: '16px', maxWidth: '400px', lineHeight: '1.4'}}>{error}</div>}
             
             <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="styled-button secondary" onClick={() => {setFile(null); setError(''); setPassword('');}} disabled={isProcessing}>
                  Cancel
                </button>
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? 'Unlocking...' : 'Unlock & Download'}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
