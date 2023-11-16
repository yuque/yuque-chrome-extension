import React, { useState, useEffect, useRef } from 'react';
import Icon from '@ant-design/icons';
import classnames from 'classnames';
import { Button, Radio } from 'antd';
import CloseCircle from '@/assets/svg/close-circle.svg';
import YuqueLogoSve from '@/assets/svg/yuque-logo.svg';
import { backgroundBridge } from '@/core/bridge/background';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { ILevitateConfig } from '@/isomorphic/constant/levitate';
import {
  LevitateBallMessageActions,
  LevitateBallMessageKey,
} from '@/isomorphic/event/levitateBall';
import LinkHelper from '@/isomorphic/link-helper';
import { useInjectContent } from '../components/InjectLayout';
import styles from './app.module.less';

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
        const iconLink =
          document.querySelector("link[rel*='icon']") ||
          document.querySelector("link[rel*='Icon']");
        const iconUrl = (iconLink as HTMLLinkElement)?.href;
        backgroundBridge.configManager.update('levitate', 'disableUrl', [
          ...config.disableUrl,
          {
            origin: url,
            icon: iconUrl,
          },
        ]);
        break;
      }
      case 'disableForever': {
        backgroundBridge.configManager.update('levitate', 'enable', false, {
          notice: true,
        });
        break;
      }
      default:
        break;
    }
    window._yuque_ext_app.removeLevitateBall();
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
            <Radio value={'disableOnce'}>
              {__i18n('在本次访问关闭')}
            </Radio>
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
            {__i18n('开启')}
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
    backgroundBridge.configManager.update(
      'levitate',
      'position',
      positionRef.current.top,
    );
  };

  useEffect(() => {
    backgroundBridge.user.getUserShortCut().then(res => {
      setShortKey(res.openSidePanel || '');
    });
    backgroundBridge.configManager
      .get('levitate')
      .then((res: ILevitateConfig) => {
        setConfig(res);
        positionRef.current.top = parseInt(res.position);
      });
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent<any>) => {
      const { key, action, data } = e.data || {};
      if (key !== LevitateBallMessageKey) {
        return;
      }
      switch (action) {
        case LevitateBallMessageActions.levitateBallConfigUpdate: {
          data && setConfig(data);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
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
          <Icon
            component={CloseCircle}
            className={styles.closeIcon}
            onClick={onCloseLevitateBall}
          />
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
              window._yuque_ext_app.showSidePanel();
            }
            entryStartActionRef.current = '';
          }}
          onMouseEnter={() => {
            setIsHover(true);
          }}
        >
          <div className={styles.ballWrapper}>
            <Icon component={YuqueLogoSve} className={styles.logo} />
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
