import makeStyles from '@material-ui/core/styles/makeStyles';
import { InspectResult } from 'fs-jetpack/types';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ThumbnailMap, useThumbnails } from '../../lib/hooks';
import { get } from '../../lib/utils';
import DirectoryNode from './DirectoryNode';
import FileNode from './FileNode';
import PathHeader from './PathHeader';

const RESIZE_FACTOR = 0.3;

const DirectoryList = () => {
  const classes = useStyles({});
  const { pathname } = useLocation();
  const [list, setList] = useState([] as InspectResult[]);
  const [thumbnailMap, setThumbnailMap] = useState({} as ThumbnailMap);

  useEffect(() => {
    get(`/dir${pathname}`)
      .then(setList)
      .catch(console.log);
  }, [pathname]);

  useThumbnails(list, setList, setThumbnailMap, pathname);

  return <div>
    <PathHeader setList={setList}/>

    <div className={classes.contentContainer}>
      {list.map(node =>
        node.type === 'dir'
          ? <DirectoryNode key={node.name} directory={node}/>
          : <FileNode key={node.name} file={node} thumbnail={thumbnailMap[node.name]}/>,
      )}
      <Filler/>
    </div>
  </div>;
};

const Filler = () => {
  const fills = new Array(10)
    .fill(null)
    .map((a, i) => <span key={i} style={{ padding: '1rem', width: 854 * RESIZE_FACTOR }}/>);
  return <>
    {fills}
  </>;
};

const useStyles = makeStyles({
  contentContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});

export default DirectoryList;
