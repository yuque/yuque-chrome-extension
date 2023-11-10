import React, { useRef, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { registerAssistantsToSidebar } from '@/components/SuperSideBar/registry';
import { superSidebar } from '@/components/SuperSideBar';
import { useAccountContext } from '@/components/AccountLayout/useAccountContext';
import {
  IAssistant,
  ISidebarRenderContext,
  IScrollerRef,
  ISidebarContextData,
  ISideContentProvider,
  IRootDrawerRef,
} from '../declare';
import { generalRender } from '../render';
import { RightBar } from './RightBar';
import SuperSidebarHeader from './Header';
import { RootDrawer } from './Drawer';
import styles from './index.module.less';

interface ContentProps {
  scrollerRef: React.MutableRefObject<IScrollerRef>;
  assistant?: IAssistant;
  renderContext: ISidebarRenderContext;
}

const EnhanceContentImpl = (props: ContentProps) => {
  const { scrollerRef, assistant, renderContext } = props;

  if (!assistant?.provider) {
    return renderContext.sidebarRender.renderEmpty({
      text: '暂无可用的功能',
    });
  }

  const { sidebarRender } = renderContext;
  const content = assistant.provider?.renderContent?.(renderContext);

  const customizedContent = assistant?.provider.fullyCustomizedRender?.(
    renderContext,
    scrollerRef,
  );

  if (customizedContent) {
    // 全接管模式的渲染
    return customizedContent;
  }

  return (
    <>
      {sidebarRender.renderScroller({
        style: { flex: 1 },
        className: styles.scroller,
        ref: scrollerRef,
        children: content,
      })}

      {assistant?.provider.renderFooter?.(renderContext)}
      {assistant?.provider.renderExtra?.(renderContext)}
    </>
  );
};

function SuperSidebarContainer() {
  const { currentAssistant } = superSidebar;
  const rootDrawerRef = useRef<IRootDrawerRef>(null);
  const { user } = useAccountContext();
  const { forceUpdate } = useForceUpdate();
  const scrollerRef = useRef<IScrollerRef>();

  const contextData: ISidebarContextData = useMemo(() => {
    return { me: user };
  }, [user]);
  const renderContext = useRef<ISidebarRenderContext>({
    contextData,
    sidebarRender: generalRender,
    forceUpdate,
    scrollToBottom(immediately?: boolean) {
      scrollerRef.current?.scrollToBottom(immediately);
    },
    renderDrawer: conf => rootDrawerRef.current?.render(conf),
    closeDrawer: () => {
      //
    },
  }).current;

  useEffect(() => {
    const remover = superSidebar.addListener({
      onAssistantsChanged() {
        forceUpdate();
      },
      onActivateAssistantChanged(assistant: IAssistant<ISideContentProvider>) {
        forceUpdate();
      },
    });

    return () => {
      remover();
    };
  }, []);

  useEffect(() => {
    renderContext.contextData = contextData;
    superSidebar.updateContext(contextData);
    forceUpdate();
  }, [contextData]);

  useEffect(() => {
    superSidebar.initCurrentAssistant();
  }, []);

  return (
    <div className={styles.container}>
      <RootDrawer ref={rootDrawerRef} />
      <div className={styles.header}>
        <SuperSidebarHeader />
      </div>
      <div className={styles.body}>
        <div className={styles.content}>
          {superSidebar.getAssistantById(1) && (
            <div
              className={classnames(styles.clipAssistantWrapper, {
                [styles.hidden]: currentAssistant?.id !== 1,
              })}
            >
              <EnhanceContentImpl
                scrollerRef={scrollerRef as any}
                assistant={superSidebar.getAssistantById(1)}
                renderContext={renderContext}
              />
            </div>
          )}
          {currentAssistant?.id !== 1 && (
            <EnhanceContentImpl
              scrollerRef={scrollerRef as any}
              assistant={currentAssistant}
              renderContext={renderContext}
            />
          )}
        </div>
        <div className={styles.sideBar}>
          <RightBar />
        </div>
      </div>
    </div>
  );
}

registerAssistantsToSidebar();
export default SuperSidebarContainer;
