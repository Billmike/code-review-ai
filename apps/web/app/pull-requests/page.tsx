'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../components/common/Navigation';
import { useAuth } from '../../hooks/useAuth';

// Define pull request type
interface PullRequest {
  id: number;
  prNumber: number;
  title: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  repositoryId: number;
  repositoryName: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export default function PullRequests() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');
  const [repositories, setRepositories] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (isAuthenticated && user) {
      fetchPullRequests();
    }
  }, [isAuthenticated, user, statusFilter, repoFilter]);

  const fetchPullRequests = async () => {
    setIsLoading(true);
    
    // Mock repositories data
    const mockRepositories = [
      { id: 1, name: 'frontend-app' },
      { id: 2, name: 'backend-api' },
      { id: 3, name: 'docs' },
      { id: 4, name: 'mobile-app' },
      { id: 5, name: 'design-system' },
    ];
    
    // Mock pull requests data
    const mockPullRequests: PullRequest[] = [
      {
        id: 1,
        prNumber: 42,
        title: 'Add authentication components',
        status: 'completed',
        repositoryId: 1,
        repositoryName: 'frontend-app',
        authorUsername: 'jsmith',
        createdAt: '2025-03-15T10:24:00Z',
        updatedAt: '2025-03-15T10:35:00Z',
        commentCount: 5
      },
      {
        id: 2,
        prNumber: 41,
        title: 'Fix responsive layout issues',
        status: 'completed',
        repositoryId: 1,
        repositoryName: 'frontend-app',
        authorUsername: 'alopez',
        createdAt: '2025-03-14T14:32:00Z',
        updatedAt: '2025-03-14T14:45:00Z',
        commentCount: 3
      },
      {
        id: 3,
        prNumber: 28,
        title: 'Implement user authentication API',
        status: 'completed',
        repositoryId: 2,
        repositoryName: 'backend-api',
        authorUsername: 'mtaylor',
        createdAt: '2025-03-12T09:45:00Z',
        updatedAt: '2025-03-12T10:00:00Z',
        commentCount: 7
      },
      {
        id: 4,
        prNumber: 43,
        title: 'Implement dark mode toggle',
        status: 'analyzing',
        repositoryId: 1,
        repositoryName: 'frontend-app',
        authorUsername: 'mtaylor',
        createdAt: '2025-03-19T11:20:00Z',
        updatedAt: '2025-03-19T11:20:00Z'
      },
      {
        id: 5,
        prNumber: 29,
        title: 'Add caching layer for API responses',
        status: 'analyzing',
        repositoryId: 2,
        repositoryName: 'backend-api',
        authorUsername: 'jsmith',
        createdAt: '2025-03-18T15:10:00Z',
        updatedAt: '2025-03-18T15:10:00Z'
      },
      {
        id: 6,
        prNumber: 44,
        title: 'Add unit tests for auth service',
        status: 'pending',
        repositoryId: 1,
        repositoryName: 'frontend-app',
        authorUsername: 'jsmith',
        createdAt: '2025-03-20T08:15:00Z',
        updatedAt: '2025-03-20T08:15:00Z'
      },
      {
        id: 7,
        prNumber: 16,
        title: 'Update API documentation',
        status: 'pending',
        repositoryId: 3,
        repositoryName: 'docs',
        authorUsername: 'alopez',
        createdAt: '2025-03-17T13:25:00Z',
        updatedAt: '2025-03-17T13:25:00Z'
      },
      {
        id: 8,
        prNumber: 12,
        title: 'Implement push notifications',
        status: 'failed',
        repositoryId: 4,
        repositoryName: 'mobile-app',
        authorUsername: 'mtaylor',
        createdAt: '2025-03-10T09:30:00Z',
        updatedAt: '2025-03-10T09:45:00Z',
        commentCount: 0
      },
      {
        id: 9,
        prNumber: 5,
        title: 'Update button component styles',
        status: 'completed',
        repositoryId: 5,
        repositoryName: 'design-system',
        authorUsername: 'alopez',
        createdAt: '2025-03-08T14:20:00Z',
        updatedAt: '2025-03-08T14:35:00Z',
        commentCount: 2
      },
      {
        id: 10,
        prNumber: 30,
        title: 'Fix database connection pool settings',
        status: 'completed',
        repositoryId: 2,
        repositoryName: 'backend-api',
        authorUsername: 'jsmith',
        createdAt: '2025-03-16T10:15:00Z',
        updatedAt: '2025-03-16T10:30:00Z',
        commentCount: 4
      }
    ];
    
    // Apply filters
    let filteredPRs = mockPullRequests;
    
    if (statusFilter !== 'all') {
      filteredPRs = filteredPRs.filter(pr => pr.status === statusFilter);
    }
    
    if (repoFilter !== 'all') {
      const repoId = parseInt(repoFilter);
      filteredPRs = filteredPRs.filter(pr => pr.repositoryId === repoId);
    }
    
    // Sort by date (newest first)
    filteredPRs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRepositories(mockRepositories);
    setPullRequests(filteredPRs);
    setIsLoading(false);
  };

  const renderStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      analyzing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Pull Requests</h1>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="analyzing">Analyzing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={repoFilter}
              onChange={(e) => setRepoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Repositories</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id.toString()}>{repo.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pullRequests.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No pull requests found with the selected filters</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pull Request
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repository
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pullRequests.map((pr) => (
                    <tr key={pr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link href={`/repositories/${pr.repositoryId}/pr/${pr.prNumber}`}>
                          <div>
                            <div className="text-sm font-medium text-blue-600">#{pr.prNumber}</div>
                            <div className="text-sm text-gray-900">{pr.title}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/repositories/${pr.repositoryId}`}>
                          <span className="text-sm text-gray-700 hover:text-gray-900">
                            {pr.repositoryName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(pr.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pr.authorUsername}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pr.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pr.commentCount !== undefined ? pr.commentCount : '-'}
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