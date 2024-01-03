import React, { useEffect, useMemo, useState } from 'react';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import classnames from 'classnames';
import { __i18n } from '@/isomorphic/i18n';
import { ITag } from '@/core/webProxy/tag';
import { webProxy } from '@/core/webProxy';
import TagInput from './TagInput';
import styles from './TagMenu.module.less';

export interface ITagMenuProps {
  tags: ITag[];
  selectTags: ITag[];
  updateTags: (tags: ITag[]) => void;
  updateSelectTags: (tags: ITag[]) => void;
}

interface ISuggestTag extends ITag {
  selected?: boolean;
}

function TagMenu(props: ITagMenuProps) {
  const { tags, selectTags, updateSelectTags, updateTags } = props;
  const [suggestTags, setSuggestTags] = useState<ISuggestTag[]>([]);
  const [inputText, setInputText] = useState('');

  const selectIds = useMemo(() => {
    return selectTags.map(item => item.id);
  }, [selectTags]);

  const onSelectTag = (item: ITag) => {
    if (selectIds.includes(item.id)) {
      const selectResult = selectTags.filter(tag => tag.id !== item.id);
      updateSelectTags(selectResult);
      return;
    }
    updateSelectTags([...selectTags, item]);
  };

  const onCreateTag = async (name: string) => {
    if (!name) return;
    const existedTag = tags.find(tag => tag.name === name.trim());
    if (existedTag) {
      onSelectTag(existedTag);
      return;
    }
    try {
      const result = await webProxy.tag.create({
        name,
      });
      if (!result) {
        message.error(__i18n('标签创建失败'));
        return;
      }
      onSelectTag(result);
      updateTags([...tags, result]);
    } catch (e) {
      message.error(__i18n('标签创建失败'));
    }
  };

  const resetTagList = (list: ITag[]) => {
    if (!list) return;
    const unSelectedTags: ISuggestTag[] = [];
    const selectedTags: ISuggestTag[] = [];
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
    const result = [...unSelectedTags, ...selectedTags];
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
  }, [tags, inputText, selectIds]);

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
          count: `${suggestTags.length}`,
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
                    onSelectTag(item);
                  }
                }}
              >
                <span className={styles.tagName}>{item.name}</span>
                {selected && <CheckOutlined width={16} className={styles.checkedIcon} />}
              </div>
            );
          })}
        </div>
      )}

      {!suggestTags.length && (
        <div
          className={styles.create}
          onClick={() => {
            onCreateTag(inputText);
          }}
        >
          <PlusOutlined className={styles.icon} />
          <span className={styles.text}>{__i18n('创建标签 “{name}”', { name: inputText })}</span>
        </div>
      )}
    </div>
  );
}

export default React.memo(TagMenu);
