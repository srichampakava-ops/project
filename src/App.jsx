 import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { runDefiniteFlags } from './riskEngine/definiteFlags';
import { runRulesEngine } from './riskEngine/rulesEngine';
import { translateText } from './translate/translate';
import './App.css';

const LANGUAGES = [
  { code: 'en', tesseractCode: 'eng', label: 'English' },
  { code: 'hi', tesseractCode: 'hin', label: 'Hindi' },
  { code: 'ta', tesseractCode: 'tam', label: 'Tamil' },
  { code: 'bn', tesseractCode: 'ben', label: 'Bengali' },
  { code: 'te', tesseractCode: 'tel', label: 'Telugu' },
];

function App() {
  const [contractLang, setContractLang] = useState('en');
  const [workerLang, setWorkerLang] = useState('en');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [translationFailed, setTranslationFailed] = useState(false);
  const [ocrLowConfidence, setOcrLowConfidence] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setWarnings([]);
    setTranslationFailed(false);
    setOcrLowConfidence(false);
    setShowOriginal(false);
    setLoading(true);

    const contractLangObj = LANGUAGES.find((l) => l.code === contractLang);

    setStatus('Reading text from photo...');
    const ocrResult = await Tesseract.recognize(file, contractLangObj.tesseractCode, {
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setStatus(`Reading text... ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    const extractedText = ocrResult.data.text;
    setOriginalText(extractedText);
    setOcrLowConfidence(ocrResult.data.confidence < 70);

    setStatus('Translating to English for analysis...');
    const englishVersion = await translateText(extractedText, contractLang, 'en');

    let textForRules = englishVersion;
    let mainTranslationFailed = false;
    if (!englishVersion) {
      mainTranslationFailed = true;
      textForRules = extractedText;
    }
    setEnglishText(textForRules);

    setStatus('Checking for risks...');
    const layer1 = runRulesEngine(textForRules);
    const layer2 = runDefiniteFlags(extractedText + ' ' + (englishVersion || ''));

    const allWarnings = [...layer2, ...layer1.filter(
      (w1) => !layer2.some((w2) => w2.id === w1.id)
    )];

    setStatus('Translating warnings to your language...');
    let anyWarningTranslationFailed = false;
    const translatedWarnings = await Promise.all(
      allWarnings.map(async (w) => {
        const translatedTitle = await translateText(w.title, 'en', workerLang);
        if (!translatedTitle) anyWarningTranslationFailed = true;
        return { ...w, displayTitle: translatedTitle || w.title };
      })
    );

    setTranslationFailed(mainTranslationFailed || anyWarningTranslationFailed);
    setWarnings(translatedWarnings);
    setLoading(false);
    setStatus('');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <svg className="app-logo" width="52" height="52" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L8 10v10c0 11 6.7 18.5 16 24 9.3-5.5 16-13 16-24V10L24 4z"
                stroke="#1D3557" strokeWidth="2.2" strokeLinejoin="round" fill="#F7F8FA" />
          <path d="M16 24l2 6 4-9M22 22h9M22 27h6" stroke="#1D3557" strokeWidth="2" strokeLinecap="round" />
          <circle cx="34" cy="14" r="4.5" fill="#E9A23B" />
        </svg>
        <div className="app-tagline">Contract Risk Scanner</div>
        <div className="app-subtagline">Scan a work contract to check for common risks</div>
      </header>

      <div className="lang-row">
        <div className="lang-field">
          <label>Contract language</label>
          <select value={contractLang} onChange={(e) => setContractLang(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <div className="lang-field">
          <label>Show results in</label>
          <select value={workerLang} onChange={(e) => setWorkerLang(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="scan-frame" onClick={() => fileInputRef.current.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        {image ? (
          <img src={image} alt="scanned contract" />
        ) : (
          <div className="scan-frame-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9D3E0" strokeWidth="1.6">
              <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3.5" />
            </svg>
            <span>Tap to photograph or upload a contract</span>
          </div>
        )}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
        {loading && <div className="scan-line" />}
      </div>

      {loading && <div className="status-text">{status}</div>}

      {ocrLowConfidence && (
        <div className="alert alert-orange">
          ⚠️ The photo text wasn't very clear — results may be less accurate. Try retaking the photo with better lighting and a flatter angle.
        </div>
      )}

      {translationFailed && (
        <div className="alert alert-orange">
          ⚠️ Translation service unavailable — some results use original text and may be less accurate.
        </div>
      )}

      {!loading && originalText && (
        <>
          <button className="toggle-btn" onClick={() => setShowOriginal(!showOriginal)}>
            {showOriginal ? 'Hide' : 'Show'} original text & translation
          </button>
          {showOriginal && (
            <div className="original-block">
              <div>
                <h4>Original (as scanned)</h4>
                <pre>{originalText}</pre>
              </div>
              <div>
                <h4>Translated to English</h4>
                <pre>{englishText}</pre>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && warnings.length > 0 && (
        <div className="results-card">
          <p className="results-title">⚠️ Warnings found</p>
          <ul>
            {warnings.map((w) => <li key={w.id}>{w.displayTitle}</li>)}
          </ul>
        </div>
      )}

      {!loading && originalText && warnings.length === 0 && (
        <div className="success-card">✅ No red flags detected in this scan</div>
      )}

      {!loading && originalText && (
        <div className="disclaimer">
          ⚠️ This is an automated screening tool, not legal advice. It checks for a specific list of common risks and may not catch every unfair term. Works best with clear, printed, single-page contracts. If any warning appears — or even if none do — please show this contract to someone you trust or a legal aid worker before signing.
        </div>
      )}
    </div>
  );
}

export default App;