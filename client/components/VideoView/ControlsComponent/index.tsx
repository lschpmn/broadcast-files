import { AppBar, Toolbar, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { getTimeStr, useOpacity } from '../../../lib/utils';
import AutoplayComponent from './AutoplayComponent';
import PlayComponent from './PlayComponent';
import SliderComponent from './SliderComponent';

type Props = {
  currentTime: number,
  duration: number,
  isPlaying: boolean,
  setTime: (time: number) => void,
  video: HTMLVideoElement,
};

const ControlsComponent = ({ currentTime, duration, isPlaying, setTime, video }: Props) => {
  const [opacity] = useOpacity(isPlaying);

  useEffect(() => {
    if (opacity < 0) video && (video.style.cursor = 'none');
    else video && (video.style.cursor = 'auto');
  }, [opacity]);

  return (
    <AppBar position="absolute" style={{ bottom: 0, opacity: opacity, top: 'auto', zIndex: opacity > 0 ? 100 : -100 }}>
      <Toolbar style={{ display: 'flex', flexDirection: 'column' }}>
        <SliderComponent currentTime={currentTime} duration={duration} setTime={setTime}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <PlayComponent isPlaying={isPlaying} video={video}/>
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