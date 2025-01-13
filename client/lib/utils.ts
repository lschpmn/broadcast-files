import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { VIDEO_EXTENSIONS } from '../../constants';
import { State } from '../types';

export const getTimeStr = (duration: number) => {
  let returnStr = '';

  if (duration > 3600) {
    const num = Math.floor(duration / 3600);
    returnStr += `${num > 9 ? num : '0' + num}:`;
  }
  if (duration > 60) {
    const num = Math.floor(duration / 60) % 60;
    returnStr += `${num > 9 ? num : '0' + num}:`;
  } else {
    returnStr += '00:';
  }

  const num = Math.floor(duration % 60);
  returnStr += `${num > 9 ? num : '0' + num}`;

  return returnStr;
};

export const isVideoFile = (file: string) =>
  VIDEO_EXTENSIONS.some(v => file.endsWith(v));

export const selectSortedNodeList = (pathname: string) => (state: State) => {
  const dir = state.nodeShrub[pathname];

  if (!dir) return [];
  if (dir.type === 'file') return [dir];
  if (!dir.nodePaths) return [];

  return dir.nodePaths
    .toSorted((a, b) => {
      const nA = state.nodeShrub[a];
      const nB = state.nodeShrub[b];

      if (nA.type === 'dir' && nB.type === 'file') return -1;
      if (nA.type === 'file' && nB.type === 'dir') return 1;
      else return a.localeCompare(b);
    });
};

export const useAction = <T extends Function>(action: T, deps?): T => {
  const dispatch = useDispatch();

  return useCallback((...args) =>
    dispatch(action(...args)), deps ? [dispatch, ...deps] : [dispatch]) as any;
};

export const useMyPath = (): [pathname: string, paths: string[]] => {
  const { pathname } = useLocation();

  return useMemo(() => {
    const decodedPathname = decodeURIComponent(pathname.replace(/^\/\w\//, '/'));
    const paths = decodedPathname.split('/').slice(1);

    return [decodedPathname, paths];
  }, [pathname]);
};