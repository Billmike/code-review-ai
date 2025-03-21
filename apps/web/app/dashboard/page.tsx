/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/common/Navigation';
import RepositoryList from '../../components/dashboard/RepositoryList';
import RecentPRs from '../../components/dashboard/RecentPRs';
import ReviewStats from '../../components/dashboard/ReviewStats';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [repositories, setRepositories] = useState([]);
  const [recentPRs, setRecentPRs] = useState([]);
  const [stats, setStats] = useState({
    totalPRs: 0,
    reviewedPRs: 0,
    totalComments: 0,
    avgReviewTime: 0,
  });
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
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    // For development, we'll use mock data
    // In production, this would be API calls to your backend
    
    // Mock repositories data
    const mockRepositories = [
      {
        id: 1,
        name: 'frontend-app',
        fullName: 'myorg/frontend-app',
        isPrivate: false,
        isEnabled: true
      },
      {
        id: 2,
        name: 'backend-api',
        fullName: 'myorg/backend-api',
        isPrivate: true,
        isEnabled: true
      },
      {
        id: 3,
        name: 'docs',
        fullName: 'myorg/docs',
        isPrivate: false,
        isEnabled: false
      }
    ];
    
    // Mock PRs data
    const mockPRs = [
      {
        id: 1,
        prNumber: 42,
        title: 'Add dashboard UI components',
        status: 'completed',
        repositoryName: 'frontend-app',
        repositoryId: 1,
        authorUsername: 'jsmith',
        createdAt: '2025-03-15T10:24:00Z',
        commentCount: 5
      },
      {
        id: 2,
        prNumber: 23,
        title: 'Fix authentication bugs',
        status: 'analyzing',
        repositoryName: 'backend-api',
        repositoryId: 2,
        authorUsername: 'alopez',
        createdAt: '2025-03-17T14:32:00Z'
      },
      {
        id: 3,
        prNumber: 15,
        title: 'Update README with new setup instructions',
        status: 'pending',
        repositoryName: 'docs',
        repositoryId: 3,
        authorUsername: 'jsmith',
        createdAt: '2025-03-18T09:45:00Z'
      }
    ];
    
    // Mock stats data
    const mockStats = {
      totalPRs: 24,
      reviewedPRs: 18,
      totalComments: 142,
      avgReviewTime: 240 // seconds
    };
    
    // Set state with mock data
    setRepositories(mockRepositories as any);
    setRecentPRs(mockPRs as any);
    setStats(mockStats);
    setIsLoading(false);

    // When backend is ready, uncomment these API calls
    /*
    try {
      // Fetch repositories
      const reposResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/repositories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRepositories(reposResponse.data);

      // Fetch recent PRs
      const prsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pull-requests/recent`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRecentPRs(prsResponse.data);

      // Fetch statistics
      const statsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
    */
  };

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ReviewStats stats={stats} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentPRs prs={recentPRs} />
              </div>
              <div>
                <RepositoryList repositories={repositories} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}