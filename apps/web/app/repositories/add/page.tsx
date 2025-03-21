'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/common/Navigation';
import { useAuth } from '../../../hooks/useAuth';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  updated_at: string;
}

export default function AddRepository() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepos, setSelectedRepos] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (isAuthenticated && user) {
      fetchGitHubRepositories();
    }
  }, [isAuthenticated, user]);

  const fetchGitHubRepositories = async () => {
    setIsLoading(true);
    
    // Mock GitHub repositories data
    const mockGitHubRepos: GitHubRepo[] = [
      {
        id: 101,
        name: 'marketing-site',
        full_name: 'myorg/marketing-site',
        private: false,
        html_url: 'https://github.com/myorg/marketing-site',
        description: 'Company marketing website built with Next.js',
        updated_at: '2025-02-24T15:20:00Z'
      },
      {
        id: 102,
        name: 'analytics-dashboard',
        full_name: 'myorg/analytics-dashboard',
        private: true,
        html_url: 'https://github.com/myorg/analytics-dashboard',
        description: 'Internal analytics dashboard for tracking KPIs',
        updated_at: '2025-03-02T09:15:00Z'
      },
      {
        id: 103,
        name: 'customer-portal',
        full_name: 'myorg/customer-portal',
        private: true,
        html_url: 'https://github.com/myorg/customer-portal',
        description: 'Customer self-service portal with support ticketing',
        updated_at: '2025-03-10T13:45:00Z'
      },
      {
        id: 104,
        name: 'design-tokens',
        full_name: 'myorg/design-tokens',
        private: false,
        html_url: 'https://github.com/myorg/design-tokens',
        description: 'Design tokens and variables for consistent branding',
        updated_at: '2025-03-05T11:30:00Z'
      },
      {
        id: 105,
        name: 'internal-tools',
        full_name: 'myorg/internal-tools',
        private: true,
        html_url: 'https://github.com/myorg/internal-tools',
        description: 'Various internal utilities and scripts',
        updated_at: '2025-02-28T16:20:00Z'
      },
      {
        id: 106,
        name: 'blog',
        full_name: 'myorg/blog',
        private: false,
        html_url: 'https://github.com/myorg/blog',
        description: 'Company blog built with Gatsby',
        updated_at: '2025-03-12T10:05:00Z'
      }
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setGithubRepos(mockGitHubRepos);
    setIsLoading(false);
  };

  const toggleRepoSelection = (repoId: number) => {
    setSelectedRepos(prev => ({
      ...prev,
      [repoId]: !prev[repoId]
    }));
  };

  const handleAddRepositories = async () => {
    const selectedRepoIds = Object.entries(selectedRepos)
      .filter(([_, isSelected]) => isSelected)
      .map(([repoId]) => parseInt(repoId));
    
    if (selectedRepoIds.length === 0) {
      alert('Please select at least one repository');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to add repositories
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would make an API call here
    console.log('Adding repositories:', selectedRepoIds);
    
    setIsSubmitting(false);
    
    // Navigate back to repositories page
    router.push('/repositories');
  };

  // Filter repositories based on search term
  const filteredRepos = githubRepos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
          <h1 className="text-2xl font-bold text-gray-800">Add GitHub Repositories</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Repositories
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-md overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          onChange={() => {
                            // Toggle all visible repos
                            const allSelected = filteredRepos.every(repo => selectedRepos[repo.id]);
                            const newSelectedRepos = {...selectedRepos};
                            
                            filteredRepos.forEach(repo => {
                              newSelectedRepos[repo.id] = !allSelected;
                            });
                            
                            setSelectedRepos(newSelectedRepos);
                          }}
                          checked={filteredRepos.length > 0 && filteredRepos.every(repo => selectedRepos[repo.id])}
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Repository
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visibility
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRepos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No repositories found matching "{searchTerm}"
                        </td>
                      </tr>
                    ) : (
                      filteredRepos.map((repo) => (
                        <tr key={repo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={!!selectedRepos[repo.id]}
                              onChange={() => toggleRepoSelection(repo.id)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{repo.name}</div>
                              <div className="text-sm text-gray-500">{repo.full_name}</div>
                              {repo.description && (
                                <div className="text-sm text-gray-500 mt-1 max-w-md truncate">
                                  {repo.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                repo.private
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {repo.private ? 'Private' : 'Public'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {Object.values(selectedRepos).filter(Boolean).length} repositories selected
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push('/repositories')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRepositories}
                    disabled={isSubmitting || Object.values(selectedRepos).filter(Boolean).length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Selected Repositories'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}