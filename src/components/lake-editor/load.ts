declare global {
  interface Window {
    Doc: any;
  }
}

// 最大等待时间10s
const LOAD_TIME_OUT = 10_000;

function isLakeEditorLoaded(win: Window & {Doc: any}) {
  return !!win.Doc;
}

export default function loadLakeEditor(win: Window & {Doc: any}) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    if (isLakeEditorLoaded(win)) {
      resolve(win.Doc);
      return;
    }
    const load = () => {
      if (isLakeEditorLoaded(win)) {
        resolve(win.Doc);
      } else if (Date.now() - start > LOAD_TIME_OUT) {
        reject(new Error('load lake editor timeout'));
      } else {
        setTimeout(load, 100);
      }
    };
    setTimeout(load, 100);
  });
}
