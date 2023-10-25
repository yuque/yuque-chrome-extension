try {
  // eslint-disable-next-line no-undef
  importScripts('background.js');
} catch (e) {
  console.error('import background.js error', e);
}
