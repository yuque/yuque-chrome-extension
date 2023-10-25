import { invert } from 'lodash';

export enum PlatformEnum {
  macOS = 'macOs',
  windows = 'windows',
}

// 支持设置为快捷键的特殊字符，key 是 keycode
const SPECIAL_KEY_MAP: { [key: number]: string } = {
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  219: '[',
  221: ']',
  222: "'",
};

// macOS 和 windows 的功能键排序
const META_ORDER = {
  [PlatformEnum.macOS]: ['metaKey', 'altKey', 'shiftKey', 'ctrlKey'],
  [PlatformEnum.windows]: ['ctrlKey', 'altKey', 'shiftKey'],
};

const EVENTKEY_TO_KEYBOARD = {
  [PlatformEnum.macOS]: {
    ctrlKey: '^',
    shiftKey: '⇧',
    metaKey: '⌘',
    altKey: '⌥',
  },
  [PlatformEnum.windows]: {
    ctrlKey: 'Ctrl',
    shiftKey: 'Shift',
    altKey: 'Alt',
  },
};

// 键盘功能键映射的快捷键配置
const KEYBOARD_TO_SHORTCUT = {
  [PlatformEnum.macOS]: {
    '⇧': 'Shift',
    '⌘': '⌘',
    '⌥': 'Alt',
    '^': 'Ctrl',
  },
  [PlatformEnum.windows]: {
    Ctrl: 'Ctrl',
    Shift: 'Shift',
    Alt: 'Alt',
  },
};

const SEP = {
  [PlatformEnum.macOS]: '+',
  [PlatformEnum.windows]: '+',
};

interface IShortcutOptions {
  platform: PlatformEnum;
}

class Shortcut {
  private keyBoardStringSep: string;
  private keyBoardToShortcut: any;
  private metaOrder: string[];
  private eventKeyToKeyboard: { [key: string]: string };
  // 快捷键分隔符
  private shortcutSep = '+';
  private shortcutToKeyboard: any;
  constructor(options: IShortcutOptions) {
    const { platform } = options;
    this.eventKeyToKeyboard = EVENTKEY_TO_KEYBOARD[platform];
    // 键盘按钮快捷键的映射
    this.keyBoardToShortcut = KEYBOARD_TO_SHORTCUT[platform];
    // 不同平台展示快捷键的分隔符
    this.keyBoardStringSep = SEP[platform];
    // 展示快捷键时的功能键顺序
    this.metaOrder = META_ORDER[platform];
    this.shortcutToKeyboard = invert(this.keyBoardToShortcut);
  }

  /**
   * 快捷键必须以数字、字母和一些特殊字符结尾
   * @param {*} e
   * @param {*} lowerCase - mousetrap 的字母需要小写，支持配置回传大写还是小写
   */
  private getFinalKey(e: React.KeyboardEvent, lowerCase = false) {
    const { keyCode } = e;
    // 一些特殊字符
    if (SPECIAL_KEY_MAP?.[keyCode]) {
      return SPECIAL_KEY_MAP[keyCode];
    }
    // 字母 a-z
    if (keyCode >= 65 && keyCode <= 90) {
      const result = String.fromCharCode(keyCode);
      return lowerCase ? result.toLocaleLowerCase() : result;
    }
    // 数字 0-9
    if (keyCode >= 48 && keyCode <= 57) {
      return Number(keyCode) - 48;
    }
    // 数字
    return null;
  }

  // 获取按下了哪些功能键，并且需要保持顺序
  private getMetaKeyArr(e: React.KeyboardEvent) {
    const keyStringArr: string[] = [];
    const { eventKeyToKeyboard, metaOrder } = this;
    metaOrder.forEach(item => {
      if (e[item as keyof React.KeyboardEvent]) {
        keyStringArr.push(eventKeyToKeyboard[item]);
      }
    });
    return keyStringArr;
  }

  /**
   * 根据键盘输入返回快捷键，必须输入英文数字或者指定的特殊字符
   * @param {*} e
   */
  getShortcutByKeyboard(e: React.KeyboardEvent) {
    const finalKey = this.getFinalKey(e);
    const metaKeyArr = this.getMetaKeyArr(e);
    // 快捷键必须以功能键开始，没按下功能键什么也不展示
    if (!metaKeyArr || !metaKeyArr.length) {
      return {
        keyboardString: null,
      };
    }
    // 如果没输入到最后需要的字符，代表还未输入完成，不返回快捷键
    if (finalKey === null) {
      return {
        keyboardString: metaKeyArr.join(this.keyBoardStringSep),
      };
    }

    const shortcut = [...this.metaKeyToShortcut(metaKeyArr), finalKey].join(
      this.shortcutSep,
    );
    return {
      keyboardString: this.shortcutToShowString(shortcut),
      shortcut,
    };
  }

  /**
   * 把键盘的功能键转换成快捷键的
   */
  private metaKeyToShortcut(metaKeyArr: string[]) {
    const { keyBoardToShortcut } = this;
    return metaKeyArr.map(item => {
      if (keyBoardToShortcut[item]) {
        return keyBoardToShortcut[item];
      }
      return item;
    });
  }

  /**
   * 快捷键转成对应平台的展示文案
   * @param {string} shortcut
   */
  shortcutToShowString(shortcut: string) {
    const { shortcutToKeyboard, keyBoardStringSep, shortcutSep } = this;
    return shortcut
      .split(shortcutSep)
      .map(item => {
        return shortcutToKeyboard[item] || item;
      })
      .join(keyBoardStringSep);
  }
}

export default Shortcut;
