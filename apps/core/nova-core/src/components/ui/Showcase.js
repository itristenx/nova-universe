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
export const _Showcase = () => {
    const [progress, setProgress] = useState(40);
    const [page, setPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    return (React.createElement("div", { className: "showcase" },
        React.createElement("h2", null, "ProgressBar"),
        React.createElement(ProgressBar, { value: progress }),
        React.createElement("button", { onClick: () => setProgress((p) => (p + 10) % 110) }, "Inc Progress"),
        React.createElement("h2", null, "Pagination"),
        React.createElement(Pagination, { page: page, pageCount: 5, onPageChange: setPage }),
        React.createElement("h2", null, "Tabs"),
        React.createElement(Tabs, { tabs: [{ label: 'Tab 1', content: 'Content 1' }, { label: 'Tab 2', content: 'Content 2' }] }),
        React.createElement("h2", null, "Drawer"),
        React.createElement("button", { onClick: () => setDrawerOpen(true) }, "Open Drawer"),
        React.createElement(Drawer, { open: drawerOpen, onClose: () => setDrawerOpen(false) },
            React.createElement("div", { className: "showcase-drawer-content" }, "Drawer Content")),
        React.createElement("h2", null, "Stepper"),
        React.createElement(Stepper, { steps: [{ label: 'Step 1', completed: true }, { label: 'Step 2' }], activeStep: 1 }),
        React.createElement("h2", null, "Accordion"),
        React.createElement(Accordion, { items: [
                { label: 'Section 1', content: 'Accordion Content 1' },
                { label: 'Section 2', content: 'Accordion Content 2' },
            ] }),
        React.createElement("h2", null, "Menu"),
        React.createElement(Menu, { buttonLabel: "Open Menu", items: [
                { label: 'Item 1', onClick: () => alert('Item 1') },
                { label: 'Item 2', onClick: () => alert('Item 2') },
            ] }),
        React.createElement("h2", null, "Snackbar"),
        React.createElement("button", { onClick: () => setSnackbarOpen(true) }, "Show Snackbar"),
        React.createElement(Snackbar, { open: snackbarOpen, onClose: () => setSnackbarOpen(false), message: "This is a snackbar!" }),
        React.createElement("h2", null, "Skeleton"),
        React.createElement(Skeleton, { size: "md" })));
};
