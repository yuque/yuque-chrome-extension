import React from 'react';
import Icon, { LinkOutlined } from '@ant-design/icons';
import ClipperSvg from '@/assets/svg/clipper.svg';
import OcrIconSvg from '@/assets/svg/ocr-icon.svg';
import { ClippingTypeEnum } from '@/isomorphic/sandbox';

export const SELECT_TYPES = [
  {
    key: ClippingTypeEnum.area,
    enabled: true,
    get label() {
      return __i18n('剪藏选取的内容');
    },
    icon: <Icon component={ClipperSvg} />,
  },
  {
    key: ClippingTypeEnum.website,
    enabled: true,
    get label() {
      return __i18n('剪藏网址');
    },
    icon: <LinkOutlined />,
  },
  {
    key: ClippingTypeEnum.screenShot,
    enabled: true,
    get label() {
      return __i18n('截图识别文字');
    },
    icon: <Icon component={OcrIconSvg} />,
  },
];
