import { useEffect } from 'react';
import { SELECT_TYPE_SELECTION } from '../constants/select-types';
import { SandBoxMessageKey, SandBoxMessageType } from '@/isomorphic/sandbox';

/**
 * [业务] 插件快捷键
 * @param currentType 当前选择 type，只有为 null 时快捷键才会生效
 * @param enabled 是否启用快捷键
 * @param onTrigger 快捷键触发后的动作
 * @return
 */
const useShortCut = (
  currentType: string | null,
  onTrigger: (currentType: string) => void,
) => {
  // 绑定从 content-script 发送过来的快捷键触发消息
  useEffect(() => {
    const listener = async (e: MessageEvent<any>) => {
      if (e.data?.key !== SandBoxMessageKey) {
        return;
      }
      const { action, data } = e.data || {};
      switch (action) {
        case SandBoxMessageType.tryStartSelect: {
          if ((currentType === null || currentType === SELECT_TYPE_SELECTION)) {
            onTrigger?.(data?.type);
          }
          break;
        }
        default: {
          break;
        }
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [ onTrigger, currentType ]);
};

export default useShortCut;
