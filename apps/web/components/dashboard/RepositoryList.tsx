import React from 'react';
import Link from 'next/link';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  isEnabled: boolean;
}

interface RepositoryListProps {
  repositories: Repository[];
}

const RepositoryList: React.FC<RepositoryListProps> = ({ repositories }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Repositories</h2>
        <Link href="/repositories/add" className="text-blue-600 hover:text-blue-800 text-sm">
          Add Repository
        </Link>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">No repositories connected yet</p>
          <Link
            href="/repositories/add"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Connect GitHub Repository
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {repositories.map((repo) => (
            <li key={repo.id} className="py-3">
              <Link href={`/repositories/${repo.id}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{repo.name}</p>
                    <p className="text-sm text-gray-500">{repo.fullName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {repo.isPrivate && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                        Private
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        repo.isEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {repo.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RepositoryList;