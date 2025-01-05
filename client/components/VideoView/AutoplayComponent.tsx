import { PlaylistAddCheck, PlaylistRemove } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { inspectNodeSendServer } from '../../lib/reducers';
import { isVideoFile, selectSortedNodeList, useAction, useMyPath } from '../../lib/utils';

type Props = {
  ended: boolean,
  isPlaying: boolean,
};

const AutoplayComponent = ({ ended, isPlaying }: Props) => {
  const [pathname, paths] = useMyPath();
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const navigate = useNavigate();
  const parentPath = '/' + paths.slice(0, -1).join('/');
  const videoList: string[] = useSelector(selectSortedNodeList(parentPath), isEqual).filter(isVideoFile);

  useEffect(() => {
    inspectNodeAction(parentPath);
  }, []);

  useEffect(() => {
    if (!isPlaying && isAutoplaying && ended) {
      const currentIndex = videoList.indexOf(pathname);
      const next = videoList[currentIndex + 1];
      if (currentIndex !== -1 && next) navigate(next);
    }

  }, [isPlaying]);

  return (
    <IconButton onClick={() => setIsAutoplaying(!isAutoplaying)}>
      {isAutoplaying ? <PlaylistAddCheck/> : <PlaylistRemove/>}
    </IconButton>
  );
};

export default AutoplayComponent;
