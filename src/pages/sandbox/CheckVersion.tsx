import { useState, useEffect } from 'react';

async function fetchAndParseXML(): Promise<string | undefined> {
  const response = await fetch('https://app.nlark.com/yuque-chrome-extension/updates.xml');
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
  const [version, setVersion] = useState<string | undefined>();

  useEffect(() => {
    fetchAndParseXML().then(res => {
      setVersion(res);
    });
  }, []);

  return version;
}
