import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button, Spin, Tooltip, message, Input } from 'antd';
import classnames from 'classnames';
import Icon from '@ant-design/icons';
import { __i18n } from '@/isomorphic/i18n';
import LakeEditor, { IEditorRef } from '@/components/lake-editor/editor';
import { backgroundBridge } from '@/core/bridge/background';
import { IStartOcrResult, ocrManager } from '@/core/ocr-manager';
import { getBookmarkHTMLs, transformUrlToFile } from '@/isomorphic/util';
import SelectSavePosition from '@/components/SelectSavePosition';
import {
  buildParamsForDoc,
  buildParamsForNote,
} from '@/components/lake-editor/helper';
import LinkHelper from '@/isomorphic/link-helper';
import { STORAGE_KEYS } from '@/config';
import {
  DefaultSavePosition,
  ISavePosition,
} from '@/core/bridge/background/request/mine';
import { ITag } from '@/core/bridge/background/request/tag';
import useClipShortCut from '@/hooks/useClipShortCut';
import {
  ClipSelectAreaId,
  ClipScreenOcrId,
  ClipCollectLinkId,
  ClipAssistantMessageKey,
  ClipAssistantMessageActions,
} from '@/isomorphic/event/clipAssistant';
import {
  ContentScriptMessageActions,
  ContentScriptMessageKey,
} from '@/isomorphic/event/contentScript';
import { isRunningInjectPage } from '@/core/uitl';
import OcrSvg from '@/assets/svg/ocr-icon.svg';
import ClipperSvg from '@/assets/svg/clipper.svg';
import CollectLinkSvg from '@/assets/svg/collect-link.svg';
import { superSidebar } from '@/components/SuperSideBar/index';
import AddTagButton from './component/AddTagButton';
import TagList from './component/TagList';
import styles from './index.module.less';

function ClipContent() {
  const editorRef = useRef<IEditorRef>(null);
  const shortcutMap = useClipShortCut();
  const [loading, setLoading] = useState<{
    type?: 'ocr';
    loading: boolean;
  }>({
    loading: false,
  });
  const [selectSavePosition, setSelectSavePosition] = useState<ISavePosition>();
  const [userTags, setUserTags] = useState<ITag[]>([]);
  const [selectTags, setSelectTags] = useState<ITag[]>([]);
  const [title, setTitle] = useState('');

  const onTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTitle(e.target.value);
    },
    [],
  );

  const onLoad = useCallback(() => {
    // iframe 加载完成后触发一个 message
    window.parent.postMessage(
      {
        key: ClipAssistantMessageKey,
        action: ClipAssistantMessageActions.ready,
      },
      '*',
    );
  }, []);

  const onSave = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.isEmpty()) {
      message.warning(__i18n('内容不能为空'));
      return;
    }

    const showSuccessMessage = (
      text: string,
      link: { text: string; href: string },
    ) => {
      if (isRunningInjectPage) {
        window.parent.postMessage(
          {
            key: ContentScriptMessageKey,
            action: ContentScriptMessageActions.ShowMessage,
            data: {
              text,
              type: 'success',
              link,
            },
          },
          '*',
        );
        return;
      }
      message.success(
        <span>
          {text}
          &nbsp;&nbsp;
          <a target="_blank" href={link.href}>
            {link.text}
          </a>
        </span>,
      );
    };

    setLoading({ loading: true });
    try {
      // 保存到小记
      if (selectSavePosition?.id === DefaultSavePosition.id) {
        const noteParams = {
          ...(await buildParamsForNote(editor)),
          tag_meta_ids: selectTags.map(item => item.id),
        };
        await backgroundBridge.request.note.create(noteParams);
        const url = LinkHelper.goMyNote();
        showSuccessMessage(__i18n('保存成功！'), {
          href: url,
          text: __i18n('去小记查看'),
        });
      } else {
        const docParams = {
          ...(await buildParamsForDoc(editor)),
          title,
          book_id: selectSavePosition?.id as number,
        };
        const doc = await backgroundBridge.request.doc.create(docParams);
        const url = LinkHelper.goDoc(doc);
        showSuccessMessage(__i18n('保存成功！'), {
          href: url,
          text: __i18n('立即查看'),
        });
      }
      if (isRunningInjectPage) {
        backgroundBridge.sidePanel.close();
      }
      editor.setContent('');
    } catch (error) {
      message.error(__i18n('保存失败，请重试！'));
    }
    setLoading({ loading: false });
  };

  const onUploadImage = useCallback(async (params: { data: string }) => {
    const file = await transformUrlToFile(params.data);
    const res = await Promise.all(
      [
        backgroundBridge.request.upload.attach(params.data),
        ocrManager.startOCR('file', file),
      ].map(p => p.catch(e => e)),
    );
    return {
      ...(res[0] || {}),
      ocrLocations: res[1],
    };
  }, []);

  const onSelectArea = async () => {
    const html = await backgroundBridge.clip.selectArea();
    editorRef.current?.appendContent(html);
  };

  const onScreenOcr = async () => {
    try {
      const res = await backgroundBridge.clip.screenOcr();
      if (res) {
        setLoading({ loading: true, type: 'ocr' });
        const textArray: IStartOcrResult = await new Promise(resolve => {
          const image = new Image();
          image.src = res;
          image.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const width = image.width;
            const height = image.height;
            // 在canvas上绘制截取区域
            canvas.width = width;
            canvas.height = height;
            context?.drawImage(image, 0, 0, width, height, 0, 0, width, height);
            canvas.toBlob(async blob => {
              const result = await ocrManager.startOCR('blob', blob || '');
              resolve(result);
            });
          };
        });
        const text = textArray?.map(item => item.text)?.join('') || '';
        editorRef.current?.appendContent(text);
      }
    } catch (error) {
      console.log('ocr error:', error);
    }
    setLoading({ loading: false });
  };

  const onCollectLink = async () => {
    const tab = await backgroundBridge.tab.getCurrent();
    const { quote } = getBookmarkHTMLs({
      title: tab?.title || '',
      url: tab?.url || '',
    });
    editorRef.current?.appendContent(quote);
    // 回到文档开头
    editorRef.current?.focusToStart();
  };

  const handleRequestTag = async () => {
    try {
      const tags = await backgroundBridge.request.tag.index();
      setUserTags(tags);
    } catch (error) {
      //
    }
  };

  const renderLoading = () => {
    if (!loading.loading) {
      return null;
    }
    const text = loading.type === 'ocr' ? '正在识别中' : '';
    return (
      <div className={styles.loadingWrapper}>
        <Spin />
        {!!text && <div className={styles.tip}>{text}</div>}
      </div>
    );
  };

  useEffect(() => {
    if (selectSavePosition?.id !== DefaultSavePosition.id) {
      return;
    }
    handleRequestTag();
  }, [selectSavePosition]);

  useEffect(() => {
    const onStartSelectArea = () => {
      const div = document.querySelector(`#${ClipSelectAreaId}`);
      (div as HTMLDivElement)?.click();
    };
    const onStartScreenOcr = () => {
      const div = document.querySelector(`#${ClipScreenOcrId}`);
      (div as HTMLDivElement)?.click();
    };
    const onStartCollectLink = () => {
      const div = document.querySelector(`#${ClipCollectLinkId}`);
      (div as HTMLDivElement)?.click();
    };
    const onMessage = (e: any) => {
      if (e.data.key !== ClipAssistantMessageKey) {
        return;
      }
      switch (e.data.action) {
        case ClipAssistantMessageActions.addContent: {
          editorRef.current?.appendContent(e.data?.data);
          break;
        }
        case ClipAssistantMessageActions.startSelectArea: {
          onStartSelectArea();
          break;
        }
        case ClipAssistantMessageActions.startScreenOcr: {
          onStartScreenOcr();
          break;
        }
        case ClipAssistantMessageActions.startCollectLink: {
          onStartCollectLink();
          break;
        }
        default: {
          break;
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    backgroundBridge.tab.getCurrent().then(tab => {
      setTitle(tab?.title || '');
    });
  }, []);

  return (
    <div
      className={classnames(styles.wrapper, {
        [styles.hidden]: superSidebar.currentAssistant?.id !== 1,
      })}
    >
      {renderLoading()}
      <div className={styles.headerWrapper}>
        <Tooltip
          title={isRunningInjectPage ? shortcutMap.selectArea : ''}
          getPopupContainer={node => node}
        >
          <div
            className={styles.headerItem}
            onClick={onSelectArea}
            id={ClipSelectAreaId}
          >
            <Icon component={ClipperSvg} className={styles.icon} />
            <span>{__i18n('选取剪藏')}</span>
          </div>
        </Tooltip>
        <Tooltip
          title={isRunningInjectPage ? shortcutMap.startOcr : ''}
          getPopupContainer={node => node}
        >
          <div
            className={styles.headerItem}
            onClick={onScreenOcr}
            id={ClipScreenOcrId}
          >
            <Icon component={OcrSvg} className={styles.icon} />
            <span>{__i18n('OCR 提取')}</span>
          </div>
        </Tooltip>

        <Tooltip
          title={isRunningInjectPage ? shortcutMap.collectLink : ''}
          placement="top"
          getPopupContainer={node => node}
        >
          <div
            className={styles.headerItem}
            onClick={onCollectLink}
            id={ClipCollectLinkId}
          >
            <Icon component={CollectLinkSvg} className={styles.icon} />
            <span>{__i18n('链接收藏')}</span>
          </div>
        </Tooltip>
      </div>
      <div
        className={classnames(styles.titleWrapper, {
          [styles.none]: !selectSavePosition?.id,
        })}
      >
        <Input.TextArea
          className={styles.title}
          placeholder={__i18n('输入标题')}
          value={title}
          autoSize={{ minRows: 1, maxRows: 100 }}
          onChange={onTitleChange}
        />
      </div>
      <div className={styles.editorWrapper}>
        <LakeEditor
          ref={editorRef}
          value=""
          onLoad={onLoad}
          uploadImage={onUploadImage as any}
          onSave={onSave}
        />
      </div>
      {selectSavePosition?.id === DefaultSavePosition.id && (
        <TagList selectTags={selectTags} updateSelectTags={setSelectTags} />
      )}
      <div className={styles.saveOptionWrapper}>
        <div className={styles.savePositionWrapper}>
          <SelectSavePosition
            rememberKey={STORAGE_KEYS.USER.CLIPPING_SAVE_POSITION}
            onChange={setSelectSavePosition}
          >
            <AddTagButton
              tags={userTags}
              selectTags={selectTags}
              updateTags={setUserTags}
              updateSelectTags={setSelectTags}
              key={selectTags.length}
            />
          </SelectSavePosition>
        </div>
        <Button type="primary" onClick={onSave}>
          {__i18n('保存')}
        </Button>
      </div>
    </div>
  );
}

export default ClipContent;
