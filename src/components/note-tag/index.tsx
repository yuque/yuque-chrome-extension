import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { ITag } from '@/core/proxy/tag';
import { TagContext } from './tag-context';
import TagMenu from './tag-menu';
import Popover from './popover';
import styles from './index.module.less';
import { sendMessageToBack } from '@/core/bridge/inject-to-background';
import { BACKGROUND_EVENTS } from '@/events';

export interface INoteTagRef {
  getSelectTagIds: () => number[];
  clear: () => void;
}

export default React.memo(
  forwardRef<INoteTagRef, {}>(function NoteTag(_, ref) {
    const [ tags, setTags ] = useState<ITag[]>([]);
    const [ selectIds, setSelectIds ] = useState<number[]>([]);
    const [ open, setOpen ] = useState(false);

    const updateSelectTags = useCallback(async (ids: number[]) => {
      setSelectIds(ids);
      setOpen(false);
    }, []);

    const updateTags = useCallback((items: ITag[]) => {
      setTags(items);
    }, []);

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
      const onBlur = () => {
        setOpen(false);
      };
      // 因为编辑器是 iframe useClickAway 监听不到，所以需要给页面加一个失焦监听
      window.addEventListener('blur', onBlur);
      sendMessageToBack(BACKGROUND_EVENTS.GET_MINE_TAG).then(res => {
        setTags(res.data?.data);
      });
      return () => {
        window.removeEventListener('blur', onBlur);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getSelectTagIds: () => {
          return selectIds;
        },
        clear: () => {
          setSelectIds([]);
        },
      }),
      [ selectIds ],
    );

    return (
      <TagContext.Provider
        value={{ tags, selectTags, updateSelectTags, updateTags }}
      >
        <div className={styles.noteTagWrapper}>
          <Popover
            content={<TagMenu selectIds={selectIds} open={open} />}
            open={open}
            onOpenChange={setOpen}
          >
            <div onClick={() => setOpen(!open)}>
              <div className={styles.addTagWrapper}>
                <PlusOutlined />
                {!selectTags.length && __i18n('添加标签')}
              </div>
            </div>
          </Popover>
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
      </TagContext.Provider>
    );
  }),
);
