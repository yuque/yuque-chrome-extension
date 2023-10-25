import { useState, useEffect } from 'react';
import { IShortcutMap } from '@/isomorphic/interface';
import { backgroundBridge } from '@/core/bridge/background';

function useClipShortCut() {
  const [shortcutMap, setShortcutMap] = useState<IShortcutMap>({});

  useEffect(() => {
    const refreshShortCut = () => {
      backgroundBridge.user.getUserShortCut().then(res => {
        setShortcutMap(res);
      });
    };
    const onVisibilitychange = () => {
      if (document.hidden) {
        return;
      }
      refreshShortCut();
    };
    refreshShortCut();
    document.addEventListener('visibilitychange', onVisibilitychange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilitychange);
    };
  }, []);

  return shortcutMap;
}

export default useClipShortCut;
