import { AppBar, Toolbar, Typography } from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { STREAM_PREFIX } from '../../../constants';
import { FileDetail } from '../../../types';
import { inspectNodeSendServer } from '../../lib/reducers';
import { getTimeStr, useAction, useMyPath } from '../../lib/utils';
import { State } from '../../types';
import AutoplayComponent from './AutoplayComponent';
import PlayComponent from './PlayComponent';
import SliderComponent from './SliderComponent';

const VideoView = () => {
  const [pathname, paths] = useMyPath();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [offsetTime, setOffsetTime] = useState(0);
  const inspectNodeAction = useAction(inspectNodeSendServer);
  const videoFile: FileDetail = useSelector((state: State) => state.nodeShrub[pathname], isEqual);
  const videoRef = useRef<HTMLVideoElement>(null);
  const duration = videoFile?.videoDetail?.duration || 0;
  const videoPath = STREAM_PREFIX + '/' + paths.join('/');

  const setTime = (time: number) => {
    setOffsetTime(time);
    setCurrentTime(time);
  };

  useEffect(() => {
    const videoElem = videoRef.current = document.querySelector('video');
    videoElem.addEventListener('play', () => setIsPlaying(true));
    videoElem.addEventListener('pause', () => setIsPlaying(false));
  }, []);

  useEffect(() => {
    inspectNodeAction(pathname);
    setOffsetTime(0);
    setCurrentTime(0);
  }, [pathname]);

  useEffect(() => {
    if (isPlaying) {
      const getCurrTime = () => setCurrentTime(offsetTime + Math.round(videoRef.current.currentTime));
      const intervalId = setInterval(getCurrTime, 1000);
      const video = videoRef.current;

      if (video?.paused) video.play();

      getCurrTime();
      return () => clearInterval(intervalId);
    }
  }, [isPlaying, offsetTime]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <video controls style={{ height: '100vh', width: '100vw' }} src={videoPath + '?t=' + offsetTime}/>
      </div>
      <div>
        <AppBar position="relative">
          <Toolbar style={{ display: 'flex', flexDirection: 'column' }}>
            <SliderComponent currentTime={currentTime} duration={duration} setTime={setTime}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <PlayComponent isPlaying={isPlaying} video={videoRef.current}/>
              <Typography style={{ margin: '0 1rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ margin: '0 0.5rem' }}>{getTimeStr(currentTime)}</span>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <span style={{ margin: '0 0.5rem' }}>{getTimeStr(duration)}</span>
              </Typography>

              <div style={{ flex: 1 }}/>
              <AutoplayComponent ended={videoRef.current?.ended} isPlaying={isPlaying}/>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
};

export default VideoView;