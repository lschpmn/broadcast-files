import { Card, CardContent, Paper } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { getDirectoryListSendServer } from '../../lib/reducers';
import { State } from '../../types';
import PathHeader from './PathHeader';

const NewDirectory = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const list = useSelector((state: State) => state.directoryList.list);

  useEffect(() => {
    dispatch(getDirectoryListSendServer(decodeURIComponent(pathname)));
  }, [pathname]);

  return (
    <div>
      <PathHeader/>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {list.map(item => (
          <Link style={{ flex: 1, maxWidth: '15rem', display: 'flex', justifyContent: 'center' }} key={item.name} to={`${pathname}/${encodeURIComponent(item['name'])}`}>
            <Card style={{ margin: '1rem', width: '10rem', overflowWrap: 'anywhere' }}>
              <CardContent>
                Name: {item.name}<br/><br/>
                Type: {item.type}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NewDirectory;