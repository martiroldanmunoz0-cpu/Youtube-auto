// Idioma de los textos fijos que dibuja el motor (el del canal: timeline.lang). T('español', 'English').
export const LANG = { code: 'es' };
export const T = (es, en) => (LANG.code === 'en' ? en : es);
