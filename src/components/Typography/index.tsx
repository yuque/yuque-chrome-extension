import React, {
  createElement,
  useEffect,
  useState,
  forwardRef,
  CSSProperties,
} from 'react';
import classnames from 'classnames';
import { Tooltip } from 'antd';
import useMeasure from '@/hooks/useMeasure';
import styles from './index.module.less';

function fillRef(ref, node) {
  if (typeof ref === 'function') {
    ref(node);
  } else if (Object.prototype.toString.call(ref).slice(8, -1) === 'Object') {
    ref.current = node;
  }
}

function composeRef(...refs) {
  const _refs = refs.filter(ref => ref);
  if (_refs.length === 1) {
    return _refs[0];
  }
  return node => {
    _refs.forEach(ref => {
      fillRef(ref, node);
    });
  };
}

const defaultVariantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  headline1: 'h1',
  headline2: 'h2',
  headline3: 'h3',
  headline4: 'h4',
  title: 'h5',
  body: 'h6',
  'body-small': 'p',
  caption: 'p',
  'caption-small': 'p',
};

export const variant = {
  headline1: 'headline1',
  headline2: 'headline2',
  headline3: 'headline3',
  headline4: 'headline4',
  title: 'title',
  body: 'body',
  bodySmall: 'body-small',
  caption: 'caption',
  captionSmall: 'caption-small',
  primaryButtonDefault: 'primary-button-default',
  primaryButtonStrong: 'primary-button-strong',
  secondaryButtonDefault: 'secondary-button-default',
  disableButtonDefault: 'disable-button-default',
  disable: 'disable',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  linkBtn: 'linkBtn',
  link: 'link',
} as const;

export const align = {
  center: 'center',
  inherit: 'inherit',
  justify: 'justify',
  left: 'left',
  right: 'right',
} as const;

export const type = {
  secondary: 'secondary',
  strong: 'strong',
  link: 'link',
  icon: 'icon',
  menu: 'menu',
  flex: 'flex',
  iconButton: 'iconButton',
} as const;

interface ITypographyProps {
  className?: string;
  component?: React.FC<any>;
  variant?: keyof typeof variant;
  paragraph?: boolean;
  variantMapping?: any;
  noWrap?: boolean;
  flexFix?: boolean;
  style?: CSSProperties;
  align?: keyof typeof align;
  children?: React.ReactNode;
  mb?: number | string;
  ml?: number | string;
  mr?: number | string;
  mt?: number | string;
  type?: keyof typeof type;
  onClick?: () => void;
  fontSize?: number;
  h5FontSize?: number;
  color?: string;
  componentProps?: any;
  title?: string;
  maxWidth?: number;
  exact?: boolean;
}

const Typography = forwardRef<HTMLInputElement, ITypographyProps>(
  (props, ref) => {
    const {
      component,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      variant = 'body',
      variantMapping = defaultVariantMapping,
      paragraph,
      className,
      style,
      noWrap,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      align = 'inherit',
      mb = 0,
      ml = 0,
      mr = 0,
      mt = 0,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      type,
      color,
      fontSize,
      h5FontSize,
      componentProps = {},
      title,
      maxWidth,
      flexFix,
      ...other
    } = props;

    const Component =
      component ||
      (paragraph ? 'p' : variant && variantMapping?.[variant]) ||
      'span';
    const alginStyle = align && styles[align];
    const typeClass = styles[`${variant}-${type}`] || '';

    const [typographyRef, rect] = useMeasure();
    const [isNativeEllipsis, setIsNativeEllipsis] = useState<boolean>(false);

    useEffect(() => {
      const currentIsNativeEllipsis =
        title && rect.offsetWidth < rect.scrollWidth;
      if (currentIsNativeEllipsis !== isNativeEllipsis) {
        setIsNativeEllipsis(Boolean(currentIsNativeEllipsis));
      }
    }, [rect]);

    const render = createElement(Component, {
      className: classnames(
        variant && styles[variant],
        typeClass,
        alginStyle,
        className,
        {
          [styles.noWrap]: noWrap,
          [styles.flexFix]: flexFix,
          [styles[color as any]]: color,
        },
      ),
      style: {
        marginBottom: mb,
        marginLeft: ml,
        marginRight: mr,
        marginTop: mt,
        fontSize,
        maxWidth,
        ...style,
      },
      ...componentProps,
      ...other,
      ref: composeRef(typographyRef, ref),
    });

    if (isNativeEllipsis) {
      return <Tooltip title={title}>{render}</Tooltip>;
    }

    return render;
  },
);

export default Typography;
