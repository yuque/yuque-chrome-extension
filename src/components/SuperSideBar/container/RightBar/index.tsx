import React, { useState, useEffect } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { Popover, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import cs from 'classnames';
import { AssistantType, IAssistant } from '@/components/SuperSideBar/declare';
import useMeasure from '@/hooks/useMeasure';
import { superSidebar } from '@/components/SuperSideBar';
import LarkIcon from '@/components/LarkIcon';
import styles from './index.module.less';

interface IItemProps {
  assistant: IAssistant;
}

export const BarItem = ({ assistant }: IItemProps) => {
  const { label, icon, id } = assistant;
  const { currentAssistant } = superSidebar;
  const isSelected = id === currentAssistant?.id;

  return (
    <Tooltip title={label} placement="left">
      <div
        onClick={() => {
          if (!isSelected) {
            superSidebar.switchAssistant(id);
          }
        }}
        className={cs(styles.manifestsBtn, {
          [styles.manifestsBtnActive]: isSelected,
        })}
      >
        <Icon component={icon as any} />
      </div>
    </Tooltip>
  );
};

export const MenuItem = ({ assistant }: IItemProps) => {
  const { label, icon, id } = assistant;
  const { currentAssistant } = superSidebar;
  const isSelected = id === currentAssistant?.id;

  return (
    <div
      onClick={() => {
        if (!isSelected) {
          superSidebar.switchAssistant(id);
        }
      }}
      className={cs(styles.menuItem, {
        [styles.manifestsBtnActive]: isSelected,
      })}
    >
      <Icon component={icon as any} />
    </div>
  );
};

export const RightBar = () => {
  const { rightBarAssistants: assistants, currentAssistant } = superSidebar;

  const [containerRef, rect] = useMeasure();
  const [isOverSize, setIsOverSize] = useState<boolean>(false);

  // 如果超过窗口的长度，会把超过的部分放在一个气泡组件里面
  const mainAssistants = assistants.slice(
    0,
    Math.floor((rect.height - 74) / 50),
  );
  const otherManifests = assistants.slice(Math.floor((rect.height - 74) / 50));

  useEffect(() => {
    const currentIsOverSize = rect.offsetHeight < rect.scrollHeight;
    if (currentIsOverSize !== isOverSize) {
      setIsOverSize(Boolean(currentIsOverSize));
    }
  }, [rect]);

  useEffect(() => {
    // 如果当前助手不在助手列表了，自动切换到第一个助手
    if (
      currentAssistant &&
      !assistants.find(a => a.id === currentAssistant?.id)
    ) {
      superSidebar.switchAssistant(superSidebar.first?.id);
    }
  }, [assistants?.length]);

  const transistions = useTransition(
    mainAssistants.map(assistant => ({ ...assistant, height: 47 })),
    {
      key: (item: IAssistant) => item.id,
      initial: {
        opacity: 1,
        scaleY: 1,
        translateY: 0,
        height: 47,
      },
      from: item => {
        if (item.type === AssistantType.ClipAssistant && !item) {
          return {
            opacity: 0,
            scaleY: 0.01,
            translateY: 30,
            height: 0,
          };
        }
        return {};
      },
      enter: item => {
        if (item.type === AssistantType.ClipAssistant && !item) {
          return {
            opacity: 1,
            scaleY: 1,
            translateY: 0,
            height: 47,
          };
        }
        return {};
      },
      leave: {
        opacity: 0,
        scaleY: 0.01,
        translateY: 30,
        height: 0,
      },
      config: {
        duration: 200,
      },
    },
  );

  const content = (
    <div className={styles.menuContainer}>
      {otherManifests.map(assistant => (
        <MenuItem assistant={assistant} key={`${assistant?.id}`} />
      ))}
    </div>
  );

  return (
    <>
      <div ref={containerRef} className={styles.manifestsContainer}>
        {transistions((style, assistant) => {
          return (
            <animated.div
              className={styles.fadeItem}
              style={style}
              key={`${assistant.type}${assistant?.id}`}
            >
              <BarItem assistant={assistant} />
            </animated.div>
          );
        })}
        {otherManifests.length ? (
          <Popover
            content={content}
            placement="left"
            trigger="click"
            overlayClassName={styles.popover}
          >
            <div className={cs(styles.manifestsBtn, styles.moreAction)}>
              <LarkIcon name="more" size={20} />
            </div>
          </Popover>
        ) : null}
      </div>
    </>
  );
};
