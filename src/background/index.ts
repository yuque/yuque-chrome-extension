import LinkHelper from '@/isomorphic/link-helper';
import { STORAGE_KEYS, YUQUE_DOMAIN } from '@/config';
import { initI18N } from '@/isomorphic/i18n';
import { storage } from '@/isomorphic/storage';
import { getMsgId } from '@/isomorphic/util';
import { ExtensionMessageListener } from '@/isomorphic/extensionMessage/interface';
import { PageEventTypes } from '@/isomorphic/event/pageEvent';
import { listenBrowserActionEvent } from './browser-action';
import { createContextMenu, listenContextMenuEvents } from './context-menu';
import { initBackGroundActionListener } from './actionListener';
import { listenShortcut } from './shortcut-listener';
import chromeExtension from './core/chromeExtension';
import HttpClient from './core/httpClient';

const httpClient = new HttpClient();
initI18N();
listenContextMenuEvents();
listenBrowserActionEvent();
initBackGroundActionListener(httpClient);
listenShortcut();

chromeExtension.runtime.onInstalled.addListener(async details => {
  console.log('-- runtime installed');

  createContextMenu();
  updateDynamicRules();
  updateYuqueCookieRule();

  if (details.reason === 'install') {
    chromeExtension.tabs.create({
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
    const lastForceUpdateTime = await storage.get(STORAGE_KEYS.SYSTEM.LAST_BACKGROUND_UPDATE);
    if (lastForceUpdateTime && new Date().getTime() - lastForceUpdateTime < 4000) {
      return;
    }
    const tabs = await chromeExtension.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chromeExtension.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const element = document.querySelector('#yuque-extension-root-container');
              element?.remove();
            },
          });
        } catch (e) {
          //
        }
      }
    }
    await storage.update(STORAGE_KEYS.SYSTEM.LAST_BACKGROUND_UPDATE, new Date().getTime());
    chromeExtension.runtime.reload();
  }
});

chromeExtension.runtime.setUninstallURL(LinkHelper.unInstallFeedback);

// 监听 storage 的变化，必要时通知页面
chromeExtension.storage.local.onChanged.addListener(res => {
  const noticeStorageKey = [
    STORAGE_KEYS.SETTINGS.CLIP_CONFIG,
    STORAGE_KEYS.SETTINGS.LEVITATE_BALL_CONFIG,
    STORAGE_KEYS.SETTINGS.SIDE_PANEL_CONFIG,
    STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG,
    // 用户信息发生变化
    STORAGE_KEYS.CURRENT_ACCOUNT,
  ];

  Object.keys(res).forEach(key => {
    if (noticeStorageKey.includes(key)) {
      const params = {
        type: ExtensionMessageListener.pageEvent,
        data: {
          type: PageEventTypes.StorageUpdate,
          data: {
            key,
            value: res[key].newValue,
          },
        },
        id: getMsgId({ type: ExtensionMessageListener.pageEvent }),
      };
      chromeExtension.tabs.sendMessageToAllTab(params);
    }
  });
});

function updateDynamicRules() {
  chromeExtension.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        action: {
          type: chromeExtension.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: 'Referer',
              operation: chromeExtension.declarativeNetRequest.HeaderOperation.SET,
              value: YUQUE_DOMAIN,
            },
            {
              header: 'Origin',
              operation: chromeExtension.declarativeNetRequest.HeaderOperation.SET,
              value: YUQUE_DOMAIN,
            },
          ],
        },
        condition: {
          domains: [chromeExtension.runtime.id],
          urlFilter: `${YUQUE_DOMAIN}/api/upload/attach`,
          resourceTypes: [chromeExtension.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
        },
      },
    ],
  });
}

const updateYuqueCookieRule = async () => {
  // 通用 cookie
  const normalCookie = await chromeExtension.cookies.getAll({ url: YUQUE_DOMAIN });
  // 分区 cookie
  const partitionCookie = await chromeExtension.cookies.getAll({ partitionKey: { topLevelSite: 'https://yuque.com' } });
  const cookieArray = normalCookie.concat(partitionCookie || []).map(item => {
    return `${item.name}=${item.value}`;
  });
  chromeExtension.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2],
    addRules: [
      {
        id: 2,
        action: {
          type: chromeExtension.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
          requestHeaders: [
            {
              header: 'Cookie',
              operation: chromeExtension.declarativeNetRequest.HeaderOperation.SET,
              value: cookieArray.join(';'),
            },
          ],
        },
        condition: {
          domains: [chromeExtension.runtime.id],
          urlFilter: `${YUQUE_DOMAIN}`,
          resourceTypes: [chromeExtension.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
        },
      },
    ],
  });
};

chromeExtension.cookies.onChanged.addListener(async res => {
  if (!res.cookie.domain.includes('yuque.com') || res.removed) {
    return;
  }
  updateYuqueCookieRule();
});
