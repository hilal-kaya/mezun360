import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { useNewsArticle } from './api/newsApi'
import { Button } from '@/components/ui/button'

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: article, isLoading, isError, error } = useNewsArticle(id!)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-2xl w-full mb-8"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center max-w-md">
          {(error as any)?.problem?.detail || "Haber yüklenirken bir hata oluştu."}
        </div>
        <Button asChild variant="outline">
          <Link to="/app/news">Haberlere Dön</Link>
        </Button>
      </div>
    )
  }

  const dateStr = new Date(article.publishDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/app/news" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tüm Haberlere Dön
          </Link>
        </div>
      </div>
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary font-barlow tracking-tight mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.publishDate}>{dateStr}</time>
            </div>
            {article.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
            )}
          </div>
        </header>

        {article.imageUrl && (
          <figure className="mb-12">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-sm"
            />
          </figure>
        )}

        <div className="prose prose-lg prose-blue mx-auto text-gray-700 leading-relaxed font-barlow">
          <p className="text-xl font-medium text-gray-900 mb-8 border-l-4 border-primary pl-4">
            {article.summary}
          </p>
          <div className="whitespace-pre-line">
            {article.content}
          </div>
        </div>
      </article>
    </div>
  )
}
