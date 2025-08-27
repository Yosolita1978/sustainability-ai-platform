// app/results/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function ResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('id');

    const [playbookData, setPlaybookData] = useState<PlaybookResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

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
                setError(err instanceof Error ? err.message : 'Failed to load results');
                setLoading(false);
            }
        };

        fetchPlaybookData();
    }, [sessionId]);

    const handleDownload = async () => {
        if (!sessionId) return;

        setDownloading(true);

        try {
            const response = await fetch(`http://localhost:8000/api/training/download/${sessionId}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            // Get the filename from the response headers or use a default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'sustainability-training-playbook.md';

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to download playbook');
        } finally {
            setDownloading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPreviewContent = (content: string): string => {
        // Extract first few lines for preview, stopping at first major section
        const lines = content.split('\n');
        const previewLines = [];
        let lineCount = 0;

        for (const line of lines) {
            if (lineCount > 20) break;
            previewLines.push(line);
            lineCount++;

            // Stop at table of contents or first major section
            if (line.includes('## 📋 Table of Contents') && lineCount > 10) {
                previewLines.push('\n*...comprehensive content continues...*');
                break;
            }
        }

        return previewLines.join('\n');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Results...</h2>
                    <p className="text-gray-600">Preparing your sustainability training playbook</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl text-center">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Results</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={() => router.push(`/progress?id=${sessionId}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Check Progress
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
            <div className="max-w-4xl mx-auto">

                {/* Success Header */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Training Complete!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your comprehensive sustainability messaging playbook has been generated and is ready for download.
                    </p>

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-200 text-lg"
                    >
                        {downloading ? (
                            <>
                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Downloading...
                            </>
                        ) : (
                            <>
                                📥 Download Complete Playbook
                            </>
                        )}
                    </button>
                </div>

                {/* Playbook Details */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Playbook Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-blue-600 text-2xl mb-2">🏢</div>
                            <h3 className="font-semibold text-blue-900 mb-1">Company</h3>
                            <p className="text-blue-800">{playbookData.metadata.company_name}</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-green-600 text-2xl mb-2">⚖️</div>
                            <h3 className="font-semibold text-green-900 mb-1">Regulatory Framework</h3>
                            <p className="text-green-800">{playbookData.metadata.regulatory_framework}</p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-purple-600 text-2xl mb-2">🎯</div>
                            <h3 className="font-semibold text-purple-900 mb-1">Training Level</h3>
                            <p className="text-purple-800 capitalize">{playbookData.metadata.training_level}</p>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="text-yellow-600 text-2xl mb-2">📄</div>
                            <h3 className="font-semibold text-yellow-900 mb-1">Content Size</h3>
                            <p className="text-yellow-800">{formatFileSize(playbookData.metadata.file_size)}</p>
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-4">
                            <div className="text-indigo-600 text-2xl mb-2">📏</div>
                            <h3 className="font-semibold text-indigo-900 mb-1">Length</h3>
                            <p className="text-indigo-800">{playbookData.metadata.line_count.toLocaleString()} lines</p>
                        </div>

                        <div className="bg-pink-50 rounded-lg p-4">
                            <div className="text-pink-600 text-2xl mb-2">🕒</div>
                            <h3 className="font-semibold text-pink-900 mb-1">Generated</h3>
                            <p className="text-pink-800 text-sm">{formatDate(playbookData.metadata.generated_at)}</p>
                        </div>
                    </div>
                </div>

                {/* What's Included */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 What&apos;s Included in Your Playbook</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="text-green-500 text-xl">✅</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Business Scenario Analysis</h4>
                                    <p className="text-gray-600 text-sm">Detailed analysis of your company&apos;s sustainability context</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="text-green-500 text-xl">✅</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                                    <p className="text-gray-600 text-sm">4 problematic messaging examples with regulatory analysis</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="text-green-500 text-xl">✅</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Compliant Alternatives</h4>
                                    <p className="text-gray-600 text-sm">4 corrected messages with compliance guidance</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="text-green-500 text-xl">✅</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Implementation Roadmap</h4>
                                    <p className="text-gray-600 text-sm">Step-by-step deployment plan with timelines</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="text-green-500 text-xl">✅</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Regulatory Compliance Guide</h4>
                                    <p className="text-gray-600 text-sm">Framework-specific requirements and checklists</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="text-green-500 text-xl">✅</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Quick Reference Tools</h4>
                                    <p className="text-gray-600 text-sm">Daily-use frameworks and validation checklists</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">👀 Playbook Preview</h2>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-hidden">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
                            {getPreviewContent(playbookData.content)}
                        </pre>
                    </div>
                    <p className="text-gray-500 text-sm mt-2 text-center">
                        This is just a preview. View the complete playbook for full interactive content.
                    </p>
                </div>

                {/* {playbookData && (
                    <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Playbook Renderer Test</h2>
                        <MarkdownRenderer
                            content={playbookData.content}
                            showTOC={true}
                        />
                    </div>
                )} */}

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
                        <button
                            onClick={() => router.push(`/playbook/${sessionId}`)}
                            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                        >
                            📖 View Playbook
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                        >
                            {downloading ? 'Downloading...' : '📥 Download Playbook'}
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                        >
                            🚀 Generate New Training
                        </button>
                    </div>

                    <p className="text-gray-500 text-sm mt-4">
                        Your playbook contains comprehensive, AI-generated sustainability messaging guidance specific to your business context.
                    </p>
                </div>
            </div>
        </div>
    );
}