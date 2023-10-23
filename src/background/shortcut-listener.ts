import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';

export function listenShortcut() {
  Chrome.commands.onCommand.addListener(command => {
    switch (command) {
      case 'openSidePanel': {
        Chrome.sendMessageToCurrentTab({
          action: ContentScriptEvents.ToggleSidePanel,
        });
        break;
      }
      case 'selectArea': {
        Chrome.sendMessageToCurrentTab({
          action: ContentScriptEvents.SelectArea,
          data: {
            formShortcut: true,
          },
        });
        break;
      }
      case 'startOcr': {
        Chrome.sendMessageToCurrentTab({
          action: ContentScriptEvents.ScreenOcr,
          data: {
            formShortcut: true,
          },
        });
        break;
      }
      case 'collectLink': {
        Chrome.sendMessageToCurrentTab({
          action: ContentScriptEvents.CollectLink,
        });
        break;
      }
      default:
        break;
    }
  });
}
