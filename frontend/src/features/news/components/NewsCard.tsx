import { Calendar, User } from 'lucide-react'
import type { NewsArticleDTO } from '../types'

interface NewsCardProps {
  article: NewsArticleDTO
}

export function NewsCard({ article }: NewsCardProps) {
  const dateStr = new Date(article.publishDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pastel-blue flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden group">
      {article.imageUrl ? (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-pastel-blue/30 flex items-center justify-center">
          <span className="text-primary font-barlow text-lg opacity-50">BTÜ Mezun360</span>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-primary font-barlow mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.summary}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            {article.author && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <User className="w-3.5 h-3.5" />
                <span className="line-clamp-1">{article.author}</span>
              </div>
            )}
          </div>
          
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            Devamını Oku <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function NewsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pastel-blue h-full overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-6 flex flex-col gap-4">
        <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <div className="h-4 bg-gray-200 rounded-md w-24"></div>
          <div className="h-4 bg-gray-200 rounded-md w-20"></div>
        </div>
      </div>
    </div>
  )
}
