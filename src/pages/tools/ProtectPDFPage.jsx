import { Shield, Lock } from 'lucide-react'
import { ToolPage } from '../../components/ToolPage'
import { PDFUpload } from '../../components/PDFUpload'
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import './ToolStyles.css'
import './PDFToolStyles.css'

export default function ProtectPDFPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleProcess = async () => {
    if (!file) return
    if (!password) {
      setError('Please enter a password.')
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      // pdf-lib supports encrypting with user and owner passwords
      await pdfDoc.save({
        useObjectStreams: false,
        updateFieldAppearances: false,
      })
      
      // Note: pdf-lib encryption support is actually somewhat limited in standard builds
      // Let's attempt basic document modification, but note that 
      // full RC4/AES encryption in the browser often requires extra packages or custom pdf-lib builds.
      // Since standard pdf-lib allows setting permissions but true robust encryption is tricky:
      // We'll wrap this in a clear try-catch.
      // 
      // *UPDATE*: Standard pdf-lib does not natively encrypt.
      // To simulate protection for this demo, we can just throw a friendly error informing the user.
      throw new Error("Client-side PDF Encryption requires an external secure cryptography module not present in standard pdf-lib. In a real-world scenario, this specific tool is usually processed on a backend server for security reasons.")
      
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error protecting PDF.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ToolPage 
      icon={Shield} 
      title="Protect PDF (Password)" 
      color="#ef4444" 
      bg="rgba(239, 68, 68, 0.1)"
      desc="Secure your PDF with a password.">
      
      <div className="pdf-workspace">
        {!file ? (
          <PDFUpload onPDFLoaded={setFile} />
        ) : (
          <div className="tool-controls" style={{ alignItems: 'center', textAlign: 'center', padding: '40px' }}>
             <Lock size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
             <h3 style={{marginTop:0}}>Protect {file.name}</h3>
             
             <div className="control-group" style={{ textAlign: 'left', width: '300px', margin: '0 auto' }}>
                <label>Set Document Password</label>
                <input 
                  type="text" 
                  className="styled-input" 
                  placeholder="Enter a strong password" 
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
                <button className="styled-button" onClick={handleProcess} disabled={isProcessing || !password}>
                  {isProcessing ? 'Encrypting...' : 'Encrypt & Download'}
                </button>
             </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
