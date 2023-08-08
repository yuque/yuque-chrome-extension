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

  const fetchVersion = async () => {
    fetchAndParseXML('https://app.nlark.com/yuque-chrome-extension/updates.xml')
      .then(res => {
        setVersion(res);
      })
      .catch(err => {
        console.log(err, 'retrive update_url failed');
      });
  };

  useEffect(() => {
    const manifest = Chrome.runtime.getManifest();
    if (process.env.NODE_ENV !== 'production') {
      console.log('update_url: %s', manifest?.update_url);
    }

    if (manifest?.update_url) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      // 3s 没有请求成功判定为不能访问外网，走插件内更新逻辑
      fetch(manifest.update_url, { signal: controller.signal })
        .then(res => {
          if (res.status !== 200) {
            fetchVersion();
          }
        })
        .catch(() => {
          fetchVersion();
        })
        .finally(() => {
          clearTimeout(id);
        });
    }
  }, []);

  return version;
}
