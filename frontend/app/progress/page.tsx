// app/progress/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TrainingStatus {
  session_id: string;
  status: 'created' | 'started' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  created_at: string;
  completed_at?: string;
  error?: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');

  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Timer for elapsed time
    const timeTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Polling function
    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/training/status/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.status}`);
        }

        const statusData: TrainingStatus = await response.json();
        setStatus(statusData);
        setLoading(false);

        // Redirect when completed
        if (statusData.status === 'completed') {
          setTimeout(() => {
            router.push(`/results?id=${sessionId}`);
          }, 2000); // Wait 2 seconds to show completion
        }

        // Handle failed status
        if (statusData.status === 'failed') {
          setError(statusData.error || 'Training failed');
        }

      } catch (err) {
        console.error('Polling error:', err);
        setError(err instanceof Error ? err.message : 'Failed to check status');
        setLoading(false);
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval (every 3 seconds)
    const pollInterval = setInterval(pollStatus, 3000);

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
      clearInterval(timeTimer);
    };
  }, [sessionId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-blue-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'created':
        return '🔄';
      case 'started':
        return '🤖';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Training System...</h2>
          <p className="text-gray-600">Please wait while we initialize your session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Training Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start New Training
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {getStatusIcon(status.status)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Training in Progress
          </h1>
          <p className="text-gray-600">
            Our AI agents are analyzing regulations and creating your custom sustainability messaging training
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Training Progress</span>
            <span className="text-sm font-medium text-gray-900">{status.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ease-out ${getProgressColor(status.progress)}`}
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 font-medium mb-1">Current Step:</p>
            <p className="text-gray-600">{status.current_step}</p>
          </div>
        </div>

        {/* Status Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-blue-600 font-medium mb-1">Status</p>
            <p className="text-blue-800 capitalize">{status.status.replace('_', ' ')}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-green-600 font-medium mb-1">Time Elapsed</p>
            <p className="text-green-800 font-mono">{formatTime(timeElapsed)}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-purple-600 font-medium mb-1">Session ID</p>
            <p className="text-purple-800 font-mono text-xs">{status.session_id.split('-')[0]}...</p>
          </div>
        </div>

        {/* Progress Steps Visualization */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Process</h3>
          <div className="space-y-3">
            {[
              { step: 'Analyzing your business context', threshold: 10 },
              { step: 'Researching industry regulations', threshold: 30 },
              { step: 'Identifying messaging risks', threshold: 50 },
              { step: 'Generating compliant alternatives', threshold: 70 },
              { step: 'Building implementation roadmap', threshold: 90 },
              { step: 'Creating comprehensive playbook', threshold: 100 }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                  status.progress >= item.threshold 
                    ? 'bg-green-500' 
                    : status.progress >= item.threshold - 10 
                      ? 'bg-yellow-500 animate-pulse' 
                      : 'bg-gray-300'
                }`}></div>
                <span className={`text-sm ${
                  status.progress >= item.threshold 
                    ? 'text-gray-900 font-medium' 
                    : status.progress >= item.threshold - 10
                      ? 'text-gray-700'
                      : 'text-gray-500'
                }`}>
                  {item.step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Notice */}
        {status.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-600 text-2xl mb-2">🎉</div>
            <p className="text-green-800 font-medium mb-2">Training Complete!</p>
            <p className="text-green-600 text-sm">Redirecting to your results...</p>
          </div>
        )}

        {/* Action Button */}
        {status.status !== 'completed' && (
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
            >
              ← Start a different training
            </button>
          </div>
        )}
      </div>
    </div>
  );
}