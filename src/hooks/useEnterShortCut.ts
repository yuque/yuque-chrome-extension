import { useEffect } from 'react';
import keymaster from 'keymaster';

interface IUseShortcutProps {
  onOk: () => void;
  onCancel: () => void;
  okKey?: string;
  cancelKey?: string;
}

export function useEnterShortcut(props: IUseShortcutProps) {
  const { okKey = 'enter', cancelKey = 'esc' } = props;

  useEffect(() => {
    const onOk = (e: KeyboardEvent) => {
      e.preventDefault();
      props.onOk();
    };
    keymaster(okKey, onOk);
    return () => keymaster.unbind(okKey);
  }, [props.onOk, okKey]);

  useEffect(() => {
    const onCancel = (e: KeyboardEvent) => {
      e.preventDefault();
      props.onCancel();
    };
    keymaster(cancelKey, onCancel);
    return () => keymaster.unbind(cancelKey);
  }, [props.onCancel, cancelKey]);
}
