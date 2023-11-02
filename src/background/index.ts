import Chrome from '@/background/core/chrome';
import LinkHelper from '@/isomorphic/link-helper';
import { YUQUE_DOMAIN } from '@/config';
import { initI18N } from '@/isomorphic/i18n';
import { listenBrowserActionEvent } from './browser-action';
import { createContextMenu, listenContextMenuEvents } from './context-menu';
import { initBackGroundActionListener } from './actionListener';
import { listenShortcut } from './shortcut-listener';

console.log('-- in background.js');

initI18N();
listenContextMenuEvents();
listenBrowserActionEvent();
initBackGroundActionListener();
listenShortcut();

Chrome.runtime.onInstalled.addListener(async details => {
  console.log('-- runtime installed');

  if (details.reason === 'install') {
    Chrome.tabs.create({
      url: LinkHelper.introduceExtension,
    });
  }

  createContextMenu();
  updateDynamicRules();
});

Chrome.runtime.setUninstallURL(LinkHelper.unInstallFeedback);

function updateDynamicRules() {
  const rules = [
    {
      id: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          {
            header: 'Referer',
            operation: chrome.declarativeNetRequest.HeaderOperation.SET,
            value: YUQUE_DOMAIN,
          },
          {
            header: 'Origin',
            operation: chrome.declarativeNetRequest.HeaderOperation.SET,
            value: YUQUE_DOMAIN,
          },
        ],
      },
      condition: {
        domains: [chrome.runtime.id],
        urlFilter: `${YUQUE_DOMAIN}/api/upload/attach`,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        ],
      },
    },
  ];

  Chrome.declarativeNetRequest.getDynamicRules(previousRules => {
    const previousRuleIds = previousRules.map(rule => rule.id);
    Chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: previousRuleIds,
      addRules: rules,
    });
  });
}
