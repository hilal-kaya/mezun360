import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { ApiError } from '@/lib/api/client'
import { getHealth } from '@/services/health'

const palette = [
  ['Kurumsal lacivert', '#233A85', 'bg-primary text-white'],
  ['Mavi', '#DDE7FF', 'bg-pastel-blue'],
  ['Turkuaz', '#DDF6F4', 'bg-pastel-turquoise'],
  ['Nane', '#E4F4EA', 'bg-pastel-mint'],
  ['Lavanta', '#ECE8FA', 'bg-pastel-lavender'],
  ['Şeftali', '#FCE9DE', 'bg-pastel-peach'],
] as const

export default function FoundationPage() {
  const health = useQuery({ queryKey: ['technical-health'], queryFn: ({ signal }) => getHealth(signal), retry: false })
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <Badge>Yalnızca geliştirme ortamı</Badge>
        <h1>Teknik altyapı kontrolü</h1>
        <p className="text-lg text-muted-foreground">Bu sayfa API bağlantısını ve ortak arayüz bileşenlerini doğrular. Bir ürün ekranı değildir.</p>
      </div>
      <Card aria-labelledby="health-title" className="space-y-4">
        <h2 id="health-title">Backend bağlantısı</h2>
        <p className="text-muted-foreground">React → API istemcisi → Spring Boot → PostgreSQL</p>
        <div aria-live="polite">
          {health.isFetching ? <Loading label="Bağlantı kontrol ediliyor…" /> : health.isError ? (
            <div role="alert" className="space-y-1 text-destructive">
              <p>API bağlantısı doğrulanamadı. Backend ve veritabanının çalıştığını kontrol edin.</p>
              {health.error instanceof ApiError && <p className="text-sm">Kod: {health.error.code}{health.error.problem && ` · İz: ${health.error.problem.traceId}`}</p>}
            </div>
          ) : health.data ? <p><Badge className="bg-pastel-mint text-foreground">Bağlantı başarılı</Badge><span className="ml-3">{health.data.service} · {health.data.status}</span></p> : null}
        </div>
        <Button variant="outline" disabled={health.isFetching} onClick={() => void health.refetch()}>Bağlantıyı yeniden kontrol et</Button>
      </Card>
      <Card aria-labelledby="palette-title" className="space-y-4">
        <h2 id="palette-title">Renkler ve tipografi</h2>
        <p className="text-muted-foreground">Barlow · Türkçe karakterler: Çç Ğğ İı Öö Şş Üü</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {palette.map(([name, hex, color]) => <div key={hex} className={`rounded-lg p-4 ${color}`}><p className="font-semibold">{name}</p><p className="text-sm">{hex}</p></div>)}
        </div>
      </Card>
      <Card aria-labelledby="primitives-title" className="space-y-5">
        <h2 id="primitives-title">Ortak bileşenler</h2>
        <div className="max-w-sm space-y-2"><Label htmlFor="sample-input">Örnek metin alanı</Label><Input id="sample-input" placeholder="Bir metin yazın" autoComplete="off" aria-describedby="sample-help" /><p id="sample-help" className="text-sm text-muted-foreground">Girilen metin kaydedilmez veya gönderilmez.</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild><Button>İletişim kutusunu dene</Button></DialogTrigger>
            <DialogContent><DialogTitle>Temel iletişim kutusu</DialogTitle><DialogDescription>Klavye odağı bu alan içinde tutulur. Escape tuşuyla kapatabilirsiniz.</DialogDescription></DialogContent>
          </Dialog>
          <Button variant="outline" disabled>Devre dışı</Button>
          <Badge>Örnek etiket</Badge>
        </div>
      </Card>
    </div>
  )
}
