import React, { useState, useEffect, useRef, memo } from 'react';
import classnames from 'classnames';
import useLatest from '@/hooks/useLatest';
import { IRenderTextOptions } from '@/components/SuperSideBar/declare';
import styles from './index.module.less';

const Typewriter = ({
  text,
  delay = 16,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) => {
  const [visibleText, setVisibleText] = useState('');
  const index = useRef(0);
  const startTime = useRef<any>(null);
  const textRef = useLatest(text);

  useEffect(() => {
    function animate(currentTime: number) {
      if (startTime.current === null) startTime.current = currentTime;
      const progress = currentTime - startTime.current;

      if (progress > delay) {
        if (index.current < textRef.current.length) {
          setVisibleText(prevText => prevText + textRef.current[index.current]);
          index.current += 1;
          startTime.current = currentTime;
        } else {
          return;
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [text.length, delay]);

  return (
    <span className={classnames(styles.typewriter, className)}>
      {visibleText}
    </span>
  );
};

export const EnhanceTypewriter = memo(Typewriter, props => props.text as any);

export const MessageText = (props: IRenderTextOptions) => {
  const { text, className, ...rest } = props;
  if (!text) {
    return null;
  }

  const list = Array.isArray(text) ? text : [text];

  return (
    <div className={classnames(styles.messageText, className)} {...rest}>
      {list.map((text1, index) => {
        if (props.typewriter) {
          return <Typewriter key={index} text={text1 as string} />;
        }

        return (
          <span key={index} className={styles.text}>
            {text1}
          </span>
        );
      })}
    </div>
  );
};
