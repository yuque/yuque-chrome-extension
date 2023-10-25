import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { Button, Popover } from 'antd';
import useClickAway from '@/hooks/useClickAway';
import { __i18n } from '@/isomorphic/i18n';
import TagMenu, { ITagMenuProps } from './TagMenu';
import styles from './index.module.less';

type IAddTagButtonProps = ITagMenuProps;

function AddTagButton(props: IAddTagButtonProps) {
  const { tags, selectTags, updateSelectTags, updateTags } = props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickAway(ref, event => {
    if ((event.target as Element)?.closest('.add-tag-button')) {
      return;
    }
    setOpen(false);
  });

  useEffect(() => {
    const onBlur = () => {
      setOpen(false);
    };
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <Popover
      overlayClassName={styles.overlayClassName}
      open={open}
      content={
        <div className={styles.popoverWrapper} ref={ref}>
          <div className={styles.containerWrapper}>
            <TagMenu
              tags={tags}
              selectTags={selectTags}
              updateSelectTags={updateSelectTags}
              updateTags={updateTags}
            />
          </div>
        </div>
      }
      trigger="click"
      arrow={false}
    >
      <Button
        className={classnames('add-tag-button', styles.button)}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {__i18n('添加标签')}
      </Button>
    </Popover>
  );
}

export default React.memo(AddTagButton);
