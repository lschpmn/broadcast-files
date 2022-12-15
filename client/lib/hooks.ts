import { InspectResult } from 'fs-jetpack/types';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Message } from '../types';
import { stream } from './utils';

export const useThumbnails = (
  list: InspectResult[],
  setList: Dispatch<SetStateAction<InspectResult[]>>,
  setThumbnailMap: Dispatch<SetStateAction<ThumbnailMap>>,
  pathname: string,
) => {
  useEffect(() => {
    const listener = (messages: Message[]) => {
      const messageMap = {} as ThumbnailMap;
      messages.forEach(message => messageMap[message.name] = message);

      setThumbnailMap(thumbnailMap => ({
        ...thumbnailMap,
        ...messageMap,
      }));
    };

    if (list.find(node => node.type === 'file')) {
      stream(`/thumbnails${pathname}`, listener).catch(console.log);
    }
  }, [list]);
}

export type ThumbnailMap = {
  [s: string]: Message,
};
