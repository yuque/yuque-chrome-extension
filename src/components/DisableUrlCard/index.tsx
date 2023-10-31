import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.less';

export interface IDisableUrlItem {
  icon: string;
  origin: string;
}

interface IDisableUrlCardProps {
  options: Array<IDisableUrlItem>;
  onDelete: (item: IDisableUrlItem, index: number) => void;
}

function DisableUrlCard(props: IDisableUrlCardProps) {
  const { options = [] } = props;
  if (!options.length) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      {options.map((item, index) => {
        return (
          <div key={item.origin} className={styles.cardItemWrapper}>
            <img src={item.icon} className={styles.icon} />
            <span className={styles.name}>{item.origin}</span>
            <div
              className={styles.deleteWrapper}
              onClick={() => props.onDelete(item, index)}
            >
              <DeleteOutlined />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(DisableUrlCard);
