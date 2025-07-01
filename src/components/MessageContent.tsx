'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MessageContentProps {
  content: string
  role: 'user' | 'assistant'
}

export function MessageContent({ content, role }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (role === 'user') {
    return (
      <div className="whitespace-pre-wrap text-white">
        {content}
      </div>
    )
  }

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const codeString = String(children).replace(/\n$/, '')
            
            return !inline && match ? (
              <div className="relative group">
                <button
                  onClick={() => copyToClipboard(codeString)}
                  className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors z-10 opacity-0 group-hover:opacity-100"
                  title="Copy code"
                >
                  {copiedCode === codeString ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg !mt-2 !mb-4"
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code 
                className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-100" 
                {...props}
              >
                {children}
              </code>
            )
          },
          pre({ children }: any) {
            return <>{children}</>
          },
          h1({ children }: any) {
            return <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>
          },
          h2({ children }: any) {
            return <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{children}</h2>
          },
          h3({ children }: any) {
            return <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{children}</h3>
          },
          p({ children }: any) {
            return <p className="mb-3 text-gray-900 dark:text-gray-100 leading-relaxed">{children}</p>
          },
          ul({ children }: any) {
            return <ul className="list-disc list-inside mb-3 space-y-1 text-gray-900 dark:text-gray-100">{children}</ul>
          },
          ol({ children }: any) {
            return <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-900 dark:text-gray-100">{children}</ol>
          },
          li({ children }: any) {
            return <li className="text-gray-900 dark:text-gray-100">{children}</li>
          },
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-green-500 pl-4 my-4 italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-2 rounded-r">
                {children}
              </blockquote>
            )
          },
          a({ href, children }: any) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline"
              >
                {children}
              </a>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
