import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

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