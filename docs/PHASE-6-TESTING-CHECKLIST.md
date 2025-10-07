# Phase 6: User Management & Portals - Testing Checklist

**Phase**: 6 - User Management & Portals  
**Status**: Testing Required  
**Created**: January 2025  
**Components**: AgentPortalPage, SelfServicePortalPage, DirectoryManagementPage, User360Page

---

## Table of Contents
1. [Overview](#overview)
2. [Manual Testing Checklist](#manual-testing-checklist)
3. [Browser Compatibility Testing](#browser-compatibility-testing)
4. [Accessibility Testing](#accessibility-testing)
5. [Performance Testing](#performance-testing)
6. [Integration Testing](#integration-testing)
7. [Test Data Requirements](#test-data-requirements)
8. [Known Issues](#known-issues)

---

## Overview

This document provides comprehensive testing procedures for all Phase 6 components:
- **AgentPortalPage** - Agent workspace (Pulse)
- **SelfServicePortalPage** - End-user portal (Orbit)
- **DirectoryManagementPage** - User/group management
- **User360Page** - User profile views (existing component)

### Testing Goals
- ✅ Verify all routes are accessible
- ✅ Validate all UI interactions work correctly
- ✅ Ensure data displays properly
- ✅ Confirm filtering and search functionality
- ✅ Test bulk operations
- ✅ Verify accessibility compliance
- ✅ Measure performance benchmarks

---

## Manual Testing Checklist

### 1. AgentPortalPage (`/portals/agent`, `/portals/pulse`)

#### Route Access
- [ ] Navigate to `/portals/agent` - page loads successfully
- [ ] Navigate to `/portals/pulse` - page loads successfully (alias)
- [ ] Verify both routes point to the same component

#### Header & Quick Actions
- [ ] **Header displays correctly** with "Agent Portal - Pulse" title
- [ ] **Create Ticket button** - click opens placeholder action (toast/modal)
- [ ] **Knowledge Base button** - click triggers action
- [ ] **Notifications button** - displays badge count "3", click triggers action
- [ ] **Settings button** - click opens placeholder

#### Performance Metrics
- [ ] **Assigned Tickets metric** displays "12"
- [ ] **Resolved Today metric** displays "8"
- [ ] **Avg Response Time metric** displays "45m"
- [ ] **Satisfaction Score metric** displays "4.7/5"
- [ ] All metrics have proper icons and styling
- [ ] Metrics are clearly visible and readable

#### SLA Tracking
- [ ] **SLA Compliance** displays "94.5%"
- [ ] Progress bar shows correct percentage
- [ ] Green color indicates good compliance
- [ ] SLA section clearly labeled

#### Gamification
- [ ] **Points Today** displays "850 pts"
- [ ] **Current Rank** displays "#3"
- [ ] **Current Streak** displays "12 days"
- [ ] **Achievements** displays "2 unlocked"
- [ ] Trophy icon displays for achievements
- [ ] All gamification metrics styled correctly

#### Ticket Queue
- [ ] **5 sample tickets** display in the queue
- [ ] Each ticket shows: ID, title, priority badge, status badge, requester, last updated time
- [ ] **Priority badges** color-coded correctly:
  - URGENT (red)
  - HIGH (orange)
  - MEDIUM (yellow)
  - LOW (green)
- [ ] **Status badges** display correctly:
  - OPEN
  - IN PROGRESS
  - WAITING
- [ ] **SLA remaining** displays for each ticket with countdown timer
- [ ] **Unread messages badge** shows for tickets with messages (e.g., "2 new")
- [ ] Hover over ticket row highlights it
- [ ] Click on ticket row (placeholder action - should log or toast)

#### Filtering & Search
- [ ] **Priority filter dropdown** displays options: All, Urgent, High, Medium, Low
- [ ] Selecting priority filters queue (placeholder - no actual filtering yet)
- [ ] **Status filter dropdown** displays options: All, Open, In Progress, Waiting, On Hold, Resolved
- [ ] Selecting status filters queue (placeholder)
- [ ] **Search input** accepts text input
- [ ] Search icon displays correctly
- [ ] Typing in search updates UI responsively

#### Auto-Refresh
- [ ] **Auto-refresh toggle** displays "ON" state initially
- [ ] Click toggle switches between ON/OFF
- [ ] Toggle styled correctly (green when ON, gray when OFF)
- [ ] Auto-refresh text updates when toggled

#### Team Collaboration
- [ ] **4 team members** display in sidebar
- [ ] Each member shows: avatar, name, role, status indicator, badge count
- [ ] **Status indicators**:
  - Sarah Chen: green (Available)
  - Mike Rodriguez: yellow (Busy)
  - Emma Thompson: yellow (Busy)
  - David Park: gray (Away)
- [ ] **Specialization badges** display for each member
- [ ] Avatar initials display correctly
- [ ] Hover over team member shows hover state

#### Responsive Design
- [ ] Layout adapts to desktop view (1920px)
- [ ] Layout adapts to laptop view (1440px)
- [ ] Layout adapts to tablet view (768px)
- [ ] All elements remain accessible at different sizes

#### Visual Polish
- [ ] Glassmorphism effects display correctly
- [ ] Animations are smooth (60fps)
- [ ] Colors match Liquid Glass 2025 design
- [ ] Typography is clear and readable
- [ ] Spacing is consistent (8px grid)

---

### 2. SelfServicePortalPage (`/portals/self-service`, `/portals/orbit`)

#### Route Access
- [ ] Navigate to `/portals/self-service` - page loads successfully
- [ ] Navigate to `/portals/orbit` - page loads successfully (alias)
- [ ] Verify both routes point to the same component

#### Header & Notifications
- [ ] **Header displays** "Self-Service Portal - Orbit"
- [ ] **Notification bell icon** shows badge count "3"
- [ ] Click bell icon opens notifications dropdown
- [ ] **Notifications dropdown** displays 3 sample notifications:
  - "Your ticket INC-12345 has been assigned"
  - "New knowledge article available"
  - "Service catalog updated"
- [ ] Each notification shows: icon, title, timestamp
- [ ] Click notification (placeholder action)
- [ ] Close button (X) closes dropdown

#### Tab Navigation
- [ ] **4 tabs display**: Dashboard, My Tickets, Knowledge Base, Service Catalog
- [ ] Default tab is "Dashboard"
- [ ] Click "My Tickets" tab - switches to tickets view
- [ ] Click "Knowledge Base" tab - switches to knowledge view
- [ ] Click "Service Catalog" tab - switches to services view
- [ ] Click "Dashboard" tab - returns to dashboard
- [ ] Active tab highlighted correctly
- [ ] Tab transitions are smooth

#### Dashboard Tab
- [ ] **Welcome banner** displays with user icon and greeting
- [ ] **Quick Stats** section displays:
  - "2 Open Tickets"
  - "1 Resolved This Week"
  - "8 Bookmarked Articles"
  - "3 Unread Messages"
- [ ] Each stat shows correct icon and styling
- [ ] **Quick Actions** section displays 4 service cards:
  - Request New Laptop
  - Password Reset
  - Software Access
  - Report Issue
- [ ] Each service card shows: icon, title, description, "Request" button
- [ ] Click "Request" button (placeholder action)
- [ ] **Recent Tickets** section displays (placeholder)
- [ ] **Recent Articles** section displays (placeholder)

#### My Tickets Tab
- [ ] **New Ticket button** displays
- [ ] Click "New Ticket" opens ticket form
- [ ] **Ticket form** displays with fields:
  - Subject input
  - Description textarea
  - Priority dropdown (Low, Medium, High, Urgent)
  - Category dropdown
- [ ] **Submit button** in form (placeholder action)
- [ ] **3 sample tickets** display in list:
  - INC-12345 (In Progress)
  - INC-12344 (Open)
  - INC-12343 (Resolved)
- [ ] Each ticket shows: ID, subject, status badge, priority badge, created date
- [ ] Status badges color-coded correctly
- [ ] Click ticket (placeholder action)

#### Knowledge Base Tab
- [ ] **Search bar** displays with placeholder "Search articles..."
- [ ] Search icon displays
- [ ] Type in search (placeholder functionality)
- [ ] **4 sample articles** display:
  - "How to Reset Your Password"
  - "Setting Up VPN Access"
  - "Troubleshooting Email Issues"
  - "Requesting Hardware Upgrades"
- [ ] Each article shows: icon, title, excerpt, view count, rating, category
- [ ] **Star ratings** display correctly (e.g., 4.5/5, 4.8/5)
- [ ] **View counts** display (e.g., "245 views")
- [ ] **Category badges** display correctly
- [ ] Click article title (placeholder action)
- [ ] Click "View" button (placeholder action)

#### Service Catalog Tab
- [ ] **4 sample services** display:
  - Request New Laptop
  - Software License Request
  - Access Request
  - Hardware Repair
- [ ] Each service shows: icon, name, description, approval workflow indicator, "Request" button
- [ ] **Approval workflow badges** display:
  - "Requires Approval" for some services
- [ ] Click "Request" button (placeholder action)
- [ ] Services display in grid layout
- [ ] Hover over service card shows hover state

#### Floating Live Chat Widget
- [ ] **Chat widget** displays in bottom-right corner
- [ ] Chat icon with "Chat with Support" badge
- [ ] Click chat icon opens chat window
- [ ] **Chat window** displays:
  - Header with "Live Chat" title
  - Close button (X)
  - Message list area with sample messages
  - Input field
  - Send button
- [ ] **Sample messages** display:
  - "Hello! How can I help you today?" (agent)
  - "I need help with my password" (user)
  - "I can help you with that..." (agent)
- [ ] Each message shows: avatar, sender, timestamp
- [ ] Agent/user messages aligned correctly (agent left, user right)
- [ ] Type in message input field
- [ ] Click send button (placeholder action)
- [ ] Click close (X) button closes chat widget

#### Responsive Design
- [ ] Layout adapts to desktop view (1920px)
- [ ] Layout adapts to laptop view (1440px)
- [ ] Layout adapts to tablet view (768px)
- [ ] All tabs work correctly at different sizes
- [ ] Chat widget positions correctly at all sizes

#### Visual Polish
- [ ] Glassmorphism effects display correctly
- [ ] Tab transitions are smooth
- [ ] Notifications dropdown animations smooth
- [ ] Chat widget animations smooth
- [ ] Colors match Liquid Glass 2025 design
- [ ] Typography clear and readable

---

### 3. DirectoryManagementPage (`/admin/directory`)

#### Route Access
- [ ] Navigate to `/admin/directory` - page loads successfully

#### Header & Actions
- [ ] **Header displays** "Directory Management"
- [ ] **Export button** displays
- [ ] Click export button (placeholder action)
- [ ] **Import button** displays
- [ ] Click import button (placeholder action)
- [ ] **More options button** (3 dots) displays
- [ ] Click more options (placeholder action)
- [ ] **Settings button** displays
- [ ] Click settings (placeholder action)
- [ ] **Refresh button** displays
- [ ] Click refresh (placeholder action)

#### Stats Dashboard
- [ ] **Total Users** displays "247"
- [ ] **Active Users** displays "218"
- [ ] **Inactive** displays "15"
- [ ] **Suspended** displays "14"
- [ ] **Total Groups** displays "32"
- [ ] **New This Month** displays "18"
- [ ] All stats have correct icons
- [ ] Stats cards styled correctly

#### Tab Navigation
- [ ] **3 tabs display**: Users, Groups, Audit
- [ ] Default tab is "Users"
- [ ] Click "Groups" tab - switches to groups view
- [ ] Click "Audit" tab - switches to audit view
- [ ] Click "Users" tab - returns to users view
- [ ] Active tab highlighted correctly

#### Users Tab - Search & Filters
- [ ] **Search input** displays with placeholder "Search users..."
- [ ] Search icon displays
- [ ] Type in search field (placeholder functionality)
- [ ] **Department filter** dropdown displays options: All, IT, HR, Sales, Support, Engineering
- [ ] Select department (placeholder filtering)
- [ ] **Status filter** dropdown displays options: All, Active, Inactive, Suspended
- [ ] Select status (placeholder filtering)
- [ ] **Role filter** dropdown displays options: All, Admin, Agent, User, Manager
- [ ] Select role (placeholder filtering)

#### Users Tab - User List
- [ ] **5 sample users** display:
  - Sarah Johnson (IT, Active)
  - Mike Chen (Sales, Active)
  - Emma Wilson (HR, Active)
  - David Brown (Support, Inactive)
  - Lisa Anderson (Engineering, Suspended)
- [ ] Each user row shows:
  - Checkbox for selection
  - Avatar with initials
  - Name
  - Email
  - Department
  - Role
  - Status badge
  - Last login timestamp
  - Edit button
- [ ] **Status badges** color-coded correctly:
  - Active (green)
  - Inactive (gray)
  - Suspended (red)
- [ ] **Select All checkbox** in table header
- [ ] Click "Select All" - selects all users
- [ ] Click individual checkbox - selects single user
- [ ] Click "Edit" button on user (placeholder action)

#### Users Tab - Bulk Operations
- [ ] **Bulk Actions section** displays when users selected
- [ ] Shows count of selected users (e.g., "3 users selected")
- [ ] **Activate button** displays
- [ ] Click activate (placeholder action)
- [ ] **Suspend button** displays
- [ ] Click suspend (placeholder action)
- [ ] **Delete button** displays
- [ ] Click delete (placeholder action)
- [ ] Bulk actions only appear when users selected

#### Groups Tab
- [ ] **4 sample groups** display:
  - IT Department (Department, 45 members)
  - Administrators (Role, 8 members)
  - Level 2 Support (Team, 12 members)
  - Approvers (Custom, 23 members)
- [ ] Each group shows:
  - Name
  - Type badge (Department, Team, Role, Custom)
  - Member count
  - Edit button
- [ ] **Type badges** color-coded correctly
- [ ] Click "Edit" button (placeholder action)
- [ ] **New Group button** displays
- [ ] Click new group (placeholder action)

#### Audit Tab
- [ ] **Audit log placeholder** displays
- [ ] Message: "Audit trail feature coming soon..."
- [ ] Info icon displays
- [ ] Styled correctly

#### Responsive Design
- [ ] Layout adapts to desktop view (1920px)
- [ ] Stats cards stack correctly at smaller sizes
- [ ] Table scrolls horizontally on tablet/mobile
- [ ] Filters stack vertically on mobile
- [ ] All elements remain accessible

#### Visual Polish
- [ ] Glassmorphism effects display correctly
- [ ] Table hover states work correctly
- [ ] Checkbox interactions smooth
- [ ] Bulk actions appear/disappear smoothly
- [ ] Colors match Liquid Glass 2025 design

---

### 4. User360Page (`/users/:userId`)

#### Route Access
- [ ] Navigate to `/users/1` (or any valid user ID)
- [ ] Page loads successfully
- [ ] Existing component renders correctly

#### Component Verification (Existing)
- [ ] **User profile section** displays
- [ ] **Activity timeline** displays
- [ ] **Asset assignments** display
- [ ] **Security alerts** display
- [ ] **A/B testing integration** works
- [ ] All sections load data correctly
- [ ] No errors in console
- [ ] Design matches Liquid Glass 2025

---

## Browser Compatibility Testing

Test all Phase 6 pages in the following browsers:

### Desktop Browsers
- [ ] **Chrome** (latest) - Windows
- [ ] **Chrome** (latest) - macOS
- [ ] **Safari** (latest) - macOS
- [ ] **Firefox** (latest) - Windows
- [ ] **Firefox** (latest) - macOS
- [ ] **Edge** (latest) - Windows

### Mobile Browsers (if responsive)
- [ ] **Safari** - iOS (latest)
- [ ] **Chrome** - Android (latest)

### Verification Items
- [ ] All glassmorphism effects render correctly
- [ ] Animations run at 60fps
- [ ] No layout issues
- [ ] All interactions work
- [ ] No console errors

---

## Accessibility Testing

### WCAG 2.2 AA Compliance

#### AgentPortalPage
- [ ] **Known Issues**:
  - 1 button missing aria-label (refresh button)
  - 2 selects missing accessible names (priority/status filters)
- [ ] **Fix**: Add aria-labels to these elements
- [ ] **Keyboard Navigation**:
  - Tab through all interactive elements
  - Focus indicators visible
  - Logical tab order
- [ ] **Screen Reader**:
  - Test with NVDA (Windows) or VoiceOver (macOS)
  - All content announced correctly
  - Button/link purposes clear

#### SelfServicePortalPage
- [ ] **Known Issues**:
  - 3 buttons missing aria-labels (notification close, chat close, chat send)
- [ ] **Fix**: Add aria-labels to these buttons
- [ ] **Keyboard Navigation**:
  - Tab navigation works
  - All tabs accessible via keyboard
  - Chat widget keyboard accessible
- [ ] **Screen Reader**:
  - Tab changes announced
  - Notifications read correctly
  - Chat messages announced

#### DirectoryManagementPage
- [ ] **Known Issues**:
  - 5 buttons missing aria-labels (export, import, more options, settings, refresh)
  - 3 selects missing accessible names (department, status, role filters)
  - 1 checkbox input missing label (user selection)
- [ ] **Fix**: Add aria-labels to all elements
- [ ] **Keyboard Navigation**:
  - Table keyboard navigable
  - Checkboxes keyboard accessible
  - Filters keyboard accessible
- [ ] **Screen Reader**:
  - Table structure announced
  - User data read correctly
  - Bulk actions announced

#### User360Page
- [ ] **Status**: Zero errors/warnings ✅
- [ ] Verify keyboard navigation
- [ ] Verify screen reader compatibility

### Color Contrast
- [ ] All text meets 4.5:1 contrast ratio
- [ ] UI elements meet 3:1 contrast ratio
- [ ] Status badges have sufficient contrast

---

## Performance Testing

### Load Time Benchmarks
- [ ] **AgentPortalPage**: Initial load < 1.5s
- [ ] **SelfServicePortalPage**: Initial load < 1.5s
- [ ] **DirectoryManagementPage**: Initial load < 1.5s
- [ ] **User360Page**: Initial load < 1.5s

### Bundle Size
- [ ] AgentPortalPage bundle: ~30KB gzipped (estimate)
- [ ] SelfServicePortalPage bundle: ~35KB gzipped (estimate)
- [ ] DirectoryManagementPage bundle: ~28KB gzipped (estimate)
- [ ] Total Phase 6 bundle: ~95KB gzipped (estimate)

### Animation Performance
- [ ] All animations run at 60fps
- [ ] No frame drops during transitions
- [ ] Smooth glassmorphism effects
- [ ] Hover states responsive

### Lighthouse Scores (Desktop)
- [ ] Performance: > 90
- [ ] Accessibility: > 90 (after fixes)
- [ ] Best Practices: > 90
- [ ] SEO: > 90

---

## Integration Testing

### Route Integration
- [ ] All 6 Phase 6 routes accessible from App.tsx
- [ ] Route aliases work correctly (/portals/agent = /portals/pulse)
- [ ] Navigation between Phase 6 pages works
- [ ] Back button works correctly

### Design System Integration
- [ ] All components use design tokens from tokens.ts
- [ ] Glassmorphism utilities (.glass) applied correctly
- [ ] Typography follows SF Pro system
- [ ] Spacing follows 8px grid
- [ ] Animations use spring timing (cubic-bezier 0.4, 0.0, 0.2, 1)

### Data Flow (Placeholder)
- [ ] Sample data displays correctly
- [ ] No undefined/null errors
- [ ] Data structures match TypeScript types
- [ ] Future API integration points identified

---

## Test Data Requirements

### AgentPortalPage
- **Tickets**: 5 sample tickets with varying priorities, statuses, SLA timers
- **Team**: 4 team members with different statuses
- **Metrics**: Static performance data
- **Achievements**: 2 unlocked achievements

### SelfServicePortalPage
- **Tickets**: 3 sample tickets (open, in progress, resolved)
- **Articles**: 4 knowledge base articles with ratings
- **Services**: 4 service catalog items
- **Notifications**: 3 sample notifications

### DirectoryManagementPage
- **Users**: 5 sample users with varying statuses
- **Groups**: 4 sample groups (department, team, role, custom)
- **Stats**: Static directory statistics

### User360Page
- **User Data**: Existing component with comprehensive profile data

---

## Known Issues

### Critical Issues
- None ✅

### Non-Critical Issues (Accessibility Warnings)
1. **AgentPortalPage** (3 warnings):
   - Refresh button missing aria-label
   - Priority filter select missing accessible name
   - Status filter select missing accessible name

2. **SelfServicePortalPage** (3 warnings):
   - Notification close button missing aria-label
   - Chat close button missing aria-label
   - Chat send button missing aria-label

3. **DirectoryManagementPage** (9 warnings):
   - Export button missing aria-label
   - Import button missing aria-label
   - More options button missing aria-label
   - Settings button missing aria-label
   - Refresh button missing aria-label
   - Department filter select missing accessible name
   - Status filter select missing accessible name
   - Role filter select missing accessible name
   - User selection checkbox missing label

### Recommended Fixes
- Add aria-label to all buttons without visible text
- Add aria-label to all select elements
- Add accessible labels to all checkboxes
- Re-test after fixes to achieve WCAG 2.2 AA compliance

---

## Sign-Off

### Testing Team
- [ ] **Manual Testing**: _________________ Date: _______
- [ ] **Browser Testing**: _________________ Date: _______
- [ ] **Accessibility Testing**: _________________ Date: _______
- [ ] **Performance Testing**: _________________ Date: _______

### Approval
- [ ] **QA Lead**: _________________ Date: _______
- [ ] **Product Owner**: _________________ Date: _______
- [ ] **Engineering Lead**: _________________ Date: _______

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Ready for Testing
