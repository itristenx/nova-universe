import React, { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { Pagination } from './Pagination';
import { Tabs } from './Tabs';
import { Drawer } from './Drawer';
import { Stepper } from './Stepper';
import { Accordion } from './Accordion';
import { Menu } from './Menu';
import { Snackbar } from './Snackbar';
import { Skeleton } from './Skeleton';

export const Showcase: React.FC = () => {
  const [progress, setProgress] = useState(40);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  return (
    <div className="showcase">
      <h2>ProgressBar</h2>
      <ProgressBar value={progress} />
      <button onClick={() => setProgress((p) => (p + 10) % 110)}>Inc Progress</button>
      <h2>Pagination</h2>
      <Pagination page={page} pageCount={5} onPageChange={setPage} />
      <h2>Tabs</h2>
      <Tabs
        tabs={[
          { label: 'Tab 1', content: 'Content 1' },
          { label: 'Tab 2', content: 'Content 2' },
        ]}
      />
      <h2>Drawer</h2>
      <button onClick={() => setDrawerOpen(true)}>Open Drawer</button>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="showcase-drawer-content">Drawer Content</div>
      </Drawer>
      <h2>Stepper</h2>
      <Stepper steps={[{ label: 'Step 1', completed: true }, { label: 'Step 2' }]} activeStep={1} />
      <h2>Accordion</h2>
      <Accordion
        items={[
          { label: 'Section 1', content: 'Accordion Content 1' },
          { label: 'Section 2', content: 'Accordion Content 2' },
        ]}
      />
      <h2>Menu</h2>
      <Menu
        buttonLabel="Open Menu"
        items={[
          { label: 'Item 1', onClick: () => alert('Item 1') },
          { label: 'Item 2', onClick: () => alert('Item 2') },
        ]}
      />
      <h2>Snackbar</h2>
      <button onClick={() => setSnackbarOpen(true)}>Show Snackbar</button>
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message="This is a snackbar!"
      />
      <h2>Skeleton</h2>
      <Skeleton size="md" />
    </div>
  );
};
