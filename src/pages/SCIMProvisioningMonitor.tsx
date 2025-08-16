import React from 'react';
import { TextField, Typography } from '@mui/material';

const MyComponent = ({ scimConfig, setSCIMConfig, manualSyncRunning }) => {
  return (
    <TextField
      label="Sync Interval (minutes)"
      type="number"
      value={scimConfig.syncInterval}
      onChange={(e) => setSCIMConfig((prev) => ({ ...prev, syncInterval: Number(e.target.value) }))}
      disabled={manualSyncRunning}
      endAdornment={<Typography variant="caption">0 = manual only</Typography>}
    />
  );
};

export default MyComponent;
