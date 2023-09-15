import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConfigProvider,
  Button,
  Select,
  message,
  Menu,
  Spin,
  Tooltip,
} from 'antd';
import Icon from '@ant-design/icons';
import classnames from 'classnames';
import { noteProxy } from '@/core/proxy/note';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { transformUrlToFile, urlOrFileUpload } from '@/core/html-parser';
import LinkHelper from '@/core/link-helper';
import LakeEditor, { IEditorRef } from '@/components/lake-editor/editor';
import BookWithIcon from '@/components/common/book-with-icon';
import { extractSummaryRaw } from '@/components/editor/extract-summary-raw';
import { StartSelectEnum, VIEW_MORE_TAG } from '@/isomorphic/constants';
import NoteTag from '@/components/sandbox/note-tag';
import {
  getSelectTag,
  saveSelectTag,
} from '@/components/sandbox/note-tag/util';
import { docProxy } from '@/core/proxy/doc';
import { mineProxy } from '@/core/proxy/mine';
import { ClippingTypeEnum } from '@/isomorphic/sandbox';
import { useUpdateEffect } from '@/hooks/useUpdateEffect';
import OcrIconSvg from '@/assets/svg/ocr-icon.svg';
import {
  getBookmarkHTMLs,
  getBookmarkHtml,
  getCurrentTab,
  startSelect,
} from '../helper';
import { ocrManager } from '../ocr/ocr-manager';
import { SELECT_TYPES } from '../constants/select-types';
import { useSandboxContext } from '../provider/sandBoxProvider';
import styles from './index.module.less';

const NODE_DATA_ID = 0;

const BOOKS_DATA = [
  {
    id: NODE_DATA_ID,
    type: 'Note',
    get name() {
      return __i18n('小记');
    },
  },
];

export interface ISaveToProps {
  className?: string;
}

const useViewModel = (props: ISaveToProps) => {
  const [loading, setLoading] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [books, setBooks] = useState(BOOKS_DATA);
  const [currentBookId, setCurrentBookId] = useState(NODE_DATA_ID);
  const contentRef = useRef({
    // 剪藏选取内容
    [ClippingTypeEnum.area]: '',
    // 剪藏网址内容
    [ClippingTypeEnum.website]: '',
  });
  const { defaultSelectHTML, updateClippingType, clippingType } =
    useSandboxContext();
  const clippingTypeRef = useRef<ClippingTypeEnum | null>(null);

  const editorRef = useRef<IEditorRef>(null);

  const onLoad = useCallback(async () => {
    setEditorLoading(true);
    const isEmpty = editorRef.current?.isEmpty();
    if (isEmpty) {
      const isNote = currentBookId === NODE_DATA_ID;
      const { heading, quote } = getBookmarkHTMLs(await getCurrentTab());
      editorRef.current?.appendContent(quote);
      // 回到文档开头
      editorRef.current?.focusToStart();
      // 非小记插入标题
      if (!isNote) {
        editorRef.current?.appendContent(heading);
        editorRef.current?.focusToStart(1);
      }
    }
    // 追加当前选取的html
    editorRef.current?.appendContent(defaultSelectHTML.join(''));
    setEditorLoading(false);
  }, [defaultSelectHTML]);

  const startAreaClipping = useCallback(() => {
    // 重新开始剪藏的时候需要清空内容
    editorRef.current?.setContent(
      contentRef.current[ClippingTypeEnum.area] || '',
      'text/lake',
    );
    if (!contentRef.current[ClippingTypeEnum.area]) {
      startSelect(StartSelectEnum.areaSelect);
    }
    // 清空记录上一次的剪藏内容
    contentRef.current[ClippingTypeEnum.area] = '';
  }, []);

  const startWebsiteClipping = useCallback(() => {
    getCurrentTab().then(tab => {
      const html = getBookmarkHtml(tab, false, currentBookId !== NODE_DATA_ID);
      editorRef.current?.setContent(html);
    });
  }, []);

  /**
   * 获取知识库的数据
   */
  useEffect(() => {
    mineProxy.getBooks().then(bookList => {
      setBooks([...BOOKS_DATA, ...bookList]);
    });
  }, []);

  useUpdateEffect(() => {
    onLoad();
  }, [defaultSelectHTML]);

  const onSave = useCallback(async () => {
    if (!editorRef.current) return;

    const onSuccess = (type: 'doc' | 'note', noteOrDoc: { id: string }) => {
      updateClippingType(null);
      setLoading(false);
      setEditorLoading(false);

      if (type === 'note') {
        const url = LinkHelper.goMyNote();
        message.success(
          <span>
            {__i18n('保存成功！')}
            &nbsp;&nbsp;
            <a target="_blank" href={url}>
              {__i18n('去小记查看')}
            </a>
          </span>,
        );
      } else {
        const url = LinkHelper.goDoc(noteOrDoc);
        message.success(
          <span>
            {__i18n('保存成功！')}
            &nbsp;&nbsp;
            <a target="_blank" href={url}>
              {__i18n('立即查看')}
            </a>
          </span>,
        );
      }
    };

    const onError = () => {
      message.error(__i18n('保存失败，请重试！'));
      setLoading(false);
      setEditorLoading(false);
    };

    setLoading(true);
    setEditorLoading(true);

    try {
      const serializedAsiContent =
        (await editorRef.current?.getContent('lake')) || '';
      const serializedHtmlContent =
        (await editorRef.current?.getContent('text/html')) || '';
      const summary = editorRef.current.getSummaryContent();
      const wordCount = editorRef.current.wordCount();
      const extractRes = extractSummaryRaw(serializedAsiContent, {
        summary,
      });
      const {
        hasImage: has_image,
        hasBookmark: has_bookmark,
        hasAttachment: has_attachment,
        isFull,
      } = extractRes;
      let description = extractRes.html;
      // 摘要与内容不相等，展示更多标记
      if (!isFull) {
        description += VIEW_MORE_TAG;
      }
      if (currentBookId === NODE_DATA_ID) {
        const tagIds = await getSelectTag();
        noteProxy
          .create({
            source: serializedAsiContent,
            html: serializedHtmlContent,
            abstract: description,
            has_image,
            has_bookmark,
            has_attachment,
            word_count: wordCount,
            tag_meta_ids: tagIds,
          })
          .then(data => {
            onSuccess('note', data);
            saveSelectTag([]);
          })
          .catch(onError);
      } else {
        getCurrentTab().then(tab => {
          docProxy
            .create({
              title: __i18n('[来自剪藏] {title}', {
                title: tab.title,
              }),
              book_id: currentBookId,
              body_draft_asl: serializedAsiContent,
              body_asl: serializedAsiContent,
              body: serializedHtmlContent,
              insert_to_catalog: true,
            })
            .then(doc => {
              onSuccess('doc', doc);
            })
            .catch(onError);
        });
      }
    } catch (e) {
      message.error(__i18n('保存失败，请重试！'));
      setLoading(false);
      setEditorLoading(false);
    }
  }, [editorRef, currentBookId]);

  const onUploadImage = useCallback(async (params: { data: string }) => {
    const file = await transformUrlToFile(params.data);
    const res = await Promise.all(
      [urlOrFileUpload(file), ocrManager.startOCR('file', file)].map(p =>
        p.catch(e => e),
      ),
    );
    return {
      ...(res[0] || {}),
      ocrLocations: res[1],
    };
  }, []);

  const handleTypeSelect = async (info: MenuInfo) => {
    const oldType = clippingType;
    const newType = info.key as ClippingTypeEnum;
    const isEmpty = editorRef.current?.isEmpty();
    if (!isEmpty) {
      const content = await editorRef.current?.getContent('lake');
      if (oldType) {
        contentRef.current[oldType] = content as any;
      }
    }
    if (oldType !== newType) {
      switch (newType) {
        case ClippingTypeEnum.area:
          startAreaClipping();
          break;
        case ClippingTypeEnum.website:
          startWebsiteClipping();
          break;
        default:
          break;
      }
    }
    updateClippingType(newType);
  };

  useEffect(() => {
    clippingTypeRef.current = clippingType;
  }, [clippingType]);

  return {
    state: {
      books,
      currentBookId,
      loading,
      editorRef,
      editorLoading,
    },
    onSave,
    onUploadImage,
    onSelectBookId: setCurrentBookId,
    onLoad,
    handleTypeSelect,
  };
};

export default function SaveTo(props: ISaveToProps) {
  const {
    clippingType,
    editorLoading: ocrEditorLoading,
    enableOcr,
  } = useSandboxContext();
  const {
    state: { books, currentBookId, loading, editorRef, editorLoading },
    onSave,
    onUploadImage,
    onSelectBookId,
    onLoad,
    handleTypeSelect,
  } = useViewModel(props);

  const renderContinue = () => {
    if (clippingType === ClippingTypeEnum.area) {
      return (
        <Button
          onClick={() => startSelect(StartSelectEnum.areaSelect)}
          className="continue-button"
        >
          {__i18n('继续选取')}
        </Button>
      );
    }
    return null;
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            activeBarBorderWidth: 0,
            itemMarginInline: 0,
          },
        },
      }}
    >
      <div className={classnames(styles.wrapper, props.className)}>
        <div className={styles.actionTip}>{__i18n('选择剪藏方式')}</div>
        <Menu
          mode="inline"
          inlineIndent={8}
          selectedKeys={[clippingType as string]}
          onClick={handleTypeSelect}
          items={SELECT_TYPES}
          className={styles.menu}
        />
        <div className={classnames(styles.actionTip, styles.clipTarget)}>
          {__i18n('剪藏到')}
        </div>
        <Select<number>
          className={styles.list}
          onChange={(value: number) => onSelectBookId(Number(value))}
          defaultValue={currentBookId}
          options={books.map(book => ({
            value: book.id,
            label: <BookWithIcon book={book} />,
          }))}
        />
        <Button
          className={styles.button}
          type="primary"
          block
          loading={loading}
          disabled={!clippingType}
          onClick={onSave}
        >
          {__i18n('保存到')}
          {currentBookId === NODE_DATA_ID ? __i18n('小记') : __i18n('知识库')}
        </Button>
        <div
          className={classnames(styles['lake-editor'], {
            [styles.hidden]: !clippingType,
            [styles.areaLakeEditor]: clippingType === ClippingTypeEnum.area,
          })}
        >
          {editorLoading || ocrEditorLoading ? (
            <>
              <div className={styles.loading}>
                <Spin className={styles.spin} />
                {ocrEditorLoading && (
                  <div className={styles.tip}>{__i18n('正在识别中')}</div>
                )}
              </div>
            </>
          ) : null}
          <LakeEditor
            ref={editorRef}
            value=""
            onSave={onSave}
            onLoad={onLoad}
            uploadImage={onUploadImage}
            enableEsc={true}
          >
            {renderContinue()}
          </LakeEditor>
          {enableOcr && (
            <Tooltip title={__i18n('截图智能识别文本')}>
              <div
                onClick={() => startSelect(StartSelectEnum.screenShot)}
                className={styles.ocrWrapper}
              >
                <Icon component={OcrIconSvg} />
              </div>
            </Tooltip>
          )}
          <div
            className={classnames({
              [styles.hidden]: currentBookId !== NODE_DATA_ID,
            })}
          >
            <NoteTag />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
