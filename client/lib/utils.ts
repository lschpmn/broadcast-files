import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { VIDEO_EXTENSIONS } from '../../constants';
import { State } from '../types';

const OPACITY = 0.95;
const FRAMES = 33;
const TIMEOUT = 2000;
const RATE = OPACITY / FRAMES / TIMEOUT * 1000;

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

export const useOpacity = (isPlaying: boolean): [opacity: number] => {
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const [opacity, setOpacity] = useState(OPACITY);

  useEffect(() => {
    if (isPlaying && !isMouseMoving) {
      const intervalId = setInterval(() => {
        setOpacity(p => {
          if (p < 0) {
            clearInterval(intervalId);
          }
          return p - RATE;
        });
      }, FRAMES);

      return () => clearInterval(intervalId);
    } else {
      setOpacity(OPACITY);
    }
  }, [isPlaying, isMouseMoving]);

  useEffect(() => {
    const start = debounce(() => setIsMouseMoving(true), TIMEOUT, { leading: true, trailing: false });
    const end = debounce(() => setIsMouseMoving(false), TIMEOUT, { leading: false, trailing: true });

    const lisenter = () => {
      start();
      end();
    }

    document.addEventListener('mousemove', lisenter);
    return () => document.removeEventListener('mousemove', lisenter);
  }, []);

  return [opacity];
};