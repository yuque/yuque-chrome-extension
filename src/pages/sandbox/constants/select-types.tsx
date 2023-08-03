import React from 'react';
import Icon, { LinkOutlined } from '@ant-design/icons';

import ClipperSvg from '@/assets/svg/clipper.svg';

export const SELECT_TYPE_AREA = 'area-select';
export const SELECT_TYPE_BOOKMARK = 'bookmark';
export const SELECT_TYPE_SELECTION = 'selection';

export const SELECT_TYPES = [
  {
    key: SELECT_TYPE_AREA,
    enabled: true,
    get text() {
      return __i18n('剪藏选取的内容');
    },
    icon: <Icon component={ClipperSvg} />,
  },
  {
    key: SELECT_TYPE_BOOKMARK,
    enabled: true,
    get text() {
      return __i18n('剪藏网址');
    },
    icon: <LinkOutlined />,
  },
];
