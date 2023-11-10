import React, { Suspense } from 'react';
import Icon from '@ant-design/icons';
import { SvgMaps } from './SvgMap';

interface IProps {
  name: keyof typeof SvgMaps;
  size?: number;
  className?: string;
  spin?: boolean;
}

const LarkIcon = (props: IProps) => {
  const { name, size = 16, className, spin = false } = props;
  const SvgComponent = React.lazy(async () => {
    return SvgMaps[name];
  });
  return (
    <Suspense fallback={null}>
      <Icon
        component={SvgComponent}
        style={{ fontSize: `${size}px` }}
        className={className}
        spin={spin}
      />
    </Suspense>
  );
};

export default React.memo(LarkIcon);
