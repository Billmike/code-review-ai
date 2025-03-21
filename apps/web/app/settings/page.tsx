'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/common/Navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Settings() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // User settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [defaultReviewStyle, setDefaultReviewStyle] = useState('standard');
  
  // GitHub settings
  const [githubToken, setGithubToken] = useState('••••••••••••••••••••••••••');
  const [autoAnalyzeNewPRs, setAutoAnalyzeNewPRs] = useState(true);
  const [commentOnPRs, setCommentOnPRs] = useState(true);
  
  // AI settings
  const [aiEngine, setAiEngine] = useState('openai');
  const [maxCommentsPerFile, setMaxCommentsPerFile] = useState(10);
  const [includeSuggestions, setIncludeSuggestions] = useState(true);
  const [aiEndpoint, setAiEndpoint] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Fetch data if authenticated
    if (isAuthenticated && user) {
      fetchSettings();
    }
  }, [isAuthenticated, user]);

  const fetchSettings = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock settings data
    setEmailNotifications(true);
    setSlackNotifications(false);
    setSlackWebhook('');
    setDefaultReviewStyle('standard');
    setGithubToken('••••••••••••••••••••••••••');
    setAutoAnalyzeNewPRs(true);
    setCommentOnPRs(true);
    setAiEngine('openai');
    setMaxCommentsPerFile(10);
    setIncludeSuggestions(true);
    setAiEndpoint('');
    
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success message
    alert('Settings saved successfully');
    
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || !isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">User Settings</h2>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                    <p className="text-gray-700">{user?.username || 'jsmith'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                    <p className="text-gray-700">{user?.displayName || 'John Smith'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-700">{user?.email || 'john.smith@example.com'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">GitHub ID</label>
                    <p className="text-gray-700">{user?.githubId || '12345'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="emailNotifications" className="ml-2 text-gray-700">
                      Receive email notifications for completed reviews
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="slackNotifications"
                      checked={slackNotifications}
                      onChange={(e) => setSlackNotifications(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="slackNotifications" className="ml-2 text-gray-700">
                      Receive Slack notifications
                    </label>
                  </div>
                  {slackNotifications && (
                    <div className="ml-6">
                      <label htmlFor="slackWebhook" className="block text-sm font-medium text-gray-700 mb-1">
                        Slack Webhook URL
                      </label>
                      <input
                        type="text"
                        id="slackWebhook"
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Default Review Style</h3>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <button
                    onClick={() => setDefaultReviewStyle('standard')}
                    className={`px-4 py-2 rounded-md border ${
                      defaultReviewStyle === 'standard'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setDefaultReviewStyle('strict')}
                    className={`px-4 py-2 rounded-md border ${
                      defaultReviewStyle === 'strict'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Strict
                  </button>
                  <button
                    onClick={() => setDefaultReviewStyle('collaborative')}
                    className={`px-4 py-2 rounded-md border ${
                      defaultReviewStyle === 'collaborative'
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
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">GitHub Integration</h2>
              
              <div className="mb-6">
                <label htmlFor="githubToken" className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Personal Access Token
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    id="githubToken"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setGithubToken('')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your token needs <code>repo</code> and <code>read:user</code> scopes.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoAnalyzeNewPRs"
                    checked={autoAnalyzeNewPRs}
                    onChange={(e) => setAutoAnalyzeNewPRs(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoAnalyzeNewPRs" className="ml-2 text-gray-700">
                    Automatically analyze new pull requests
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="commentOnPRs"
                    checked={commentOnPRs}
                    onChange={(e) => setCommentOnPRs(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="commentOnPRs" className="ml-2 text-gray-700">
                    Comment directly on pull requests
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Settings</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Engine</label>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <button
                    onClick={() => setAiEngine('openai')}
                    className={`px-4 py-2 rounded-md border ${
                      aiEngine === 'openai'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => setAiEngine('anthropic')}
                    className={`px-4 py-2 rounded-md border ${
                      aiEngine === 'anthropic'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Anthropic Claude
                  </button>
                  <button
                    onClick={() => setAiEngine('custom')}
                    className={`px-4 py-2 rounded-md border ${
                      aiEngine === 'custom'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Custom
                  </button>
                </div>
              </div>
              
              {aiEngine === 'custom' && (
                <div className="mb-6">
                  <label htmlFor="aiEndpoint" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom AI Endpoint
                  </label>
                  <input
                    type="text"
                    id="aiEndpoint"
                    value={aiEndpoint}
                    onChange={(e) => setAiEndpoint(e.target.value)}
                    placeholder="https://your-custom-ai-endpoint.com/api"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="maxCommentsPerFile" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Comments Per File
                </label>
                <input
                  type="number"
                  id="maxCommentsPerFile"
                  min="1"
                  max="50"
                  value={maxCommentsPerFile}
                  onChange={(e) => setMaxCommentsPerFile(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Limit the number of comments the AI can make on a single file to avoid overwhelming developers.
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeSuggestions"
                  checked={includeSuggestions}
                  onChange={(e) => setIncludeSuggestions(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeSuggestions" className="ml-2 text-gray-700">
                  Include code suggestions in comments
                </label>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  Logout
                </button>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}