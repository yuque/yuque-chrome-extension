import { get as safeGet } from 'lodash';
import proxy from './proxy';

async function urlToFile(url: string, filename: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching the image from URL: ${url}`);
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } catch (error) {
    console.error('Error in urlToFile:', error);
    throw error;
  }
}

function isRelativePath(url: string) {
  try {
    new URL(url);
    return false;
  } catch (e) {
    return true;
  }
}

async function uploadImage(imageUrl: string, noteId: string) {
  const pathMatch = imageUrl.match(/\/static[^\s]+/);
  if (pathMatch) {
    imageUrl = pathMatch[0];
  }

  if (isRelativePath(imageUrl)) {
    imageUrl = chrome.runtime.getURL(imageUrl);
  }

  const file = await urlToFile(imageUrl, 'image.jpg');
  const response = await proxy.upload.attach(file, noteId);
  const uploadedImageUrl = safeGet(response, 'data.url');
  return uploadedImageUrl;
}

async function processHtmlString(htmlString: string, noteId: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const images = doc.querySelectorAll('img');
  for (const img of images) {
    const originalSrc = img.src;
    const newSrc = await uploadImage(originalSrc, noteId);
    img.src = newSrc;
  }

  return doc.documentElement.innerHTML;
}

export default async function processHtmls(htmls: string[], noteId: string) {
  const processedHtmlPromises = htmls.map(html =>
    processHtmlString(html, noteId),
  );
  const processedHtmls = await Promise.all(processedHtmlPromises);
  return processedHtmls;
}
