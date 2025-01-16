import { Typography } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { inspectNodeSendServer } from '../lib/reducers';
import { useAction, useMyPath } from '../lib/utils';
import { State } from '../types';
import DirectoryView from './DirectoryView';
import VideoView from './VideoView';

const SwitchView = () => {
  const [pathname] = useMyPath();
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const type: string | null = useSelector((state: State) => state.nodeShrub[pathname]?.type, isEqual);

  useEffect(() => {
    inspectNodeAction(pathname);
  }, [pathname]);

  return (
    <div>
      {!type && (
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h1" color="textPrimary">Wait Motherfucker,</Typography>
          <Typography variant="h1" color="textPrimary">I'm Loading!</Typography>
        </div>
      )}
      {type === 'dir' && <DirectoryView />}
      {type === 'file' && <VideoView />}
    </div>
  );
};

export default SwitchView;