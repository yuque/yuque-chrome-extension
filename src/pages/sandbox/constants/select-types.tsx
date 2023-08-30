import React from 'react';
import Icon, { LinkOutlined } from '@ant-design/icons';

import ClipperSvg from '@/assets/svg/clipper.svg';
import { isMac } from '@/utils/getPlatformInfo';

export const SELECT_TYPE_AREA = 'area-select';
export const SELECT_TYPE_BOOKMARK = 'bookmark';
export const SELECT_TYPE_SELECTION = 'selection';

export const SHORTCUT_MAP = {
  get [SELECT_TYPE_AREA]() {
    return isMac() ? '⌘+⌥+X' : 'Ctrl+Alt+X';
  },
  get [SELECT_TYPE_BOOKMARK]() {
    return isMac() ? '⌘+⌥+V' : 'Ctrl+Alt+V';
  },
} as const;

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
] as const;
