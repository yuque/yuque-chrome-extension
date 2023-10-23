import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { __i18n } from '@/isomorphic/i18n';
import { ITag } from '@/core/bridge/background/request/tag';
import styles from './index.module.less';

interface ITagListProps {
  selectTags: ITag[];
  updateSelectTags: (tags: ITag[]) => void;
}

function TagList(props: ITagListProps) {
  const { selectTags, updateSelectTags } = props;

  const deleteTag = (item: ITag) => {
    const result = selectTags.filter(tag => item.id !== tag.id);
    updateSelectTags(result);
  };

  return (
    <div className={styles.tagWrapper}>
      {selectTags.map(item => {
        return (
          <div className={styles.tag} key={item.id}>
            <span className={styles.tagName}>{item?.name}</span>
            <div onClick={() => deleteTag(item)} className={styles.close}>
              <CloseOutlined />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(TagList);
