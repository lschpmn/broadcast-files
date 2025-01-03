import { Pause, PlayArrow, PlaylistAddCheck, PlaylistRemove } from '@mui/icons-material'
import { AppBar, IconButton, Toolbar } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { STREAM_PREFIX, VIDEO_PREFIX } from '../../constants';
import { inspectNodeSendServer } from '../lib/reducers';
import { isVideoFile, selectSortedNodeList, useAction, useMyPath } from '../lib/utils';

const VideoView = () => {
  const [pathname, paths] = useMyPath();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const parentPath = '/' + paths.slice(0, -1).join('/');
  const videoPath = STREAM_PREFIX + '/' + paths.join('/');
  const videoList: string[] = useSelector(selectSortedNodeList(parentPath), isEqual).filter(isVideoFile);

  const playPauseFunc = () => {
    const videoElem = videoRef.current;
    if (!isPlaying && videoElem.paused) videoElem.play();
    else if (isPlaying && !videoElem.paused) videoElem.pause();
  };

  useEffect(() => {
    const videoElem = videoRef.current = document.querySelector('video');
    videoElem.addEventListener('play', () => setIsPlaying(true));
    videoElem.addEventListener('pause', () => setIsPlaying(false));

    inspectNodeAction(parentPath);
  }, []);

  useEffect(() => {
    const videoElem = videoRef.current;
    if (!isPlaying && videoElem.currentTime === videoElem.duration && isAutoplaying) {
      const currentIndex = videoList.indexOf(pathname);
      const next = videoList[currentIndex + 1];
      if (currentIndex !== -1 && next) navigate(VIDEO_PREFIX + next);
    }
  }, [isPlaying]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <video controls style={{ height: '100vh', width: '100vw' }} src={videoPath}/>
      </div>
      <div>
        <AppBar position="relative">
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton onClick={() => playPauseFunc()}>
              {isPlaying ? <Pause/> : <PlayArrow/>}
            </IconButton>
            <div>
              <IconButton onClick={() => setIsAutoplaying(!isAutoplaying)}>
                {isAutoplaying ? <PlaylistAddCheck/> : <PlaylistRemove/>}
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
};

export default VideoView;