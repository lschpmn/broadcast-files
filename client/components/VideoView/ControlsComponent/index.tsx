import { AppBar, Toolbar, Typography } from '@mui/material';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { getTimeStr, useOpacity } from '../../../lib/utils';
import AutoplayComponent from './AutoplayComponent';
import PlayComponent from './PlayComponent';
import SliderComponent from './SliderComponent';

type Props = {
  duration: number,
  isPlaying: boolean,
  offsetTime: number,
  setOffsetTime: (time: number) => void,
  video: HTMLVideoElement,
};

const ControlsComponent = ({ duration, isPlaying, offsetTime, setOffsetTime, video }: Props) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [opacity] = useOpacity(isPlaying);

  const setTime = useCallback((relativeTime: number) => {
    setCurrentTime(prevTime => {
      const newTime = prevTime + relativeTime;
      if (newTime < 0) {
        video.currentTime = 0
        setOffsetTime(0);
        return 0;
      } else if (newTime > duration) {
        setOffsetTime(duration - 1);
        return duration - 1;
      } else if (newTime >= offsetTime && newTime <= offsetTime + video.duration) {
        video.currentTime = newTime - offsetTime;
        return newTime;
      } else {
        setOffsetTime(newTime);
        return newTime;
      }
    });
  }, [duration, offsetTime, setCurrentTime, setOffsetTime, video]);

  useEffect(() => {
    const getCurrTime = () => setCurrentTime(offsetTime + Math.round(video?.currentTime || 0));
    if (isPlaying) {
      const intervalId = setInterval(getCurrTime, 1000);

      if (video?.paused) video.play().catch(noop);

      return () => clearInterval(intervalId);
    }
    getCurrTime();
  }, [isPlaying, offsetTime]);

  useEffect(() => {
    if (opacity <= 0) video && (video.style.cursor = 'none');
    else video && (video.style.cursor = 'auto');
  }, [opacity]);

  return (
    <AppBar position="absolute" style={{ bottom: 0, opacity: opacity, top: 'auto', zIndex: opacity > 0 ? 100 : -100 }}>
      <Toolbar style={{ display: 'flex', flexDirection: 'column' }}>
        <SliderComponent currentTime={currentTime} duration={duration} setTime={setTime}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <PlayComponent currentTime={currentTime} isPlaying={isPlaying} setTime={setTime} video={video}/>

          <Typography style={{ margin: '0 1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ margin: '0 0.5rem' }}>{getTimeStr(currentTime)}</span>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            <span style={{ margin: '0 0.5rem' }}>{getTimeStr(duration)}</span>
          </Typography>

          <div style={{ flex: 1 }}/>
          <AutoplayComponent isPlaying={isPlaying} video={video}/>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default ControlsComponent;