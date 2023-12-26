import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { ITag } from '@/core/webProxy/tag';
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
