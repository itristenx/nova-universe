# Phase 7 Testing Checklist

## Overview
Phase 7 delivers Advanced Features (Knowledge, Workflows, Change Management). This checklist covers manual testing, integration testing, and deployment verification.

---

## Components Delivered

### New Components (3)
1. **ArticleEditorPage** (680 lines)
2. **ChangeManagementPage** (610 lines)
3. **WorkflowBuilderPage** (365 lines)

### Existing Components Verified (7)
1. **KnowledgeBasePage**
2. **KnowledgeCommunityPage**
3. **SmartKnowledgePage**
4. **AssetsPage**
5. **CreateAssetPage**
6. **AssetDetailPage**
7. **SimpleWorkflowBuilder** component

---

## 1. Article Editor Testing

### Manual Tests

#### View Modes
- [ ] Click "Edit" mode → Verify textarea visible, preview hidden
- [ ] Click "Preview" mode → Verify preview visible, textarea hidden
- [ ] Click "Split" mode → Verify both panes visible side-by-side
- [ ] Switch between all 3 modes → Verify smooth transitions

#### Toolbar Formatting
- [ ] Click Bold button → Verify `**text**` inserted at cursor
- [ ] Click Italic button → Verify `*text*` inserted at cursor
- [ ] Click H1 button → Verify `# ` inserted
- [ ] Click H2 button → Verify `## ` inserted
- [ ] Click H3 button → Verify `### ` inserted
- [ ] Click Bullet list button → Verify `- ` inserted
- [ ] Click Numbered list button → Verify `1. ` inserted
- [ ] Click Quote button → Verify `> ` inserted
- [ ] Click Link button → Verify `[text](url)` inserted
- [ ] Click Image button → Verify `![alt](url)` inserted
- [ ] Click Code button → Verify ` ``` ` inserted
- [ ] Select text → Click format button → Verify text wrapped correctly

#### Metadata Management
- [ ] Edit title → Verify updates
- [ ] Select category → Verify selection updates
- [ ] Select visibility → Verify badge updates
- [ ] Select status → Verify badge color changes (gray/yellow/green)
- [ ] Add tag → Press Enter → Verify tag chip appears
- [ ] Click X on tag chip → Verify tag removed
- [ ] Select template → Verify markdown content populates
- [ ] Toggle metadata panel → Verify smooth collapse/expand

#### File Attachments
- [ ] Click "Upload Files" → Select 1 file → Verify appears in list
- [ ] Click "Upload Files" → Select multiple files → Verify all appear
- [ ] Click X on attachment → Verify removed from list
- [ ] Verify file name and size display correctly

#### Live Preview
- [ ] Type `# Heading` → Verify renders as h1 in preview
- [ ] Type `**bold**` → Verify renders as bold in preview
- [ ] Type `- list item` → Verify renders as bullet list in preview
- [ ] Type ` ```code``` ` → Verify renders as code block in preview
- [ ] Add attachment → Verify displays in preview pane

#### Status Bar
- [ ] Verify "Last saved" timestamp displays
- [ ] Verify version number displays
- [ ] Type characters → Verify word/character count updates
- [ ] Verify mode indicator shows current view mode

### Integration Tests
- [ ] Click "Save Draft" → Verify POST to `/api/v1/lore/articles`
- [ ] Click "Publish" → Verify POST to `/api/v1/lore/articles/:id/publish`
- [ ] Upload file → Verify POST to `/api/v1/lore/attachments`
- [ ] Navigate to `/knowledge/editor` → Verify page loads
- [ ] Navigate to `/knowledge/articles/new` → Verify page loads
- [ ] Verify lazy loading (check network tab)

### Accessibility Tests
- [ ] Tab through all form fields → Verify logical order
- [ ] Tab to toolbar buttons → Verify focus visible
- [ ] Press Enter on buttons → Verify actions trigger
- [ ] Test with screen reader → Verify all actions announced
- [ ] **Known Issues**: 10 aria-label warnings (documented)

---

## 2. Change Management Testing

### Manual Tests

#### Stats Dashboard
- [ ] Verify "Total Changes" shows 234
- [ ] Verify "Approved" shows 89
- [ ] Verify "Scheduled" shows 12
- [ ] Verify "In Progress" shows 3
- [ ] Verify "Success Rate" shows 94.7%

#### Change List
- [ ] Verify 4 change cards display
- [ ] Hover over card → Verify border changes to blue
- [ ] Hover over card → Verify action buttons appear (Eye, Edit, More)
- [ ] Verify change number displays (CHG0012345 format)
- [ ] Verify type badge color (Emergency=red, Normal=blue, Standard=green)
- [ ] Verify status badge color (Approved=green, Implementing=blue, etc.)
- [ ] Verify priority color (Critical=red, High=orange, Medium=yellow, Low=green)
- [ ] Verify risk color (High=red, Medium=yellow, Low=green)

#### Filters & Search
- [ ] Type in search bar → Verify filters change list
- [ ] Search by change number → Verify finds correct change
- [ ] Search by title → Verify filters correctly
- [ ] Select type filter → Verify list updates
- [ ] Select status filter → Verify list updates
- [ ] Clear filters → Verify all changes display

#### Tabs
- [ ] Click "All" tab → Verify all changes display
- [ ] Click "My Changes" tab → Verify tab becomes active (blue background)
- [ ] Click "CAB" tab → Verify tab becomes active
- [ ] Click "Calendar" tab → Verify tab becomes active

#### Change Details
- [ ] Verify category displays (Infrastructure, Security, Network, Application)
- [ ] Verify timeline shows start/end dates and duration
- [ ] Verify affected services display as chips
- [ ] Verify requester and implementer avatars display
- [ ] Verify approval status icons (checkmark=approved, clock=pending, X=rejected)
- [ ] Click "View Details" → Verify action triggers

### Integration Tests
- [ ] Navigate to `/changes` → Verify page loads
- [ ] Navigate to `/change-management` → Verify page loads
- [ ] Click "New Change Request" → Verify create form opens (when implemented)
- [ ] Verify lazy loading (check network tab)

### Accessibility Tests
- [ ] Tab through all interactive elements → Verify logical order
- [ ] Tab to filter dropdowns → Verify focus visible
- [ ] Press Enter on "View Details" → Verify action triggers
- [ ] Test with screen reader → Verify all content announced
- [ ] **Known Issues**: 6 aria-label warnings (documented)

---

## 3. Workflow Builder Testing

### Manual Tests

#### Workflow List View
- [ ] Verify "My Workflows" section displays
- [ ] Verify 4 workflow cards display
- [ ] Hover over workflow card → Verify border changes to blue
- [ ] Verify status badges (Active=green, Draft=yellow, Inactive=gray)
- [ ] Verify trigger displays (Ticket Created, SLA Warning, etc.)
- [ ] Verify node count displays
- [ ] Verify last modified date displays
- [ ] Click "Open" button → Verify switches to builder view

#### Quick Stats
- [ ] Verify "Active Workflows" shows 3
- [ ] Verify "Draft Workflows" shows 1
- [ ] Verify "Total Nodes" shows 41

#### Builder View
- [ ] Click "New Workflow" → Verify switches to builder canvas
- [ ] Click workflow from list → Verify loads workflow data
- [ ] Edit workflow name → Verify updates inline
- [ ] Edit workflow description → Verify updates inline
- [ ] Click "Test Run" → Verify test mode activates (orange banner)
- [ ] Click "Stop Test" → Verify test mode deactivates
- [ ] Click "Save Workflow" → Verify save action triggers
- [ ] Click "My Workflows" → Verify returns to list view

#### Builder Canvas
- [ ] Verify SimpleWorkflowBuilder component loads
- [ ] Verify test mode banner shows when active
- [ ] Click Download → Verify action triggers
- [ ] Click Upload → Verify action triggers
- [ ] Click Settings → Verify action triggers
- [ ] Click Copy → Verify action triggers
- [ ] Click Delete → Verify action triggers (red button)

#### Getting Started Guide
- [ ] Verify blue info box displays
- [ ] Verify 4 bullet points display
- [ ] Verify AlertCircle icon displays

### Integration Tests
- [ ] Navigate to `/workflows` → Verify page loads
- [ ] Navigate to `/workflows/builder` → Verify page loads
- [ ] Verify SimpleWorkflowBuilder receives correct props (onSave, onExecute, onPublish)
- [ ] Verify lazy loading (check network tab)

### Accessibility Tests
- [ ] Tab through all interactive elements → Verify logical order
- [ ] Tab to workflow name/description inputs → Verify editable
- [ ] Press Enter on "Open" button → Verify action triggers
- [ ] Test with screen reader → Verify all content announced
- [ ] **Perfect**: 0 aria-label warnings ✅

---

## 4. Integration Testing

### API Integration
- [ ] **Article Editor**: Connect to `/api/v1/lore/articles`
  - [ ] POST /articles (create)
  - [ ] PUT /articles/:id (update)
  - [ ] POST /articles/:id/publish (publish)
  - [ ] POST /lore/attachments (file upload)
- [ ] **Change Management**: Connect to change API (TBD)
  - [ ] GET /changes (list)
  - [ ] POST /changes (create)
  - [ ] PUT /changes/:id (update)
  - [ ] POST /changes/:id/approve (approve)
- [ ] **Workflow Builder**: Connect to workflow API
  - [ ] POST /workflows (save)
  - [ ] POST /workflows/:id/execute (execute)
  - [ ] POST /workflows/:id/publish (publish)

### Route Testing
- [ ] `/knowledge/editor` → ArticleEditorPage
- [ ] `/knowledge/articles/new` → ArticleEditorPage
- [ ] `/workflows` → WorkflowBuilderPage
- [ ] `/workflows/builder` → WorkflowBuilderPage
- [ ] `/changes` → ChangeManagementPage
- [ ] `/change-management` → ChangeManagementPage

### Error Handling
- [ ] Disconnect network → Verify error messages display
- [ ] Submit invalid data → Verify validation errors display
- [ ] Timeout request → Verify timeout message displays

---

## 5. Browser Compatibility

### Chrome 120+
- [ ] Article Editor renders correctly
- [ ] Change Management renders correctly
- [ ] Workflow Builder renders correctly
- [ ] All interactions work (click, type, drag)
- [ ] Glassmorphism effects display correctly

### Firefox 120+
- [ ] Article Editor renders correctly
- [ ] Change Management renders correctly
- [ ] Workflow Builder renders correctly
- [ ] All interactions work
- [ ] Glassmorphism effects display correctly

### Safari 17+
- [ ] Article Editor renders correctly
- [ ] Change Management renders correctly
- [ ] Workflow Builder renders correctly
- [ ] All interactions work
- [ ] Glassmorphism effects display correctly

### Edge 120+
- [ ] Article Editor renders correctly
- [ ] Change Management renders correctly
- [ ] Workflow Builder renders correctly
- [ ] All interactions work
- [ ] Glassmorphism effects display correctly

---

## 6. Mobile Responsiveness

### iPhone (375px width)
- [ ] Article Editor: Split view becomes stacked
- [ ] Change Management: Cards stack vertically
- [ ] Workflow Builder: Canvas scrolls horizontally
- [ ] Toolbar buttons remain accessible
- [ ] Text remains readable

### iPad (768px width)
- [ ] Article Editor: Split view works
- [ ] Change Management: Cards in grid
- [ ] Workflow Builder: Full canvas visible
- [ ] All stats cards visible

### Android (360px width)
- [ ] Article Editor: All features accessible
- [ ] Change Management: Filters stack
- [ ] Workflow Builder: Touch interactions work

---

## 7. Performance Testing

### Bundle Size
- [ ] ArticleEditorPage: ~35 KB gzipped
- [ ] ChangeManagementPage: ~30 KB gzipped
- [ ] WorkflowBuilderPage: ~20 KB gzipped
- [ ] Total Phase 7 impact: ~85 KB

### Load Time
- [ ] Initial page load: < 500ms
- [ ] Lazy load components: < 200ms
- [ ] Route navigation: < 100ms

### Rendering
- [ ] Article Editor preview: < 16ms (60fps)
- [ ] Change list filter: < 100ms
- [ ] Workflow list render: < 100ms

---

## 8. Known Issues

### Accessibility Warnings (16 total) ⚠️ NON-CRITICAL

**ArticleEditorPage** (10 warnings):
1. Line 197: More options button missing aria-label
2. Line 279: Tag remove button missing aria-label
3. Line 478: Attachment remove button missing aria-label
4. Line 1 (ref): Additional button warning
5. Line 211: Category select missing accessible name
6. Line 227: Visibility select missing accessible name
7. Line 241: Status select missing accessible name
8. Line 290: Template select missing accessible name
9. Line 429: File input missing label
10. Additional reference warnings

**ChangeManagementPage** (6 warnings):
1. Line 467: Filter button missing aria-label
2. Line 499: View button missing aria-label
3. Line 502: Edit button missing aria-label
4. Line 505: More options button missing aria-label
5. Line 440: Type select missing accessible name
6. Line 451: Status select missing accessible name

**WorkflowBuilderPage** (0 warnings) ✅ PERFECT

### Functional Limitations
1. **Article Editor**: Markdown preview uses simple regex (should use `react-markdown`)
2. **All pages**: Sample data only (no backend integration)
3. **All pages**: No error handling for API failures
4. **All pages**: No loading states

---

## 9. Deployment Checklist

### Pre-Deployment
- [ ] Fix accessibility warnings (add aria-labels)
- [ ] Replace markdown regex with `react-markdown`
- [ ] Add error handling for API failures
- [ ] Add loading states
- [ ] Add auto-save for drafts
- [ ] Test all routes in production build
- [ ] Verify lazy loading works correctly

### Deployment
- [ ] Build production bundle: `pnpm build`
- [ ] Verify bundle size: < 500 KB total
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Verify all routes accessible
- [ ] Check browser console for errors
- [ ] Test on mobile devices

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Collect user feedback
- [ ] Track usage analytics (page views, time on page)
- [ ] Verify performance metrics (load time, render time)
- [ ] Plan accessibility fixes
- [ ] Schedule backend integration
- [ ] Document any production issues

---

## 10. Sign-Off

### QA Team
- [ ] Manual testing complete
- [ ] Integration testing complete
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met

### Development Team
- [ ] Code review complete
- [ ] TypeScript strict mode enabled
- [ ] Zero compilation errors
- [ ] Accessibility warnings documented
- [ ] Backend integration plan documented

### Product Team
- [ ] Feature requirements met
- [ ] Design specifications met
- [ ] User flows validated
- [ ] Documentation complete

---

## Summary

**Phase 7 Status**: ✅ COMPLETE  
**Components**: 3 new pages (1,655 lines) + 7 existing verified  
**Routes**: 6 new routes added  
**Compilation**: Zero TypeScript errors  
**Accessibility**: 16 warnings (non-critical, aria-labels)  
**Ready for**: Backend integration and Phase 8 (Testing & Polish)

---

**Document**: PHASE-7-TESTING-CHECKLIST.md  
**Version**: 1.0  
**Last Updated**: January 26, 2025
