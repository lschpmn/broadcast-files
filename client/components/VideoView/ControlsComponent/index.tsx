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

  const setTime = useCallback((time: number) => {
    if (time < 0) return setTime(0);
    if (time > duration) return setTime(duration - 1);

    if (time >= offsetTime && time <= offsetTime + video.duration) {
      video.currentTime = time - offsetTime;
      setCurrentTime(time);
    } else {
      setOffsetTime(time);
      setCurrentTime(time);
    }
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