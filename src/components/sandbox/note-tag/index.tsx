import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { tagProxy, ITag } from '@/core/proxy/tag';
import { TagContext } from './tag-context';
import TagMenu from './tag-menu';
import Popover from './popover';
import { getSelectTag, saveSelectTag } from './util';
import styles from './index.module.less';

function NoteTag() {
  const [ tags, setTags ] = useState<ITag[]>([]);
  const [ selectIds, setSelectIds ] = useState<number[]>([]);
  const [ open, setOpen ] = useState(false);

  const updateSelectTags = useCallback(async (ids: number[]) => {
    setSelectIds(ids);
    saveSelectTag(ids);
    setOpen(false);
  }, []);

  const updateTags = useCallback((items: ITag[]) => {
    setTags(items);
  }, [])

  const deleteTag = (item: ITag) => {
    updateSelectTags(selectIds.filter(id => id !== item.id));
  };

  const selectTags = useMemo(() => {
    const tagIdMap: { [key: number]: ITag } = tags.reduce((total, item) => {
      return {
        ...total,
        [item.id]: item,
      };
    }, {});
    return selectIds.map(item => tagIdMap[item]).filter(item => item);
  }, [ tags, selectIds ]);

  useEffect(() => {
    tagProxy.index().then(res => {
      setTags(res.data?.data);
    });
    getSelectTag().then(setSelectIds);
  }, []);

  return (
    <TagContext.Provider value={{ tags, selectTags, updateSelectTags, updateTags }}>
       <Popover
            content={<TagMenu selectIds={selectIds} open={open} />}
            open={open}
            onOpenChange={setOpen}
          >
      <div className={styles.wrapper}>
        <div>
         
            <div className={styles.addTagWrapper}>
              <PlusOutlined />
              {!selectTags.length && __i18n('添加标签')}
            </div>
        </div>
        {selectTags.map(item => {
          return (
            <div className={styles.selectTag} key={item.id}>
              <span className={styles.tagName}>{item?.name}</span>
              <div onClick={() => deleteTag(item)} className={styles.close}>
                <CloseOutlined />
              </div>
            </div>
          );
        })}
      </div>
      </Popover>

    </TagContext.Provider>
  );
}

export default NoteTag;
