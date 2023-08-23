import { ITag } from '@/core/proxy/tag';
import { createContext } from 'react';

interface ITagContext {
  tags: ITag[];
  selectTags: ITag[],
  updateSelectTags?: (ids: number[]) => void;
  updateTags?: (item: ITag[]) => void;
}

export const TagContext = createContext<ITagContext>({
  tags: [],
  selectTags: [],
});
