// src/translate/translate.js

async function tryGoogleTranslate(text, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Google translate failed: ${response.status}`);
  const data = await response.json();
  return data[0].map((chunk) => chunk[0]).join('');
}

async function tryMyMemory(text, sourceLang, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`MyMemory failed: ${response.status}`);
  const data = await response.json();
  return data.responseData.translatedText;
}

export async function translateText(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) return text;

  try {
    return await tryGoogleTranslate(text, sourceLang, targetLang);
  } catch (err) {
    console.warn('Google translate failed, falling back to MyMemory:', err);
    try {
      return await tryMyMemory(text, sourceLang, targetLang);
    } catch (err2) {
      console.error('All translation services failed:', err2);
      return null;
    }
  }
}