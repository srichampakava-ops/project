import { useState } from 'react';
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
      <div className="top-bar">
        <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L8 10v10c0 11 6.7 18.5 16 24 9.3-5.5 16-13 16-24V10L24 4z"
                stroke="#4A5636" strokeWidth="2.2" strokeLinejoin="round" fill="#FBF9F3" />
          <path d="M16 24l2 6 4-9M22 22h9M22 27h6" stroke="#4A5636" strokeWidth="2" strokeLinecap="round" />
          <circle cx="34" cy="14" r="4.5" fill="#E9A23B" />
        </svg>
        <div>
          <div className="top-bar-title">SafeContract</div>
          <div className="top-bar-sub">Contract review for a safer workforce</div>
        </div>
      </div>

      <div className="page-heading">
        <h1>Worker Contract Scanner</h1>
        <p>Upload a contract and check it for common labor rights risks</p>
      </div>

        <div className="step-grid">
          <div className="step-card">
           <div className="step-number">1</div>
           <div className="step-icon">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#435030" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z" strokeLinecap="round" />
             </svg>
           </div>
           <h3>Contract Language</h3>
           <p className="step-desc">Select the language of the contract</p>
           <div className="select-wrap">
            <select value={contractLang} onChange={(e) => setContractLang(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
           </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#435030" strokeWidth="1.8">
              <path d="M7 3h7l5 5v13H7z" strokeLinejoin="round" /><path d="M14 3v5h5M9 13h6M9 17h6" strokeLinecap="round" />
             </svg>
           </div>
           <h3>Output Language</h3>
           <p className="step-desc">Select the language for results</p>
           <div className="select-wrap">
            <select value={workerLang} onChange={(e) => setWorkerLang(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
           </div>
          </div>

         <div className="step-card">
           <div className="step-number">3</div>
           <div className="step-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#435030" strokeWidth="1.8">
              <path d="M12 3v12M7 8l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Upload Contract</h3>
          <p className="step-desc">Upload your contract as a photo</p>
          <label className="dropzone">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {image ? (
              <img src={image} alt="uploaded contract" />
            ) : (
              <>
                <div style={{ fontSize: '28px' }}>📁</div>
                <div className="dropzone-text">Tap to choose a file</div>
              </>
            )}
            <span className="dropzone-btn">Choose File</span>
          </label>
          <div className="dropzone-note">Supported: JPG, PNG · Max 20MB</div>
        </div>
      </div>

      <div className="results-panel">
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
          <div style={{ marginTop: '16px' }}>
            <p className="warnings-title">⚠️ Warnings found</p>
            <ul>
              {warnings.map((w) => <li key={w.id}>{w.displayTitle}</li>)}
            </ul>
          </div>
        )}

        {!loading && originalText && warnings.length === 0 && (
          <p className="success-text" style={{ marginTop: '16px' }}>✅ No red flags detected in this scan</p>
        )}

        {!loading && originalText && (
          <div className="disclaimer">
            ⚠️ This is an automated screening tool, not legal advice. It checks for a specific list of common risks and may not catch every unfair term. Works best with clear, printed, single-page contracts. If any warning appears — or even if none do — please show this contract to someone you trust or a legal aid worker before signing.
          </div>
        )}
        
        {!loading && !originalText && (
          <div className="results-placeholder">
            <div className="icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7A4F" strokeWidth="1.8">
                <circle cx="10" cy="10" r="6" /><path d="M20 20l-4.5-4.5" strokeLinecap="round" />
              </svg>
            </div>
            <h4>Analysis Results Will Appear Here</h4>
            <p>Upload a contract to scan for potential issues</p>
          </div>
        )}
      </div>

      <div className="footer-note">
        🔒 Your document stays on this device. Only extracted text is sent to translation services for language conversion.
      </div>
    </div>
  );
}

export default App;