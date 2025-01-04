import { Pause, PlayArrow, PlaylistAddCheck, PlaylistRemove } from '@mui/icons-material'
import { AppBar, IconButton, Slider, Toolbar } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { STREAM_PREFIX } from '../../constants';
import { FileDetail } from '../../types';
import { inspectNodeSendServer } from '../lib/reducers';
import { isVideoFile, selectSortedNodeList, useAction, useMyPath } from '../lib/utils';
import { State } from '../types';

const VideoView = () => {
  const [pathname, paths] = useMyPath();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const navigate = useNavigate();
  const videoFile: FileDetail = useSelector((state: State) => state.nodeShrub[pathname], isEqual);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parentPath = '/' + paths.slice(0, -1).join('/');
  const videoPath = STREAM_PREFIX + '/' + paths.join('/');
  const videoList: string[] = useSelector(selectSortedNodeList(parentPath), isEqual).filter(isVideoFile);

  const changeCurrentTime = (v: number) => {
    const newCurrentTime = v * 0.01 * videoFile?.videoDetail?.duration;
    console.log(newCurrentTime);
  };

  const playPauseFunc = () => {
    const videoElem = videoRef.current;
    if (!isPlaying && videoElem.paused) videoElem.play();
    else if (isPlaying && !videoElem.paused) videoElem.pause();
  };

  useEffect(() => {
    const videoElem = videoRef.current = document.querySelector('video');
    videoElem.addEventListener('play', () => setIsPlaying(true));
    videoElem.addEventListener('pause', () => setIsPlaying(false));

    inspectNodeAction(pathname);
  }, []);

  useEffect(() => {
    const videoElem = videoRef.current;
    if (!isPlaying && videoElem.currentTime === videoElem.duration && isAutoplaying) {
      const currentIndex = videoList.indexOf(pathname);
      const next = videoList[currentIndex + 1];
      if (currentIndex !== -1 && next) navigate(next);
    }

    if (isPlaying) {
      const getCurrTime = () => {
        const video = videoRef.current;
        setCurrentTime(Math.round(video.currentTime));
      };
      getCurrTime();
      const intervalId = setInterval(getCurrTime, 1000);

      return () => clearInterval(intervalId);
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

            <div style={{ flex: 1, margin: '0 1rem', display: 'flex' }}>
              <Slider
                onChange={(_, v) => changeCurrentTime(v as number)}
                style={{ margin: '0 0.5rem' }}
                value={((currentTime / videoFile?.videoDetail?.duration) || 0) * 100}
              />
              <div style={{ margin: '0 0.5rem' }}>{getTimeStr(currentTime)}</div>
              <div style={{ margin: '0 0.5rem' }}>/</div>
              <div style={{ margin: '0 0.5rem' }}>{getTimeStr(videoFile?.videoDetail?.duration)}</div>
            </div>

            <IconButton onClick={() => setIsAutoplaying(!isAutoplaying)}>
              {isAutoplaying ? <PlaylistAddCheck/> : <PlaylistRemove/>}
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
};

const getTimeStr = (duration: number) => {
  let returnStr = '';

  if (duration > 3600) {
    returnStr += `${Math.floor(duration / 3600)}:`;
  }
  if (duration > 60) {
    returnStr += `${Math.floor(duration / 60) % 60}:`;
  }

  returnStr += `${Math.floor(duration % 60)}`;

  return returnStr;
};

export default VideoView;