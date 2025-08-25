import React from 'react';
import { useParams } from 'react-router-dom';
import { User360 } from '@components/user360/User360';

export function User360Page() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <User360 userId={userId} />
      </div>
    </div>
  );
}

export default User360Page;
