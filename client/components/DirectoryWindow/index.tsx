import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DirDetail } from '../../../types';
import { inspectNodeSendServer } from '../../lib/reducers';
import { useAction, useMyPath } from '../../lib/utils';
import { State } from '../../types';
import DirFileNode from './DirFileNode';

const DirectoryWindow = () => {
  const [pathname] = useMyPath();
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const dirDetail: DirDetail = useSelector((state: State) => state.nodeShrub[pathname], isEqual);

  useEffect(() => {
    inspectNodeAction(pathname);
  }, [pathname]);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', margin: '0 2rem' }}>
        {dirDetail?.nodePaths?.map(name => (
          <DirFileNode
            key={name}
            pathname={name}
          />
        ))}
        {Array(4).fill((
          <div style={{ width: '22rem' }}/>
        ))}
      </div>
    </div>
  );
};

export default DirectoryWindow;
