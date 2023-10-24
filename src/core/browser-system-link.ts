import bowser from 'bowser';

const name =  bowser.getParser(navigator.userAgent).getBrowserName();
const isEdge = name === 'Microsoft Edge';

const ChromeSystemLink = {
  cookieSetting: 'chrome://settings/cookies',
  shortCut: 'chrome://extensions/shortcuts',
}

const EdgeSystemLink = {
  cookieSetting: 'edge://settings/content',
  shortCut: 'edge://extensions/shortcuts',
}

function findSystemLink() {
  if (isEdge) {
    return EdgeSystemLink;
  }
  return ChromeSystemLink;
}

export const browserSystemLink = findSystemLink();
