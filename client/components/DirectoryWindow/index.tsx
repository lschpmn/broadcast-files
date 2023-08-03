import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getDirectoryListSendServer } from '../../lib/reducers';
import { State } from '../../types';
import DirFileNode from './DirFileNode';

const NewDirectory = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const list: { name: string, type: 'file' | 'dir' }[] = useSelector(listGrabber, isEqual);

  useEffect(() => {
    dispatch(getDirectoryListSendServer(decodeURIComponent(pathname)));
  }, [pathname]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '0 2rem' }}>
        {list.map(item => (
          <DirFileNode
            key={item.name}
            name={item.name}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
};

const listGrabber = (state: State) =>
  state.directoryList.list.map(item => ({ name: item.name, type: item.type }));

export default NewDirectory;
