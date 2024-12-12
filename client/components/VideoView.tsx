import React, { useEffect } from 'react';
import { STREAM_PREFIX } from '../../constants';
import { getFileDetailsSendServer } from '../lib/reducers';
import { useAction, useMyPath } from '../lib/utils';

const VideoView = () => {
  const [pathname, paths] = useMyPath();
  const getFileDetailsAction = useAction(getFileDetailsSendServer);

  const videoPath = STREAM_PREFIX + '/' + paths.join('/');

  useEffect(() => {
    const videoElem = document.querySelector('video');
    videoElem.addEventListener('play', () => console.log('video playing'));
    videoElem.addEventListener('pause', () => console.log('video paused'));
    console.log(videoElem);
  }, []);

  useEffect(() => {
    getFileDetailsAction(pathname);
  }, [pathname]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <video controls src={videoPath}/>
      </div>
    </div>
  );
};

export default VideoView;