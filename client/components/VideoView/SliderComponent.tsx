import { Slider } from '@mui/material';
import React, { useState } from 'react';
import { getTimeStr } from '../../lib/utils';

type Props = {
  currentTime: number,
  duration: number,
  setTime: (time: number) => void,
};

const SliderComponent = ({ currentTime, duration, setTime }: Props) => {
  const [internalTime, setInternalTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const changeCurrentTime = (v: number) => {
    setIsHovering(true);
    const newCurrentTime = v * 0.01 * duration;
    setInternalTime(newCurrentTime);
  };

  const commitTime = () => {
    setIsHovering(false);
    setTime(internalTime);
  }

  const val = isHovering ? internalTime : currentTime;

  return (
    <Slider
      onChange={(e, v) => changeCurrentTime(v as number)}
      onChangeCommitted={commitTime}
      step={0.01}
      style={{ flex: 1, margin: '0 0.5rem' }}
      value={val / duration * 100}
      valueLabelDisplay="auto"
      valueLabelFormat={v => getTimeStr(v * 0.01 * duration)}
    />
  );
};

export default SliderComponent;