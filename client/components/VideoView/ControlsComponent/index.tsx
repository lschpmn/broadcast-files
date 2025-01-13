import { AppBar, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { getTimeStr } from '../../../lib/utils';
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

  return (
    <AppBar position="absolute" style={{ bottom: 0, opacity: 0.75, top: 'auto' }}>
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
          <AutoplayComponent ended={video?.ended} isPlaying={isPlaying}/>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default ControlsComponent;