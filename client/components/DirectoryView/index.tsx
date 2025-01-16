import isEqual from 'lodash/isEqual';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectSortedNodeList, useMyPath } from '../../lib/utils';
import NodeItem from './NodeItem';

const DirectoryView = () => {
  const [pathname] = useMyPath();
  const nodeList: string[] = useSelector(selectSortedNodeList(pathname), isEqual);

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

export default DirectoryView;
