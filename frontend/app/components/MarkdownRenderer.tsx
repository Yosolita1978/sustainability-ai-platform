'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
import { markdownPlugins, extractTableOfContents, flattenTOC, TOCItem } from '@/app/lib/markdown';

interface MarkdownRendererProps {
  content: string;
  showTOC?: boolean;
  className?: string;
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
}

export default function MarkdownRenderer({ 
  content, 
  showTOC = true, 
  className = '' 
}: MarkdownRendererProps) {
  const [toc, setTOC] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isTOCCollapsed, setIsTOCCollapsed] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string>('');

  // Helper function for generating anchor IDs (inlined to avoid import issues)
  const generateAnchorId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters (including emojis)
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Extract TOC on content change
  useEffect(() => {
    const tableOfContents = extractTableOfContents(content);
    setTOC(tableOfContents);
  }, [content]);

  // Track active section while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const headings = flattenTOC(toc);
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  // Copy link to clipboard
  const copyLinkToClipboard = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL without triggering navigation
      window.history.pushState({}, '', `#${id}`);
    }
  };

  // Custom heading component with anchor links
  const HeadingComponent = ({ level, children, ...props }: HeadingProps) => {
    const text = React.Children.toArray(children).join('');
    const id = generateAnchorId(text);
    
    const headingProps = {
      ...props,
      id,
      className: `group relative ${getHeadingClasses(level)} ${props.className || ''}`,
    };

    const content = (
      <>
        {children}
        <button
          onClick={() => copyLinkToClipboard(id)}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-500 hover:text-blue-700"
          aria-label="Copy link to this section"
          title="Copy link"
        >
          {copySuccess === id ? (
            <span className="text-green-500">✓</span>
          ) : (
            <span className="text-lg">🔗</span>
          )}
        </button>
      </>
    );

    switch (level) {
      case 1: return <h1 {...headingProps}>{content}</h1>;
      case 2: return <h2 {...headingProps}>{content}</h2>;
      case 3: return <h3 {...headingProps}>{content}</h3>;
      case 4: return <h4 {...headingProps}>{content}</h4>;
      case 5: return <h5 {...headingProps}>{content}</h5>;
      case 6: return <h6 {...headingProps}>{content}</h6>;
      default: return <h1 {...headingProps}>{content}</h1>;
    }
  };

  // Get Tailwind classes for different heading levels
  const getHeadingClasses = (level: number): string => {
    const baseClasses = "font-bold text-gray-900 mt-8 mb-4 first:mt-0";
    switch (level) {
      case 1: return `${baseClasses} text-3xl md:text-4xl border-b-2 border-gray-200 pb-2`;
      case 2: return `${baseClasses} text-2xl md:text-3xl`;
      case 3: return `${baseClasses} text-xl md:text-2xl`;
      case 4: return `${baseClasses} text-lg md:text-xl`;
      case 5: return `${baseClasses} text-base md:text-lg`;
      case 6: return `${baseClasses} text-sm md:text-base`;
      default: return baseClasses;
    }
  };

  // TOC Item Component
  const TOCItemComponent = ({ item, level = 0 }: { item: TOCItem; level?: number }) => (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      <button
        onClick={() => scrollToSection(item.id)}
        className={`block w-full text-left py-1 px-2 rounded text-sm transition-colors duration-200 ${
          activeId === item.id
            ? 'bg-blue-100 text-blue-800 font-medium'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
        }`}
      >
        <span className="truncate block">{item.text}</span>
      </button>
      {item.children && (
        <div className="mt-1">
          {item.children.map((child) => (
            <TOCItemComponent key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  // Custom component definitions for ReactMarkdown
  const components: Components = {
    // Custom heading components with anchor links
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingComponent level={1} {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingComponent level={2} {...props} />,
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingComponent level={3} {...props} />,
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingComponent level={4} {...props} />,
    h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingComponent level={5} {...props} />,
    h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => <HeadingComponent level={6} {...props} />,
    
    // Custom link component (external links open in new tab)
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={href}
        {...props}
        {...(href?.startsWith('http') && {
          target: '_blank',
          rel: 'noopener noreferrer'
        })}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    
    // Custom paragraph styling
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...props} className="text-gray-800 leading-relaxed mb-4">
        {children}
      </p>
    ),
    
    // Custom code block styling
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre 
        {...props} 
        className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm"
      >
        {children}
      </pre>
    ),
    
    // Custom inline code styling
    code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
      // Check if it's a code block (has className) or inline code
      if (className) {
        return <code className={className} {...props}>{children}</code>;
      }
      return (
        <code 
          {...props} 
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {children}
        </code>
      );
    },
    
    // Custom table styling
    table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="overflow-x-auto">
        <table {...props} className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    ),
    
    // Custom list styling
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul {...props} className="list-disc pl-6 space-y-2 my-4">
        {children}
      </ul>
    ),
    
    ol: ({ children, ...props }: React.OlHTMLAttributes<HTMLOListElement>) => (
      <ol {...props} className="list-decimal pl-6 space-y-2 my-4">
        {children}
      </ol>
    ),
    
    // Custom list item styling
    li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
      <li {...props} className="text-gray-800 leading-relaxed">
        {children}
      </li>
    ),
    
    // Custom blockquote styling
    blockquote: ({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
      <blockquote 
        {...props} 
        className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700"
      >
        {children}
      </blockquote>
    ),

    // Custom strong/bold styling
    strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong {...props} className="font-bold text-gray-900">
        {children}
      </strong>
    ),
  };

  return (
    <div className={`flex gap-8 ${className}`}>
      {/* Table of Contents Sidebar */}
      {showTOC && toc.length > 0 && (
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-[calc(100vh-6rem)] overflow-hidden">
              {/* TOC Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Table of Contents</h3>
                <button
                  onClick={() => setIsTOCCollapsed(!isTOCCollapsed)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={isTOCCollapsed ? 'Expand TOC' : 'Collapse TOC'}
                >
                  {isTOCCollapsed ? '▶' : '▼'}
                </button>
              </div>
              
              {/* TOC Content */}
              {!isTOCCollapsed && (
                <div className="p-4 overflow-y-auto max-h-[600px]">
                  <nav>
                    {toc.map((item) => (
                      <TOCItemComponent key={item.id} item={item} />
                    ))}
                  </nav>
                </div>
              )}
            </div>
            
            {/* Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              ↑ Back to Top
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile TOC Toggle */}
        {showTOC && toc.length > 0 && (
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsTOCCollapsed(!isTOCCollapsed)}
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-left flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">Table of Contents</span>
              <span className="text-gray-500">{isTOCCollapsed ? '▼' : '▲'}</span>
            </button>
            
            {!isTOCCollapsed && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg p-4">
                <nav>
                  {toc.map((item) => (
                    <TOCItemComponent key={item.id} item={item} />
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-lg prose-gray max-w-none">
          <ReactMarkdown
            remarkPlugins={markdownPlugins.remarkPlugins}
            rehypePlugins={markdownPlugins.rehypePlugins}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}