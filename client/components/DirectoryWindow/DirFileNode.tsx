import { Card, CardActionArea, CardContent } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { VIDEO_PREFIX } from '../../../constants';
import { State } from '../../types';

type Props = {
  name: string,
  pathname: string,
};

const DirFileNode = ({ name, pathname }: Props) => {
  const item = useSelector((state: State) => state.directoryList.list.find(n => n.name === name));

  const targetPath = `${pathname}/${encodeURIComponent(name)}`;

  return (
    <Link to={item.type === 'dir' ? targetPath : VIDEO_PREFIX + targetPath}>
      <Card raised style={{ margin: '1rem', width: '20rem', overflowWrap: 'anywhere' }}>
        <CardActionArea style={{ fontSize: 16 }}>
          <CardContent>
            {item.name}<br/><br/>
            Type: {item.type}
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

export default DirFileNode;
