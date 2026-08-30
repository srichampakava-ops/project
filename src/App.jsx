import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { runDefiniteFlags } from './riskEngine/definiteFlags';
import { runRulesEngine } from './riskEngine/rulesEngine';
import { translateText } from './translate/translate';

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setWarnings([]);
    setTranslationFailed(false);
    setOcrLowConfidence(false);
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

    const avgConfidence = ocrResult.data.confidence;
    setOcrLowConfidence(avgConfidence < 70);

    setStatus('Translating to English for analysis...');
    const englishVersion = await translateText(extractedText, contractLang, 'en');

    let textForRules = englishVersion;
    let mainTranslationFailed = false;
    if (!englishVersion) {
      mainTranslationFailed = true;
      textForRules = extractedText; // fallback: still try rules on original text
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
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <path d="M12 2L4 5v6c0 5.5 3.5 9.5 8 11 4.5-1.5 8-5.5 8-11V5l-8-3z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Contract is written in: </label>
        <select value={contractLang} onChange={(e) => setContractLang(e.target.value)}>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Show warnings in: </label>
        <select value={workerLang} onChange={(e) => setWorkerLang(e.target.value)}>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} />

      {image && <img src={image} alt="contract" style={{ maxWidth: '100%', marginTop: '15px' }} />}

      {loading && <p>{status}</p>}

      {ocrLowConfidence && (
        <p style={{ color: 'orange' }}>⚠️ The photo text wasn't very clear — results below may be less accurate. Consider retaking the photo with better lighting and a flatter angle.</p>
      )}

      {translationFailed && (
        <p style={{ color: 'orange' }}>⚠️ Translation service unavailable — some results use original text and may be less accurate.</p>
      )}

      {!loading && warnings.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>⚠️ Warnings found:</h3>
          <ul>
            {warnings.map((w) => <li key={w.id}>{w.displayTitle}</li>)}
          </ul>
        </div>
      )}

      {!loading && originalText && (
        <div style={{ marginTop: '20px', padding: '12px', background: '#fff8e1', border: '1px solid #ffca28', borderRadius: '6px', fontSize: '14px', color: '#5f4a00' }}>
           ⚠️ This is an automated screening tool, not legal advice. It checks for a specific list of common risks and may not catch every unfair term. Works best with clear, printed, single-page contracts. If any warning appears — or even if none do — please show this contract to someone you trust or a legal aid worker before signing.
        </div>
      )}

      {!loading && originalText && warnings.length === 0 && (
        <p style={{ marginTop: '20px', color: 'green' }}>✅ No red flags detected in this scan.</p>
      )}
    </div>
  );
}

export default App;