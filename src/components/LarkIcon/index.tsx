import React from 'react';
import Icon from '@ant-design/icons';
import { SvgMaps } from './SvgMap';
import EmptyIcon from './EmptyIcon';

export type ILarkIconName = keyof typeof SvgMaps;

interface IProps {
  name: ILarkIconName;
  size?: number;
  className?: string;
  spin?: boolean;
  onClick?: () => void;
}

const LarkIcon = (props: IProps) => {
  const { name, size = 16, className, spin = false, onClick } = props;
  return (
    <Icon
      component={SvgMaps[name] || EmptyIcon}
      style={{ fontSize: `${size}px` }}
      className={className}
      spin={spin}
      onClick={onClick}
    />
  );
};

export default React.memo(LarkIcon);
