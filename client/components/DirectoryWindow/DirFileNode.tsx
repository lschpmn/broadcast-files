import { Card, CardActionArea, CardContent } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DOWNLOAD_PREFIX } from '../../../constants';
import { State } from '../../types';

type Props = {
  name: string,
  pathname: string,
};

const DirFileNode = ({ name, pathname }: Props) => {
  const item = useSelector((state: State) => state.directoryList.list.find(n => n.name === name));
  const targetPath = `${pathname}/${encodeURIComponent(item.name)}`;

  const WrapperLink = item.type === 'dir'
    ? (props) => <Link to={targetPath}>{props.children}</Link>
    : (props) => <a href={DOWNLOAD_PREFIX + targetPath} target="_blank">{props.children}</a>;

  return (
    <WrapperLink>
      <Card raised style={{ margin: '1rem', width: '20rem', overflowWrap: 'anywhere' }}>
        <CardActionArea style={{ fontSize: 16 }}>
          <CardContent>
            {item.name}<br/><br/>
            Type: {item.type}
          </CardContent>
        </CardActionArea>
      </Card>
    </WrapperLink>
  );
};

export default DirFileNode;
