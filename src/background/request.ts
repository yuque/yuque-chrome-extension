import { REQUEST_HEADER_VERSION, siteName } from '@/config';

const isInChromeExtension = (list: any[]) => list.find(item => item.name.includes(REQUEST_HEADER_VERSION));

// eslint-disable-next-line
console.log(siteName, isInChromeExtension);
