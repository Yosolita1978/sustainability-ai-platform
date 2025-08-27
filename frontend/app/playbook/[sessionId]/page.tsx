// app/playbook/[sessionId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

interface PlaybookMetadata {
    file_size: number;
    generated_at: string;
    company_name: string;
    regulatory_framework: string;
    training_level: string;
    content_length: number;
    line_count: number;
}

interface PlaybookResponse {
    session_id: string;
    status: string;
    content: string;
    metadata: PlaybookMetadata;
}

export default function PlaybookPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [playbookData, setPlaybookData] = useState<PlaybookResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID provided');
            setLoading(false);
            return;
        }

        const fetchPlaybookData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/training/playbook/${sessionId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch playbook data: ${response.status}`);
                }

                const data: PlaybookResponse = await response.json();
                setPlaybookData(data);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching playbook:', err);
                setError(err instanceof Error ? err.message : 'Failed to load playbook');
                setLoading(false);
            }
        };

        fetchPlaybookData();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Playbook...</h2>
                    <p className="text-gray-600">Preparing your sustainability training content</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Playbook</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.push(`/results?id=${sessionId}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            ← Back to Results
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Start New Training
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!playbookData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
            {/* Back to Results Button */}
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={() => router.push(`/results?id=${sessionId}`)}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow border border-gray-200 transition-colors duration-200 flex items-center space-x-2"
                >
                    <span>←</span>
                    <span>Back to Results</span>
                </button>
            </div>

            {/* Markdown Content */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
                <MarkdownRenderer
                    content={playbookData.content}
                    showTOC={true}
                />
            </div>
        </div>
    );
}