#!/bin/bash

# Remove unused imports from multiple files
sed -i '/import.*Link.*from.*react-router-dom/d' apps/unified/src/pages/admin/UsersPage.tsx
sed -i 's/EllipsisHorizontalIcon,//g' apps/unified/src/pages/admin/UsersPage.tsx
sed -i 's/PencilIcon//g' apps/unified/src/pages/admin/UsersPage.tsx
sed -i 's/getUserDisplayName,//g' apps/unified/src/pages/admin/UsersPage.tsx  
sed -i 's/getInitials//g' apps/unified/src/pages/admin/UsersPage.tsx

# Fix other files
sed -i 's/QrCodeIcon,//g' apps/unified/src/pages/assets/AssetsPage.tsx
sed -i 's/DocumentArrowDownIcon,//g' apps/unified/src/pages/admin/ReportsPage.tsx
sed -i 's/CalendarIcon,//g' apps/unified/src/pages/admin/ReportsPage.tsx
sed -i 's/FlagIcon,//g' apps/unified/src/pages/tickets/TicketDetailPage.tsx
sed -i 's/CheckIcon,//g' apps/unified/src/pages/tickets/TicketDetailPage.tsx
sed -i 's/XMarkIcon//g' apps/unified/src/pages/tickets/TicketDetailPage.tsx
sed -i 's/formatRelativeTime,//g' apps/unified/src/components/assets/AssetTable.tsx

