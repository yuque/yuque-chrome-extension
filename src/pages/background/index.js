import Chrome from '@/core/chrome';
import { YUQUE_DOMAIN } from '@/config';
import { initI18N } from '@/isomorphic/i18n';
import { listenBrowserActionEvent } from './browser-action';
import { createContextMenu, listenContextMenuEvents } from './context-menu.ts';

console.log('-- in background.js');

initI18N();
listenContextMenuEvents();
listenBrowserActionEvent();

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
        type: 'modifyHeaders',
        requestHeaders: [
          {
            header: 'Referer',
            operation: 'set',
            value: YUQUE_DOMAIN,
          },
          {
            header: 'Origin',
            operation: 'set',
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
          'xmlhttprequest',
        ],
      },
    },
  ];

  Chrome.declarativeNetRequest.getDynamicRules((previousRules) => {
    const previousRuleIds = previousRules.map((rule) => rule.id);
    Chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: previousRuleIds,
      addRules: rules,
    });
  });
}
