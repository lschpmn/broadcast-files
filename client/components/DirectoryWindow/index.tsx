import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { inspectNodeSendServer } from '../../lib/reducers';
import { useAction, useMyPath } from '../../lib/utils';
import { State } from '../../types';
import NodeItem from './NodeItem';

const DirectoryWindow = () => {
  const [pathname] = useMyPath();
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const nodeList: string[] = useSelector(selectSortedNodeList(pathname), isEqual);

  useEffect(() => {
    inspectNodeAction(pathname);
  }, [pathname]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '0 2rem' }}>
        {nodeList.map(name => (
          <NodeItem
            key={name}
            pathname={name}
          />
        ))}
        {Array(4).fill((
          <div style={{ margin: '1rem', width: 300 }}/>
        ))}
      </div>
    </div>
  );
};

const selectSortedNodeList = (pathname: string) => (state: State) => {
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

export default DirectoryWindow;
