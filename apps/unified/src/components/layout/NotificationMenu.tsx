import { ReactNode } from 'react';

interface NotificationMenuProps {
  children: ReactNode;
}

export function NotificationMenu({ children }: NotificationMenuProps) {
  return <div>{children}</div>;
}
