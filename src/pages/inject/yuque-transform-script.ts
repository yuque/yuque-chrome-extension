window.addEventListener('message', e => {
  const messageKey = 'tarnsfromYuqueContent';
  if (e.data?.key !== messageKey) {
    return;
  }
  const { data } = e.data || {};
  const editorBody = document.querySelector('.ne-viewer-body');
  const ids = data.ids || [];
  const result: string[] = [];
  for (const id of ids) {
    try {
      const html = (editorBody as any)?._neRef?.document.viewer.execCommand('getNodeContent', id, 'text/html');
      if (html) {
        result.push(html);
      }
    } catch (error) {
      //
    }
  }
  window.postMessage(
    {
      key: 'tarnsfromYuqueContentValue',
      data: { result },
    },
    '*',
  );
});
