import bowser from 'bowser';

export function findCookieSettingPage() {
  const name = bowser.getParser(navigator.userAgent).getBrowserName();
  if (name === 'Chrome') {
    return 'chrome://settings/cookies';
  }

  if (name === 'Microsoft Edge') {
    return 'edge://settings/content';
  }
  return '';
}
export const isRunningInjectPage =
  typeof window !== 'undefined' && typeof window;
