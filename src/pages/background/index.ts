import Chrome from '@/core/chrome';
import { YUQUE_DOMAIN } from '@/config';
import { initI18N } from '@/isomorphic/i18n';
import { listenBrowserActionEvent } from './browser-action';
import { createContextMenu, listenContextMenuEvents } from './context-menu';
import { initBackGroundActionListener } from './action-listener';
import { applyExtCommands } from './commands';

console.log('-- in background.js');

initI18N();
listenContextMenuEvents();
listenBrowserActionEvent();
initBackGroundActionListener();
applyExtCommands();

Chrome.runtime.onInstalled.addListener(async () => {
  console.log('-- runtime installed');

  createContextMenu();
  updateDynamicRules();
});

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
        domains: [
          chrome.runtime.id,
        ],
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
