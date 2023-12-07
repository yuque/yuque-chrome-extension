import LinkHelper from '@/isomorphic/link-helper';
import { STORAGE_KEYS, YUQUE_DOMAIN } from '@/config';
import { initI18N } from '@/isomorphic/i18n';
import { listenBrowserActionEvent } from './browser-action';
import { createContextMenu, listenContextMenuEvents } from './context-menu';
import { initBackGroundActionListener } from './actionListener';
import { listenShortcut } from './shortcut-listener';
import { storage } from '@/isomorphic/storage';

console.log('-- in background.js');

initI18N();
listenContextMenuEvents();
listenBrowserActionEvent();
initBackGroundActionListener();
listenShortcut();

chrome.runtime.onInstalled.addListener(async details => {
  console.log('-- runtime installed');

  if (details.reason === 'install') {
    chrome.tabs.create({
      url: LinkHelper.introduceExtension,
    });
  }

  /**
   * 由于插件采用了 iframe 嵌入插件的页面，当插件更新时
   * 如果页面中依旧存在 iframe 会导致后台服务刷新异常
   * 所以在系统刷新时，去给每个 tab 执行一段脚本去除掉插件注入的 iframe
   * 然后重新执行一次刷新去解决这类问题
   */
  if (details.reason === 'update') {
    const lastForceUpdateTime = await storage.get(
      STORAGE_KEYS.SYSTEM.LAST_BACKGROUND_UPDATE,
    );
    if (
      lastForceUpdateTime &&
      new Date().getTime() - lastForceUpdateTime < 4000
    ) {
      return;
    }
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const element = document.querySelector(
                '#yuque-extension-root-container',
              );
              element?.remove();
            },
          });
        } catch (e) {
          //
        }
      }
    }
    await storage.update(
      STORAGE_KEYS.SYSTEM.LAST_BACKGROUND_UPDATE,
      new Date().getTime(),
    );
    chrome.runtime.reload();
  }
  createContextMenu();
  updateDynamicRules();
});

chrome.runtime.setUninstallURL(LinkHelper.unInstallFeedback);

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

  chrome.declarativeNetRequest.getDynamicRules(previousRules => {
    const previousRuleIds = previousRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: previousRuleIds,
      addRules: rules,
    });
  });
}
