/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/common/Navigation';
import { useAuth } from '../../../hooks/useAuth';

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
  stars: number;
  forks: number;
  webhookConfigured: boolean;
}

// Define PR type
interface PullRequest {
  id: number;
  prNumber: number;
  title: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  authorUsername: string;
  createdAt: string;
  commentCount?: number;
}

// Define stats type
interface RepoStats {
  totalPRs: number;
  reviewedPRs: number;
  issuesFound: number;
  avgReviewTime: number; // in seconds
  reviewsByMonth: {
    month: string;
    count: number;
  }[];
}

export default function RepositoryDetail({ params }: any) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (isAuthenticated && user) {
      fetchRepositoryData();
    }
  }, [isAuthenticated, user, params.id]);

  const fetchRepositoryData = async () => {
    setIsLoading(true);
    
    // Mock repository data
    const mockRepository: Repository = {
      id: parseInt(params.id),
      name: params.id === '1' ? 'frontend-app' : params.id === '2' ? 'backend-api' : `repo-${params.id}`,
      fullName: params.id === '1' ? 'myorg/frontend-app' : params.id === '2' ? 'myorg/backend-api' : `myorg/repo-${params.id}`,
      description: params.id === '1' 
        ? 'React-based frontend application with Next.js'
        : params.id === '2'
        ? 'Node.js API service with Express and PostgreSQL'
        : 'Repository description',
      isPrivate: params.id === '2',
      isEnabled: params.id !== '3',
      defaultReviewStyle: params.id === '1' ? 'standard' : params.id === '2' ? 'strict' : 'collaborative',
      lastUpdated: '2025-03-15T10:24:00Z',
      prCount: 8,
      stars: parseInt(params.id) * 10,
      forks: parseInt(params.id) * 3,
      webhookConfigured: params.id !== '3'
    };
    
    // Mock PRs data
    const mockPullRequests: PullRequest[] = [
      {
        id: 1,
        prNumber: 42,
        title: 'Add authentication components',
        status: 'completed',
        authorUsername: 'jsmith',
        createdAt: '2025-03-15T10:24:00Z',
        commentCount: 5
      },
      {
        id: 2,
        prNumber: 41,
        title: 'Fix responsive layout issues',
        status: 'completed',
        authorUsername: 'alopez',
        createdAt: '2025-03-14T14:32:00Z',
        commentCount: 3
      },
      {
        id: 3,
        prNumber: 40,
        title: 'Update dependencies',
        status: 'completed',
        authorUsername: 'jsmith',
        createdAt: '2025-03-12T09:45:00Z',
        commentCount: 1
      },
      {
        id: 4,
        prNumber: 43,
        title: 'Implement dark mode toggle',
        status: 'analyzing',
        authorUsername: 'mtaylor',
        createdAt: '2025-03-19T11:20:00Z'
      },
      {
        id: 5,
        prNumber: 44,
        title: 'Add unit tests for auth service',
        status: 'pending',
        authorUsername: 'jsmith',
        createdAt: '2025-03-20T08:15:00Z'
      }
    ];
    
    // Mock stats data
    const mockStats: RepoStats = {
      totalPRs: 35,
      reviewedPRs: 28,
      issuesFound: 104,
      avgReviewTime: 245,
      reviewsByMonth: [
        { month: 'Jan', count: 4 },
        { month: 'Feb', count: 6 },
        { month: 'Mar', count: 8 },
      ]
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRepository(mockRepository);
    setPullRequests(mockPullRequests);
    setStats(mockStats);
    setIsLoading(false);
  };
  
  const toggleRepositoryStatus = async () => {
    if (!repository) return;
    
    // In a real app, this would make an API call
    // For now, just update the state locally
    setRepository({
      ...repository,
      isEnabled: !repository.isEnabled
    });
    
    // Show confirmation message
    alert(`Repository ${repository.isEnabled ? 'disabled' : 'enabled'} successfully`);
  };
  
  const updateReviewStyle = async (style: 'standard' | 'strict' | 'collaborative') => {
    if (!repository) return;
    
    // In a real app, this would make an API call
    // For now, just update the state locally
    setRepository({
      ...repository,
      defaultReviewStyle: style
    });
    
    // Show confirmation message
    alert(`Review style updated to ${style}`);
  };
  
  const formatTime = (timeInSeconds: number) => {
    if (timeInSeconds < 60) {
      return `${timeInSeconds} seconds`;
    } else if (timeInSeconds < 3600) {
      return `${Math.floor(timeInSeconds / 60)} minutes`;
    } else {
      return `${Math.floor(timeInSeconds / 3600)} hours ${Math.floor((timeInSeconds % 3600) / 60)} minutes`;
    }
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

  if (isLoading || !repository) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/repositories')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            &larr; Back to Repositories
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{repository.name}</h1>
          <div className="ml-4 flex space-x-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                repository.isPrivate
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {repository.isPrivate ? 'Private' : 'Public'}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                repository.isEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {repository.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
          
          {activeTab === 'overview' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Total Pull Requests</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats?.totalPRs}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Reviewed PRs</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats?.reviewedPRs}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Issues Found</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats?.issuesFound}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Avg. Review Time</h3>
                  <p className="text-2xl font-bold text-gray-800">{formatTime(stats?.avgReviewTime || 0)}</p>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Pull Requests</h2>
              
              {pullRequests.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No pull requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PR
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
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
                            <Link href={`/repositories/${repository.id}/pr/${pr.prNumber}`}>
                              <div>
                                <div className="text-sm font-medium text-blue-600">#{pr.prNumber}</div>
                                <div className="text-sm text-gray-900">{pr.title}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStatusBadge(pr.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pr.authorUsername}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(pr.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {pr.commentCount !== undefined ? pr.commentCount : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-4 text-right">
                <Link 
                  href={`/repositories/${repository.id}/pull-requests`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all pull requests &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Repository Settings</h2>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Repository Status</h3>
                    <p className="text-sm text-gray-500">
                      {repository.isEnabled 
                        ? 'Reviews are currently enabled for this repository'
                        : 'Reviews are currently disabled for this repository'}
                    </p>
                  </div>
                  <button
                    onClick={toggleRepositoryStatus}
                    className={`px-4 py-2 rounded-md text-white ${
                      repository.isEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    } transition-colors`}
                  >
                    {repository.isEnabled ? 'Disable Reviews' : 'Enable Reviews'}
                  </button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Review Style</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose how the AI should approach code reviews for this repository.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                    <button
                      onClick={() => updateReviewStyle('standard')}
                      className={`px-4 py-2 rounded-md border ${
                        repository.defaultReviewStyle === 'standard'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => updateReviewStyle('strict')}
                      className={`px-4 py-2 rounded-md border ${
                        repository.defaultReviewStyle === 'strict'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      Strict
                    </button>
                    <button
                      onClick={() => updateReviewStyle('collaborative')}
                      className={`px-4 py-2 rounded-md border ${
                        repository.defaultReviewStyle === 'collaborative'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      Collaborative
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    <p><strong>Standard:</strong> Balanced feedback on quality, style, and potential issues</p>
                    <p><strong>Strict:</strong> Comprehensive analysis with high attention to detail</p>
                    <p><strong>Collaborative:</strong> Focus on suggestions rather than criticisms</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">GitHub Integration</h2>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">Webhook Status</h3>
                      <p className="text-sm text-gray-500">
                        {repository.webhookConfigured 
                          ? 'Webhook is configured and receiving events'
                          : 'Webhook is not configured yet'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        repository.webhookConfigured
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {repository.webhookConfigured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  
                  {!repository.webhookConfigured && (
                    <button
                      onClick={() => {
                        // In a real app, this would trigger webhook setup
                        alert('Webhook setup would be triggered here');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Configure Webhook
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Danger Zone</h2>
                
                <div className="border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-600 mb-2">Remove Repository</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This will remove the repository from CodeReviewAI. GitHub webhook will be removed.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this repository?')) {
                        // In a real app, this would make an API call
                        alert('Repository would be removed here');
                        router.push('/repositories');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Remove Repository
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
