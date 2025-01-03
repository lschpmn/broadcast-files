import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { inspectNodeSendServer } from '../../lib/reducers';
import { selectSortedNodeList, useAction, useMyPath } from '../../lib/utils';
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
        {Array(4).fill(0).map((_, i) => (
          <div key={i} style={{ margin: '1rem', width: 300 }}/>
        ))}
      </div>
    </div>
  );
};

export default DirectoryWindow;
