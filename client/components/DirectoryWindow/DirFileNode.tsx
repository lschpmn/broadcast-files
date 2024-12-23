import { Card, CardActionArea, CardContent } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { VIDEO_PREFIX } from '../../../constants';
import { State } from '../../types';

type Props = {
  pathname: string,
};

const DirFileNode = ({ pathname }: Props) => {
  const item = useSelector((state: State) => state.nodeShrub[pathname]);

  const targetPath = item.pathname.split('/').map(encodeURIComponent).join('/');

  return (
    <Link to={item.type === 'dir' ? targetPath : VIDEO_PREFIX + targetPath}>
      <Card raised style={{ margin: '1rem', width: '20rem', overflowWrap: 'anywhere' }}>
        <CardActionArea style={{ fontSize: 16 }}>
          <CardContent>
            {item.pathname.split('/').slice(-1)}<br/><br/>
            Type: {item.type}
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default DirFileNode;
