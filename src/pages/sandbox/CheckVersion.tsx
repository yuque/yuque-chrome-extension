import { useState, useEffect } from 'react';
import Chrome from '@/core/chrome';

async function fetchAndParseXML(updateUrl: string): Promise<string | undefined> {
  const response = await fetch(
    updateUrl,
    // 强制与 cdn 做校验是否可使用缓存内容
    { cache: 'no-cache' },
  );
  const xmlString = await response.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');

  // 获取根节点
  const root = xml.documentElement;

  // @ts-ignore
  const version = root.getElementsByTagName('updatecheck')[0]?.getAttribute?.('version');
  return version;
}

export function useCheckVersion(): string | undefined {
  const [ version, setVersion ] = useState<string | undefined>();

  useEffect(() => {
    const manifest = Chrome.runtime.getManifest();
    if (process.env.NODE_ENV !== 'production') {
      console.log('update_url: %s', manifest?.update_url);
    }

    if (manifest?.update_url) {
      // 官方商店的 update_url 跳过更新检查
      // https://clients2.google.com/service/update2/crx
      // https://edge.microsoft.com/extensionwebstorebase/v1/crx
      if (/(google|microsoft)\.com/.test(manifest.update_url)) {
        return;
      }

      fetchAndParseXML(manifest.update_url).then(res => {
        setVersion(res);
      }).catch(err => {
        console.log(err, 'retrive update_url failed');
      });
    }
  }, []);

  return version;
}
