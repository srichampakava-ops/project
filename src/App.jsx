import { useRef, useState } from 'react'
import Tesseract from 'tesseract.js'
import { runDefiniteFlags } from './riskEngine/definiteFlags'
import { runRulesEngine } from './riskEngine/rulesEngine'
import { translateText } from './translate/translate'
import './App.css'

const LANGUAGES = [
  { code: 'en', tesseractCode: 'eng', label: 'English' },
  { code: 'hi', tesseractCode: 'hin', label: 'Hindi' },
  { code: 'ta', tesseractCode: 'tam', label: 'Tamil' },
  { code: 'bn', tesseractCode: 'ben', label: 'Bengali' },
  { code: 'te', tesseractCode: 'tel', label: 'Telugu' },
]
const MAX_BYTES = 20 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png']

/* ---------- Inline icons ---------- */
const svgBase = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

function ShieldCheckIcon(props) {
  return (<svg viewBox="0 0 24 26" aria-hidden="true" {...props}><path {...svgBase} d="M12 1.5 3 4.5v7c0 5.5 3.8 10.6 9 12.5 5.2-1.9 9-7 9-12.5v-7L12 1.5Z" /><path {...svgBase} d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>)
}
function GlobeIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle {...svgBase} cx="12" cy="12" r="9" /><path {...svgBase} d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" /></svg>)
}
function DocIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...svgBase} d="M6 2h8l4 4v16H6V2Z" /><path {...svgBase} d="M14 2v4h4M9 12h6M9 16h6M9 8h2" /></svg>)
}
function CloudUploadIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...svgBase} d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 6.98" /><path {...svgBase} d="M12 12v7M9 14.5l3-3 3 3" /></svg>)
}
function FolderIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...svgBase} d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-12Z" /></svg>)
}
function DocScanIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...svgBase} d="M6 2h8l4 4v6M6 2v20h6" /><path {...svgBase} d="M14 2v4h4M9 9h4M9 12h3" /><circle {...svgBase} cx="16" cy="17" r="3.2" /><path {...svgBase} d="m18.4 19.4 2.1 2.1" /></svg>)
}
function WarningIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...svgBase} d="M12 3 1.5 21h21L12 3Z" /><path {...svgBase} d="M12 9v5M12 17.5h.01" /></svg>)
}
function CheckCircleIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle {...svgBase} cx="12" cy="12" r="9" /><path {...svgBase} d="m8 12 2.5 2.5L16 9" /></svg>)
}
function InfoIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle {...svgBase} cx="12" cy="12" r="9" /><path {...svgBase} d="M12 11v5M12 8h.01" /></svg>)
}
function ChevronDownIcon(props) {
  return (<svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...svgBase} d="m6 9 6 6 6-6" /></svg>)
}
function LeafIcon(props) {
  return (<svg viewBox="0 0 120 120" aria-hidden="true" fill="currentColor" {...props}><path d="M110 12C70 16 40 34 26 62c-6 12-8 26-6 40 2-10 6-19 12-27 2 8 8 15 16 19-4-8-5-17-2-25 8 6 18 9 28 8-8-5-14-12-16-21 12 3 25 1 36-6-10-1-19-6-25-14 14-2 27-11 34-24-9 4-19 5-28 3 12-9 20-22 25-38Z" /></svg>)
}

/* ---------- Results panel ---------- */
function ResultsPanel({ status, statusMessage, result, ocrLowConfidence, translationFailed }) {
  const [showOriginal, setShowOriginal] = useState(false)

  if (status === 'analyzing') {
    return (
      <div className="results" aria-live="polite">
        <div className="analyzing">
          <div className="spinner" aria-hidden="true" />
          <p>{statusMessage || 'Scanning your contract for potential labor-rights issues…'}</p>
        </div>
      </div>
    )
  }

  if (status === 'idle' || !result) {
    return (
      <div className="results" aria-live="polite">
        <div className="results-empty">
          <DocScanIcon className="results-empty-icon" />
          <h3>Analysis Results Will Appear Here</h3>
          <p>Upload a contract to scan and detect potential issues.</p>
        </div>
      </div>
    )
  }

  const hasWarnings = result.warnings.length > 0

  return (
    <div className="results" aria-live="polite">
      <div className="results-head">
        <h3>Analysis Results</h3>
        <button type="button" className="toggle" aria-pressed={showOriginal} onClick={() => setShowOriginal((v) => !v)}>
          <span className={`toggle-track${showOriginal ? ' on' : ''}`}><span className="toggle-knob" /></span>
          Show original text &amp; translation
        </button>
      </div>

      {ocrLowConfidence && (
        <div className="disclaimer" role="note" style={{ marginTop: '10px' }}>
          <InfoIcon />
          <p>The photo text wasn't very clear — results may be less accurate. Try retaking with better lighting.</p>
        </div>
      )}

      {translationFailed && (
        <div className="disclaimer" role="note" style={{ marginTop: '10px' }}>
          <InfoIcon />
          <p>Translation service unavailable — some results use original text and may be less accurate.</p>
        </div>
      )}

      {showOriginal && (
        <div className="original-box">
          <div className="col">
            <h4>Original Text</h4>
            <p>{result.originalText}</p>
          </div>
          <div className="col">
            <h4>Translation</h4>
            <p>{result.translatedText}</p>
          </div>
        </div>
      )}

      {hasWarnings ? (
        <ul className="warn-list">
          {result.warnings.map((w) => (
            <li key={w.id} className="warn-item">
              <WarningIcon className="warn-icon" />
              <div>
                <h5>{w.displayTitle}</h5>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="success-box" role="status">
          <CheckCircleIcon />
          <div>
            <strong>No labor-rights risks detected</strong>
            <span>This contract passed the automated screening with zero warnings.</span>
          </div>
        </div>
      )}

      <div className="disclaimer" role="note">
        <InfoIcon />
        <p>This is an automated screening tool, not legal advice. It checks for a specific list of common risks and may not catch every unfair term. Please show this contract to someone you trust or a legal aid worker before signing.</p>
      </div>
    </div>
  )
}

/* ---------- Main app ---------- */
export default function App() {
  const [contractLang, setContractLang] = useState('en')
  const [outputLang, setOutputLang] = useState('en')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [result, setResult] = useState(null)
  const [ocrLowConfidence, setOcrLowConfidence] = useState(false)
  const [translationFailed, setTranslationFailed] = useState(false)
  const inputRef = useRef(null)

  function validateAndSet(f) {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setError('Unsupported file type. Please upload a JPG or PNG image.')
      return
    }
    if (f.size > MAX_BYTES) {
      setError('File is too large. Maximum size is 20MB.')
      return
    }
    setError('')
    setFile(f)
    runAnalysis(f)
  }

  async function runAnalysis(f) {
    setStatus('analyzing')
    setResult(null)
    setOcrLowConfidence(false)
    setTranslationFailed(false)

    const contractLangObj = LANGUAGES.find((l) => l.code === contractLang)

    setStatusMessage('Reading text from photo...')
    const ocrResult = await Tesseract.recognize(f, contractLangObj.tesseractCode, {
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setStatusMessage(`Reading text... ${Math.round(m.progress * 100)}%`)
        }
      },
    })
    const extractedText = ocrResult.data.text
    setOcrLowConfidence(ocrResult.data.confidence < 70)

    setStatusMessage('Translating to English for analysis...')
    const englishVersion = await translateText(extractedText, contractLang, 'en')

    let textForRules = englishVersion
    let mainTranslationFailed = false
    if (!englishVersion) {
      mainTranslationFailed = true
      textForRules = extractedText
    }

    setStatusMessage('Checking for risks...')
    const layer1 = runRulesEngine(textForRules)
    const layer2 = runDefiniteFlags(extractedText + ' ' + (englishVersion || ''))
    const allWarnings = [...layer2, ...layer1.filter((w1) => !layer2.some((w2) => w2.id === w1.id))]

    setStatusMessage('Translating warnings to your language...')
    let anyWarningTranslationFailed = false
    const translatedWarnings = await Promise.all(
      allWarnings.map(async (w) => {
        const translatedTitle = await translateText(w.title, 'en', outputLang)
        if (!translatedTitle) anyWarningTranslationFailed = true
        return { ...w, displayTitle: translatedTitle || w.title }
      })
    )

    setTranslationFailed(mainTranslationFailed || anyWarningTranslationFailed)
    setResult({
      warnings: translatedWarnings,
      originalText: extractedText,
      translatedText: textForRules,
    })
    setStatus('done')
  }

  function onFileChange(e) {
    validateAndSet(e.target.files && e.target.files[0])
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    validateAndSet(e.dataTransfer.files && e.dataTransfer.files[0])
  }

  function clearFile() {
    setFile(null)
    setError('')
    setStatus('idle')
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="app">
      <LeafIcon className="leaf leaf-tr" />
      <LeafIcon className="leaf leaf-bl" />
      <LeafIcon className="leaf leaf-br" />

      <header className="header">
        <div className="brand">
          <ShieldCheckIcon className="brand-shield" />
          <div>
            <h1 className="brand-name">SafeContract</h1>
            <p className="brand-tag">Contract review for a safer workforce</p>
          </div>
        </div>
      </header>

      <main>
        <div className="hero">
          <div className="hero-title-row">
            <DocScanIcon className="hero-icon" />
            <h2 className="hero-title">Worker Contract Scanner</h2>
          </div>
          <p className="hero-sub">
            Upload a photo of your employment contract, scan for labor-rights red flags,
            and get clear insights in your language.
          </p>
        </div>

        <div className="grid">
          <section className="card" aria-labelledby="step1-title">
            <div className="badge"><GlobeIcon /></div>
            <h2 className="card-title" id="step1-title">1. Contract Language</h2>
            <p className="card-desc">Select the language of the contract</p>
            <div className="select-wrap">
              <label className="sr-only" htmlFor="contract-lang">Contract language</label>
              <select id="contract-lang" className="select" value={contractLang} onChange={(e) => setContractLang(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <ChevronDownIcon className="select-chevron" />
            </div>
          </section>

          <section className="card" aria-labelledby="step2-title">
            <div className="badge"><DocIcon /></div>
            <h2 className="card-title" id="step2-title">2. Output Language</h2>
            <p className="card-desc">Select the language for the analysis output</p>
            <div className="select-wrap">
              <label className="sr-only" htmlFor="output-lang">Output language</label>
              <select id="output-lang" className="select" value={outputLang} onChange={(e) => setOutputLang(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              <ChevronDownIcon className="select-chevron" />
            </div>
          </section>

          <section className="card" aria-labelledby="step3-title">
            <div className="badge"><CloudUploadIcon /></div>
            <h2 className="card-title" id="step3-title">3. Upload Contract</h2>
            <p className="card-desc">Upload your worker contract document</p>

            <div
              className={`dropzone${dragging ? ' drag' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <FolderIcon className="dropzone-folder" />
              <div className="dropzone-text">Drag &amp; Drop your file here</div>
              <div className="dropzone-or">or</div>
              <button type="button" className="choose-btn" onClick={() => inputRef.current && inputRef.current.click()}>
                Choose File
              </button>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png" hidden onChange={onFileChange} />

              <p className="upload-formats">Supported formats: JPG, PNG<br />Max file size: 20MB</p>

              {file && (
                <div className="file-chip">
                  <span>{file.name}</span>
                  <button type="button" onClick={clearFile} aria-label="Remove file">&times;</button>
                </div>
              )}
              {error && <p className="upload-error">{error}</p>}
            </div>
          </section>
        </div>

        <div className="results-wrap">
          <ResultsPanel
            status={status}
            statusMessage={statusMessage}
            result={result}
            ocrLowConfidence={ocrLowConfidence}
            translationFailed={translationFailed}
          />
        </div>
      </main>

      <footer className="footer">
        <span className="footer-pill">
          <ShieldCheckIcon style={{ width: 18, height: 18 }} />
          Your data is secure. We do not store your documents.
        </span>
        <p className="footer-note">
          Your contract is processed only to generate this screening and is never saved or shared.
        </p>
      </footer>
    </div>
  )
}