// src/translate/translate.js

export async function translateText(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) return text;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.responseData.translatedText;
  } catch (err) {
    console.error('Translation error:', err);
    return null;
  }
}