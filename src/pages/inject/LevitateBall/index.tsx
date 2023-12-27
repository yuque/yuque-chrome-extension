import React, { useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { Button, Radio } from 'antd';
import { backgroundBridge } from '@/core/bridge/background';
import { ILevitateConfig, levitateConfigManager } from '@/core/configManager/levitate';
import LarkIcon from '@/components/LarkIcon';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import LinkHelper from '@/isomorphic/link-helper';
import { useInjectContent } from '../components/InjectLayout';
import styles from './index.module.less';

type DisableType = 'disableUrl' | 'disableOnce' | 'disableForever';

const url = `${window.location.origin}${window.location.pathname}`;

function App() {
  const [config, setConfig] = useState({} as ILevitateConfig);
  const [isHover, setIsHover] = useState(false);
  const [shortKey, setShortKey] = useState('');
  const [dragging, setDragging] = useState(false);
  const { forceUpdate } = useForceUpdate();
  const entryStartActionRef = useRef<'click' | 'drag' | ''>('');
  const entryStartActionStratYRef = useRef(0);
  const positionRef = useRef({
    top: 0,
  });
  const { Modal } = useInjectContent();

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragging || !event.clientY) return;
    positionRef.current.top = event.clientY;
    forceUpdate();
  };

  const disableLevitateBall = (type: DisableType) => {
    switch (type) {
      case 'disableOnce': {
        break;
      }
      case 'disableUrl': {
        const iconLink = document.querySelector("link[rel*='icon']") || document.querySelector("link[rel*='Icon']");
        const iconUrl = (iconLink as HTMLLinkElement)?.href;
        levitateConfigManager.update('disableUrl', [
          ...config.disableUrl,
          {
            origin: url,
            icon: iconUrl,
          },
        ]);
        break;
      }
      case 'disableForever': {
        levitateConfigManager.update('enable', false);
        break;
      }
      default:
        break;
    }
    setConfig(preConfig => ({
      ...preConfig,
      enable: false,
    }));
  };

  const onCloseLevitateBall = () => {
    let disableType: DisableType = 'disableOnce';
    const modal = Modal.confirm({});
    modal.update({
      content: (
        <>
          <Radio.Group
            className={styles.radioGroup}
            defaultValue={disableType}
            onChange={e => {
              disableType = e.target.value;
            }}
          >
            <Radio value={'disableOnce'}>{__i18n('在本次访问关闭')}</Radio>
            <Radio value={'disableUrl'}>{__i18n('在本页关闭')}</Radio>
            <Radio value={'disableForever'}>{__i18n('全部关闭')}</Radio>
          </Radio.Group>
          <div className={styles.linkWrapper}>
            {__i18n('可在')}
            <div
              className={styles.link}
              onClick={() => {
                backgroundBridge.tab.create(LinkHelper.sidePanelSettingPage);
              }}
            >
              {__i18n('设置')}
            </div>
            {__i18n('中开启')}
          </div>
        </>
      ),
      prefixCls: 'yuque-chrome-extension',
      closable: true,
      title: __i18n('关闭悬浮气泡'),
      centered: true,
      wrapClassName: styles.disableModal,
      maskClosable: true,
      footer: (
        <>
          <div className={styles.disableModalFooter}>
            <Button className={styles.button} onClick={modal.destroy}>
              {__i18n('取消')}
            </Button>
            <Button
              className={classnames(styles.button, styles.sure)}
              type="primary"
              onClick={() => {
                disableLevitateBall(disableType);
                modal.destroy();
              }}
            >
              {__i18n('确定')}
            </Button>
          </div>
        </>
      ),
    });
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    positionRef.current.top = event.clientY;
    setDragging(false);
    entryStartActionRef.current = '';
    levitateConfigManager.update('position', `${positionRef.current.top}`);
  };

  useEffect(() => {
    backgroundBridge.user.getUserShortCut().then(res => {
      setShortKey(res.openSidePanel || '');
    });
    levitateConfigManager.get().then(res => {
      setConfig(res);
      positionRef.current.top = parseInt(res.position);
    });
  }, []);

  useEffect(() => {
    const removerListener = levitateConfigManager.addListener(data => {
      if (data) {
        setConfig(data as ILevitateConfig);
      }
    });
    return () => {
      removerListener();
    };
  }, []);

  if (!config.enable || config.disableUrl.find(item => item.origin === url)) {
    return null;
  }

  return (
    <>
      <div
        className={classnames(styles.wrapper, {
          [styles.wrapperHover]: dragging || isHover,
        })}
        style={{ top: `${positionRef.current.top}px` }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
      >
        <div className={styles.closeWrapper}>
          <LarkIcon className={styles.closeIcon} onClick={onCloseLevitateBall} name="close-circle" />
        </div>
        <div
          className={styles.ballEntry}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            entryStartActionStratYRef.current = e.clientY;
            entryStartActionRef.current = 'click';
          }}
          onMouseMove={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (!entryStartActionRef.current) {
              return;
            }
            const isClick = Math.abs(entryStartActionStratYRef.current - e.clientY) < 4;
            if (isClick) {
              return;
            }
            entryStartActionRef.current = 'drag';
            setDragging(true);
          }}
          onMouseUp={() => {
            if (entryStartActionRef.current === 'click') {
              window._yuque_ext_app.toggleSidePanel(true);
            }
            entryStartActionRef.current = '';
          }}
          onMouseEnter={() => {
            setIsHover(true);
          }}
        >
          <div className={styles.ballWrapper}>
            <LarkIcon name="yuque-logo" className={styles.logo} size={24} />
            <div className={styles.hiddenWrapper}>{shortKey}</div>
          </div>
        </div>
      </div>
      {dragging && (
        <div
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          className={styles.dragBarMask}
          onMouseLeave={() => {
            setDragging(false);
            entryStartActionRef.current = '';
          }}
        />
      )}
    </>
  );
}

export default App;
