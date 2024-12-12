import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDirectoryListSendServer } from '../../lib/reducers';
import { State } from '../../types';
import DirFileNode from './DirFileNode';
import { useAction, useMyPath } from '../../lib/utils';

const NewDirectory = () => {
  const [pathname] = useMyPath();
  const getDirectoryListAction = useAction(getDirectoryListSendServer);
  const list: { name: string, type: 'file' | 'dir' }[] = useSelector(listGrabber, isEqual);

  useEffect(() => {
    getDirectoryListAction(pathname);
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
        {Array(4).fill((
          <div style={{ width: '22rem' }}/>
        ))}
      </div>
    </div>
  );
};

const listGrabber = (state: State) =>
  state.directoryList.list.map(item => ({ name: item.name, type: item.type }));

export default NewDirectory;
