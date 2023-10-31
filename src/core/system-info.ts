import bowser from 'bowser';

const info = bowser.getParser(navigator.userAgent);
export const isMacOs = info.getOSName() === 'macOS';
