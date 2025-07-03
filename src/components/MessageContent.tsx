'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface MessageContentProps {
  content: string
  role: 'user' | 'assistant'
}

export function MessageContent({ content, role }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

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
          },
          img({ src, alt }: any) {
            // Handle empty src to prevent browser reload
            if (!src || src.trim() === '') {
              return (
                <span className="inline-block bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                  🖼️ Resim yükleniyor...
                </span>
              )
            }
            
            return (
              <img 
                src={src}
                alt={alt || 'Generated Image'}
                className="max-w-full h-auto rounded-lg shadow-lg my-4 border border-gray-200 dark:border-gray-700 block cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setLightboxImage(src)}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  console.log('Image load error:', src)
                }}
                onLoad={() => {
                  console.log('Image loaded successfully')
                }}
              />
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Portal ile body'e render edilen lightbox */}
      {lightboxImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-[99999] p-2 sm:p-4 md:p-6"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative w-full h-full max-w-[98vw] max-h-[98vh] sm:max-w-[95vw] sm:max-h-[95vh] md:max-w-[90vw] md:max-h-[90vh] lg:max-w-[85vw] lg:max-h-[85vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-8 sm:-top-12 right-0 bg-gray-600 bg-opacity-80 hover:bg-gray-500 hover:bg-opacity-90 text-white p-1.5 sm:p-2 rounded-full z-10 transition-all shadow-lg"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-2" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="w-full h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
