'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../components/common/Navigation';
import { useAuth } from '../../hooks/useAuth';

// Define repository type
interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  isEnabled: boolean;
  defaultReviewStyle: 'standard' | 'strict' | 'collaborative';
  lastUpdated: string;
  prCount: number;
}

export default function Repositories() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (isAuthenticated && user) {
      fetchRepositories();
    }
  }, [isAuthenticated, user]);

  const fetchRepositories = async () => {
    setIsLoading(true);
    
    // Mock repositories data
    const mockRepositories: Repository[] = [
      {
        id: 1,
        name: 'frontend-app',
        fullName: 'myorg/frontend-app',
        description: 'React-based frontend application with Next.js',
        isPrivate: false,
        isEnabled: true,
        defaultReviewStyle: 'standard',
        lastUpdated: '2025-03-15T10:24:00Z',
        prCount: 8
      },
      {
        id: 2,
        name: 'backend-api',
        fullName: 'myorg/backend-api',
        description: 'Node.js API service with Express and PostgreSQL',
        isPrivate: true,
        isEnabled: true,
        defaultReviewStyle: 'strict',
        lastUpdated: '2025-03-17T14:32:00Z',
        prCount: 5
      },
      {
        id: 3,
        name: 'docs',
        fullName: 'myorg/docs',
        description: 'Project documentation and guides',
        isPrivate: false,
        isEnabled: false,
        defaultReviewStyle: 'collaborative',
        lastUpdated: '2025-03-18T09:45:00Z',
        prCount: 2
      },
      {
        id: 4,
        name: 'mobile-app',
        fullName: 'myorg/mobile-app',
        description: 'React Native mobile application',
        isPrivate: false,
        isEnabled: true,
        defaultReviewStyle: 'standard',
        lastUpdated: '2025-03-10T16:18:00Z',
        prCount: 12
      },
      {
        id: 5,
        name: 'design-system',
        fullName: 'myorg/design-system',
        description: 'Shared UI components and design tokens',
        isPrivate: false,
        isEnabled: true,
        defaultReviewStyle: 'collaborative',
        lastUpdated: '2025-03-05T11:30:00Z',
        prCount: 3
      }
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRepositories(mockRepositories);
    setIsLoading(false);
  };

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Repositories</h1>
          <button
            onClick={() => router.push('/repositories/add')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Repository
          </button>
        </div>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {repositories.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">No repositories connected yet</p>
                <button
                  onClick={() => router.push('/repositories/add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Connect GitHub Repository
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repository
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review Style
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRs
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repositories.map((repo) => (
                    <tr key={repo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                            <div className="text-sm text-gray-500">{repo.fullName}</div>
                            {repo.description && (
                              <div className="text-sm text-gray-500 mt-1 max-w-md truncate">
                                {repo.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            repo.isEnabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {repo.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            repo.isPrivate
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {repo.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {repo.defaultReviewStyle}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {repo.prCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(repo.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/repositories/${repo.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => {
                            // Toggle enabled status in a real app
                            // For now, just simulate with an alert
                            alert(`${repo.isEnabled ? 'Disabling' : 'Enabling'} ${repo.name}`);
                          }}
                          className={`text-sm ${
                            repo.isEnabled ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {repo.isEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}