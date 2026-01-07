import React from 'react';
import { useMyPath } from '../lib/utils';

const ImageView = () => {
  const [pathname, paths] = useMyPath();
  console.log(pathname, paths);

  return (
    <div>
      hey there!
    </div>
  );
};

export default ImageView