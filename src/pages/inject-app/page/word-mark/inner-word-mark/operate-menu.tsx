import React from 'react';
import Icon from '@ant-design/icons';
import classnames from 'classnames';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { PushpinOutlined, PushpinFilled } from '@ant-design/icons';
import { toolbars } from '../constants';
import styles from './operate-menu.module.less';

interface IOperateMenuProps {
  pinList: WordMarkOptionTypeEnum[];
  handlePin: (type: WordMarkOptionTypeEnum) => void;
  executeCommand: (type: WordMarkOptionTypeEnum) => void;
}

function OperateMenu(props: IOperateMenuProps) {
  const { pinList, handlePin, executeCommand } = props;

  return (
    <div className={styles.menus}>
      {toolbars.map(item => {
        const { type, name, icon } = item;
        const pinned = pinList.includes(type);

        return (
          <div className={styles.menuItem} key={type}>
            <div
              className={styles.nameWrapper}
              onClick={() => executeCommand(type)}
            >
              <Icon component={icon} className={styles.icon} />
              <span>{name}</span>
            </div>
            <div
              className={classnames(styles.action, {
                [styles.pinned]: pinned,
              })}
              onClick={() => handlePin(type)}
            >
              {pinned ? <PushpinFilled /> : <PushpinOutlined />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(OperateMenu);
