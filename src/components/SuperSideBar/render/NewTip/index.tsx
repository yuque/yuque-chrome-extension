import React from 'react';
import { IRenderNewTipsOptions } from '@/components/SuperSideBar/declare';
import styles from './index.module.less';

export const NewTip = (props: IRenderNewTipsOptions) => {
  const {
    data,
    img = 'https://mdn.alipayobjects.com/huamei_0prmtq/afts/img/A*bp8vSYCgh9QAAAAAAAAAAAAADvuFAQ/original',
  } = props;

  return (
    <div className={styles.wrapper}>
      <img className={styles.img} src={img} />
      {data.map(item => {
        return (
          <div className={styles.item}>
            <p className={styles.title}>{item.title}</p>
            <div className={styles.desc}>
              {item.desc.map(desc => {
                return <p className={styles.descItem}>{desc}</p>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
