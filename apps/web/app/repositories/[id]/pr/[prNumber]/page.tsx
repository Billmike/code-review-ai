/* eslint-disable @typescript-eslint/no-explicit-any */
// apps/web/app/repositories/[id]/pr/[prNumber]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../../../components/common/Navigation';
import { useAuth } from '../../../../../hooks/useAuth';

// Define pull request details type
interface PullRequestDetails {
  id: number;
  prNumber: number;
  title: string;
  description: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  authorUsername: string;
  createdAt: string;
  reviewStartedAt?: string;
  reviewCompletedAt?: string;
  commentCount: number;
  reviewStyle: 'standard' | 'strict' | 'collaborative';
  htmlUrl: string;
}

// Define repository type
interface Repository {
  id: number;
  name: string;
  fullName: string;
}

// Define comment type
interface Comment {
  id: number;
  path: string;
  line: number;
  body: string;
  severity: 'info' | 'warning' | 'error';
  createdAt: string;
}

export default function PullRequestDetail({ params }: any) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pullRequest, setPullRequest] = useState<PullRequestDetails | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'files'>('overview');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (isAuthenticated && user) {
      fetchPullRequestData();
    }
  }, [isAuthenticated, user, params.id, params.prNumber]);

  const fetchPullRequestData = async () => {
    setIsLoading(true);
    
    // Mock repository data
    const mockRepository: Repository = {
      id: parseInt(params.id),
      name: params.id === '1' ? 'frontend-app' : params.id === '2' ? 'backend-api' : `repo-${params.id}`,
      fullName: params.id === '1' ? 'myorg/frontend-app' : params.id === '2' ? 'myorg/backend-api' : `myorg/repo-${params.id}`
    };
    
    // Mock PR data
    const mockPullRequest: PullRequestDetails = {
      id: 1,
      prNumber: parseInt(params.prNumber),
      title: params.prNumber === '42' 
        ? 'Add authentication components' 
        : params.prNumber === '43'
        ? 'Implement dark mode toggle'
        : `Pull Request #${params.prNumber}`,
      description: 'This PR adds new authentication components including login, signup, and password reset forms.',
      status: params.prNumber === '43' ? 'analyzing' : params.prNumber === '44' ? 'pending' : 'completed',
      authorUsername: 'jsmith',
      createdAt: '2025-03-15T10:24:00Z',
      reviewStartedAt: params.prNumber !== '44' ? '2025-03-15T10:30:00Z' : undefined,
      reviewCompletedAt: params.prNumber === '42' ? '2025-03-15T10:35:00Z' : undefined,
      commentCount: 5,
      reviewStyle: 'standard',
      htmlUrl: `https://github.com/${mockRepository.fullName}/pull/${params.prNumber}`
    };
    
    // Mock comments data
    const mockComments: Comment[] = [
      {
        id: 1,
        path: 'src/components/auth/LoginForm.jsx',
        line: 24,
        body: 'Consider adding error handling for network failures during authentication attempts.',
        severity: 'warning',
        createdAt: '2025-03-15T10:32:00Z'
      },
      {
        id: 2,
        path: 'src/components/auth/LoginForm.jsx',
        line: 45,
        body: 'The form submission does not prevent default behavior which could cause page reloads.',
        severity: 'error',
        createdAt: '2025-03-15T10:33:00Z'
      },
      {
        id: 3,
        path: 'src/components/auth/SignupForm.jsx',
        line: 12,
        body: 'Good use of form validation hooks to validate user input.',
        severity: 'info',
        createdAt: '2025-03-15T10:33:30Z'
      },
      {
        id: 4,
        path: 'src/services/auth.js',
        line: 37,
        body: 'This timeout might be too short for slow network connections. Consider increasing or making it configurable.',
        severity: 'warning',
        createdAt: '2025-03-15T10:34:15Z'
      },
      {
        id: 5,
        path: 'src/services/auth.js',
        line: 52,
        body: 'Potential security issue: storing the token in localStorage makes it vulnerable to XSS attacks. Consider using HttpOnly cookies instead.',
        severity: 'error',
        createdAt: '2025-03-15T10:34:45Z'
      }
    ];
    
    // Only include comments if PR is completed
    const comments = mockPullRequest.status === 'completed' ? mockComments : [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRepository(mockRepository);
    setPullRequest(mockPullRequest);
    setComments(comments);
    setIsLoading(false);
  };
  
  const triggerReanalysis = async () => {
    if (!pullRequest) return;
    
    alert(`Reanalyzing PR #${pullRequest.prNumber}`);
    
    // Update status to analyzing
    setPullRequest({
      ...pullRequest,
      status: 'analyzing'
    });
    
    // Simulate analysis delay
    setTimeout(() => {
      setPullRequest({
        ...pullRequest,
        status: 'completed',
        reviewStartedAt: new Date().toISOString(),
        reviewCompletedAt: new Date().toISOString()
      });
      
      // Add mock comments
      setComments([
        {
          id: 1,
          path: 'src/components/auth/LoginForm.jsx',
          line: 24,
          body: 'Consider adding error handling for network failures during authentication attempts.',
          severity: 'warning',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          path: 'src/components/auth/LoginForm.jsx',
          line: 45,
          body: 'The form submission does not prevent default behavior which could cause page reloads.',
          severity: 'error',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          path: 'src/components/auth/SignupForm.jsx',
          line: 12,
          body: 'Good use of form validation hooks to validate user input.',
          severity: 'info',
          createdAt: new Date().toISOString()
        }
      ]);
    }, 3000);
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

  const renderSeverityBadge = (severity: string) => {
    const severityClasses = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          severityClasses[severity as keyof typeof severityClasses]
        }`}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isLoading || !repository || !pullRequest) {
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
        <div className="mb-6">
          <Link
            href={`/repositories/${repository.id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Back to {repository.name}
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  #{pullRequest.prNumber}: {pullRequest.title}
                </h1>
                <div className="ml-4">
                  {renderStatusBadge(pullRequest.status)}
                </div>
              </div>
              <p className="text-gray-500 mt-1">
                Opened by {pullRequest.authorUsername} on {new Date(pullRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <a
                href={pullRequest.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50 transition-colors"
              >
                View on GitHub
              </a>
              {pullRequest.status === 'completed' && (
                <button
                  onClick={triggerReanalysis}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Re-analyze
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">PR Description</h2>
            <div className="bg-gray-50 p-4 rounded-md text-gray-700">
              <p>{pullRequest.description}</p>
            </div>
          </div>
        </div>
        
        {pullRequest.status === 'analyzing' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Analysis in Progress</h2>
              <p className="text-gray-500">
                The AI is analyzing your pull request. This may take a minute or two.
              </p>
            </div>
          </div>
        )}
        
        {pullRequest.status === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col items-center justify-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Analysis Pending</h2>
              <p className="text-gray-500 mb-4">
                This pull request is waiting to be analyzed.
              </p>
              <button
                onClick={triggerReanalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Analysis
              </button>
            </div>
          </div>
        )}
        
        {pullRequest.status === 'completed' && (
          <>
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Analysis Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Review Style</h3>
                    <p className="text-lg font-semibold text-gray-800 capitalize">{pullRequest.reviewStyle}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Issues Found</h3>
                    <div className="flex space-x-4">
                      <p className="text-lg font-semibold text-red-600">
                        {comments.filter(c => c.severity === 'error').length} Errors
                      </p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {comments.filter(c => c.severity === 'warning').length} Warnings
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Analysis Time</h3>
                    <p className="text-lg font-semibold text-gray-800">
                      {pullRequest.reviewCompletedAt && pullRequest.reviewStartedAt
                        ? Math.round((new Date(pullRequest.reviewCompletedAt).getTime() - new Date(pullRequest.reviewStartedAt).getTime()) / 1000)
                        : '?'} seconds
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-4">Review Timeline</h3>
                  <div className="relative pl-8 border-l-2 border-gray-200 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-800">Pull Request Created</p>
                        <p className="text-sm text-gray-500">{new Date(pullRequest.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {pullRequest.reviewStartedAt && (
                      <div className="relative">
                        <div className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-800">Analysis Started</p>
                          <p className="text-sm text-gray-500">{new Date(pullRequest.reviewStartedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {pullRequest.reviewCompletedAt && (
                      <div className="relative">
                        <div className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-800">Analysis Completed</p>
                          <p className="text-sm text-gray-500">{new Date(pullRequest.reviewCompletedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
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
                    Review Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === 'files'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Files Changed
                  </button>
                </nav>
              </div>
              
              {activeTab === 'overview' ? (
                <div className="divide-y divide-gray-200">
                  {comments.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No issues found in this pull request.</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded mr-2">
                              {comment.path}:{comment.line}
                            </span>
                            {renderSeverityBadge(comment.severity)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                          {comment.body}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-center text-gray-500">
                    File diff view is not implemented in this demo.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
