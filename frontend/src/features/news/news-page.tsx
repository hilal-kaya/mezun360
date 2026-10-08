import { useState } from 'react'
import { useNews } from './api/newsApi'
import { NewsCard, NewsSkeleton } from './components/NewsCard'
import { Button } from '@/components/ui/button'

export function NewsPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, error } = useNews(page)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary font-barlow tracking-tight sm:text-5xl">
            Haberler ve Duyurular
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Bursa Teknik Üniversitesi ve Mezunlar Derneği'nden en güncel gelişmeleri takip edin.
          </p>
        </div>

        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex justify-center">
            {(error as any)?.problem?.detail || "Haberler yüklenirken bir hata oluştu."}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <NewsSkeleton key={i} />
            ))}
          </div>
        ) : data?.content && data.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {data.content.map(article => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {data.page && data.page.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                  variant="outline" 
                  className="rounded-full border-pastel-blue hover:bg-pastel-blue-light"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Önceki
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Sayfa {page + 1} / {data.page.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  className="rounded-full border-pastel-blue hover:bg-pastel-blue-light"
                  onClick={() => setPage(p => Math.min(data.page.totalPages - 1, p + 1))}
                  disabled={page >= data.page.totalPages - 1}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-pastel-blue shadow-sm">
            <h3 className="text-lg font-medium text-primary mb-2">Henüz bir haber yayınlanmadı</h3>
            <p className="text-muted-foreground">
              Şu anda sistemde kayıtlı haber veya duyuru bulunmuyor. Daha sonra tekrar kontrol edin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
