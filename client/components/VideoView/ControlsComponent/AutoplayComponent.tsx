import { PlaylistAddCheck, PlaylistRemove } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { inspectNodeSendServer } from '../../../lib/reducers';
import { isVideoFile, selectSortedNodeList, useAction, useMyPath } from '../../../lib/utils';

type Props = {
  isPlaying: boolean,
  video: HTMLVideoElement,
};

const AutoplayComponent = ({ isPlaying, video }: Props) => {
  const [pathname, paths] = useMyPath();
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const navigate = useNavigate();
  const parentPath = '/' + paths.slice(0, -1).join('/');
  const videoList: string[] = useSelector(selectSortedNodeList(parentPath), isEqual).filter(isVideoFile);

  useEffect(() => {
    inspectNodeAction(parentPath);

    if (isAutoplaying && video?.paused) {
      const playIt = () => {
        video.removeEventListener('loadeddata', playIt);
        video.play().catch(console.error);
      };
      video.addEventListener('loadeddata', playIt);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isPlaying && isAutoplaying && video.ended) {
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
