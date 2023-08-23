import React, { useContext, useEffect, useState } from 'react';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import classnames from 'classnames';
import { tagProxy, ITag } from '@/core/proxy/tag';
import { TagContext } from './tag-context';
import TagInput from './tag-input';
import styles from './tag-menu.module.less';

interface ITabMenuProps {
  selectIds: number[];
  open: boolean;
}

function TagMenu(props: ITabMenuProps) {
  const { selectIds, open } = props;
  const { selectTags, tags, updateSelectTags, updateTags } =
    useContext(TagContext);
  const [ suggestTags, setSuggestTags ] = useState<ITag[]>([]);
  const [ inputText, setInputText ] = useState('');

  const onSelectTag = (id: number) => {
    const ids = [];
    if (selectIds.includes(id)) {
      selectTags.forEach(item => {
        if (item.id !== id) {
          ids.push(item.id);
        }
      });
      updateSelectTags(ids);
      return;
    }
    updateSelectTags([ ...selectIds, id ]);
  };

  const onCreateTag = async (name: string) => {
    if (!name) return;

    const existedTag = tags.find(tag => tag.name === name.trim());
    if (existedTag) {
      onSelectTag(existedTag.id);
      return;
    }
    try {
      const result = await tagProxy.create({
        name,
      });

      onSelectTag(result.data.id);
      updateTags([ ...tags, result.data ]);
    } catch (e) {
      message.error(e?.message || __i18n('标签创建失败'));
    }
  };

  const resetTagList = (list: ITag[]) => {
    if (!list) return;
    const unSelectedTags = [];
    const selectedTags = [];
    list.forEach(tag => {
      if (selectIds.includes(tag.id)) {
        selectedTags.push({
          ...tag,
          selected: true,
        });
      } else {
        unSelectedTags.push(tag);
      }
    });
    const result = [ ...unSelectedTags, ...selectedTags ];
    setSuggestTags(result);
  };

  useEffect(() => {
    if (!inputText) {
      resetTagList(tags);
      return;
    }
    if (!tags) {
      resetTagList([]);
      return;
    }
    const data = tags.filter(item => {
      return item.name.includes(inputText);
    });
    resetTagList(data);
  }, [ tags, inputText, selectIds ]);

  useEffect(() => {
    if (!open) {
      setInputText('');
    }
  }, [ open ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>{__i18n('新增标签')}</span>
      </div>
      <div className={styles.inputWrapper}>
        <TagInput
          value={inputText}
          onChange={setInputText}
          onConfirm={onCreateTag}
          tags={tags}
          visible={false}
          autoFocus
        />
      </div>
      <p className={styles.tagCount}>
        {__i18n('已有标签 ({count})', {
          count: suggestTags.length,
        })}
      </p>
      {!!suggestTags.length && (
        <div className={styles.tagMenu}>
          {suggestTags?.map(item => {
            const selected = selectIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={classnames(styles.menuItem, {
                  [styles.selectItem]: selected,
                })}
                onClick={() => {
                  if (!selected) {
                    onSelectTag(item.id);
                  }
                }}
              >
                <span className={styles.tagName}>{item.name}</span>
                {selected && (
                  <CheckOutlined width={16} className={styles.checkedIcon} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {!suggestTags.length && (
        <div className={styles.create} onClick={() => onCreateTag(inputText)}>
          <PlusOutlined className={styles.icon} />
          <span className={styles.text}>
            {__i18n('创建标签 “{name}”', { name: inputText })}
          </span>
        </div>
      )}
    </div>
  );
}

export default React.memo(TagMenu);
