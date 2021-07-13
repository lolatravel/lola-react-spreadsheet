import React from 'react';
import DataGrid from '../../src';
import './AllFeatures.less';

const columns = [
    { key: 'id', name: 'ID' },
    { key: 'title', name: 'Title', editable: true }
  ];
  
  const rows = [
    { id: 0, title: 'Example' },
    { id: 1, title: 'Demo' }
  ];
  
  export function BasicFeatures() {
    return (
        <div className="all-features">
            <DataGrid
                columns={columns}
                rows={rows}
            />
            </div>
    );
  }

BasicFeatures.storyName = 'Basic Usage';
