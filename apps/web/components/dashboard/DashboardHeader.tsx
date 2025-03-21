'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  user: any;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">CodeReviewAI</h1>
            <nav className="hidden md:flex space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/repositories" className="text-gray-600 hover:text-gray-900">
                Repositories
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                {user.avatarUrl && (
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-gray-700">{user.displayName}</span>
              </div>
            )}
            <Button onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;