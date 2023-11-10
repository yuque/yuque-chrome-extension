import bowser from 'bowser';

const uaParser = bowser.getParser(navigator.userAgent);

const name = uaParser.getBrowserName();
export const isEdge = name === 'Microsoft Edge';

export const isWindow = uaParser.getOSName() !== 'macOS';
const ChromeSystemLink = {
  cookieSetting: 'chrome://settings/cookies',
  shortCut: 'chrome://extensions/shortcuts',
};

const EdgeSystemLink = {
  cookieSetting: 'edge://settings/content',
  shortCut: 'edge://extensions/shortcuts',
};

function findSystemLink() {
  if (isEdge) {
    return EdgeSystemLink;
  }
  return ChromeSystemLink;
}

export const browserSystemLink = findSystemLink();
