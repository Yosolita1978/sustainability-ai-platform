import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

// Types for our utilities
export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

// Step 4: Simple plugin configuration that actually works
export const markdownPlugins = {
  // Remark plugins (process markdown)
  remarkPlugins: [remarkGfm],
  
  // Rehype plugins (process HTML) - simplified
  rehypePlugins: [rehypeSanitize],
};

// Step 5: Table of Contents Extractor
export function extractTableOfContents(markdownContent: string): TOCItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  // Extract all headings
  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const level = match[1].length; // Count # symbols
    const text = match[2].trim();
    
    // Clean up text (remove emojis and extra formatting for ID)
    const id = generateAnchorId(text);
    
    headings.push({
      id,
      text,
      level
    });
  }

  // Convert flat list to nested structure
  return buildNestedTOC(headings);
}

// Helper: Generate clean anchor IDs from heading text
function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters (including emojis)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Helper: Convert flat headings to nested structure
function buildNestedTOC(headings: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const heading of headings) {
    // Remove items from stack that are at same or deeper level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top level item
      result.push(heading);
    } else {
      // Nested item
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    stack.push(heading);
  }

  return result;
}

// Helper: Flatten nested TOC for simple iteration
export function flattenTOC(toc: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  
  function traverse(items: TOCItem[]) {
    for (const item of items) {
      result.push(item);
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  
  traverse(toc);
  return result;
}

// Helper: Get next/previous headings for navigation
export function getAdjacentHeadings(toc: TOCItem[], currentId: string) {
  const flatTOC = flattenTOC(toc);
  const currentIndex = flatTOC.findIndex(item => item.id === currentId);
  
  return {
    previous: currentIndex > 0 ? flatTOC[currentIndex - 1] : null,
    next: currentIndex < flatTOC.length - 1 ? flatTOC[currentIndex + 1] : null
  };
}