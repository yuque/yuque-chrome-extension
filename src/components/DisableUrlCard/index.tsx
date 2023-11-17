import React from 'react';
import { Row, Col } from 'antd';
import Icon from '@ant-design/icons';
import ActionDelete from '@/assets/svg/action-delete.svg';
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
    <Row gutter={[20, 20]}>
      {options.map((item, index) => {
        return (
          <Col span={12} key={item.origin}>
            <div key={item.origin} className={styles.cardItemWrapper}>
              <img src={item.icon} className={styles.icon} />
              <span className={styles.name}>{item.origin}</span>
              <div
                className={styles.deleteWrapper}
                onClick={() => props.onDelete(item, index)}
              >
                <Icon component={ActionDelete} />
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

export default React.memo(DisableUrlCard);
