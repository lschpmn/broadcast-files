import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Card, CardActionArea, CardContent, CardMedia, styled, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { State } from '../../types';

type Props = {
  pathname: string,
};

const NodeItem = ({ pathname }: Props) => {
  const item = useSelector((state: State) => state.nodeShrub[pathname]);
  const paths = item.pathname.split('/').slice(1);

  const targetPath = '/' + paths.map(encodeURIComponent).join('/');

  return (
    <Link to={item.type === 'dir' ? targetPath : targetPath}>
      <Card raised style={{ margin: '1rem', width: 300, overflowWrap: 'anywhere' }}>
        <CardActionArea>
          <CardMedia style={{ height: 168, width: '100%' }}>
            {item.type === 'dir'
              ? <FolderIcon style={{ height: '100%', width: '100%' }}/>
              : <InsertDriveFileIcon style={{ height: '100%', width: '100%' }}/>}
          </CardMedia>
          <CardContent>
            <Title>{paths.slice(-1)}</Title>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
};

const Title = styled(Typography)`
    font-weight: bold;
    height: 2rem;
    line-height: 1rem;
    text-overflow: ellipsis;
    overflow: hidden;
`;

export default NodeItem;
