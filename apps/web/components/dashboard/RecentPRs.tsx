import React from 'react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils'

interface PullRequest {
  id: number;
  prNumber: number;
  title: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  repositoryName: string;
  repositoryId: number;
  authorUsername: string;
  createdAt: string;
  commentCount?: number;
}

interface RecentPRsProps {
  prs: PullRequest[];
}

const RecentPRs: React.FC<RecentPRsProps> = ({ prs }) => {
  // Helper function to render status badge
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Pull Requests</h2>

      {prs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No pull requests have been analyzed yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">PR</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Repository</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Author</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {prs.map((pr) => (
                <tr key={pr.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/repositories/${pr.repositoryId}/pr/${pr.prNumber}`}>
                      <div>
                        <span className="font-medium text-blue-600">#{pr.prNumber}</span>
                        <p className="text-sm text-gray-700">{pr.title}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/repositories/${pr.repositoryId}`}
                      className="text-sm text-gray-700 hover:text-gray-900"
                    >
                      {pr.repositoryName}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(pr.status)}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{pr.authorUsername}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{formatDateTime(new Date(pr.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/pull-requests" className="text-blue-600 hover:text-blue-800 text-sm">
          View All Pull Requests
        </Link>
      </div>
    </div>
  );
};

export default RecentPRs;