import {
  ArrowUpRight,
  BriefcaseBusiness,
  Compass,
  Handshake,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  Users,
} from 'lucide-react'

export function CommunityVisual() {
  return (
    <div
      className="community-visual"
      role="img"
      aria-label="BTÜ topluluğunu mezun ağı, kariyer fırsatları ve deneyim paylaşımıyla bağlayan temsili ağ"
    >
      <div className="community-orbit orbit-one" />
      <div className="community-orbit orbit-two" />
      <svg
        className="community-lines"
        viewBox="0 0 500 430"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M250 220C160 220 175 85 85 85M250 220C370 220 345 105 430 105M250 220C155 220 195 350 95 350M250 220C330 220 325 350 405 350"
          stroke="#9CAED6"
          strokeWidth="1.5"
          strokeDasharray="5 6"
        />
      </svg>
      <div className="community-center">
        <span className="text-xs font-semibold tracking-widest text-pastel-blue">
          AYNI YERDEN BAŞLADIK
        </span>
        <span className="mt-2 text-3xl font-semibold">
          Birlikte ilerliyoruz.
        </span>
        <span className="mt-4 text-sm text-pastel-blue">BTÜ Mezun360</span>
      </div>
      <div className="community-node node-network">
        <Users className="bg-pastel-blue" aria-hidden="true" />
        <span>
          Yeni bağlantılar<small>Ortak bir geçmiş</small>
        </span>
      </div>
      <div className="community-node node-career">
        <BriefcaseBusiness className="bg-pastel-mint" aria-hidden="true" />
        <span>
          Yeni yollar<small>Kariyerine bir adım</small>
        </span>
      </div>
      <div className="community-node node-mentor">
        <MessageCircle className="bg-pastel-lavender" aria-hidden="true" />
        <span>
          Paylaşılan deneyim<small>Birlikte öğrenmek</small>
        </span>
      </div>
      <div className="community-note">
        <span className="h-2 w-2 rounded-full bg-primary" />
        Mezuniyet bir başlangıç.
      </div>
    </div>
  )
}

export function AlumniPreview() {
  return (
    <figure className="alumni-preview" aria-labelledby="alumni-preview-caption">
      <figcaption id="alumni-preview-caption" className="preview-caption">
        <span>MEZUN DENEYİMİ</span>
        <span>Tasarım önizlemesi · Temsili içerik</span>
      </figcaption>
      <div className="preview-window">
        <div className="preview-sidebar" aria-hidden="true">
          <p className="mb-8 text-lg font-bold text-primary">Mezun360</p>
          <div className="preview-active">
            <LayoutDashboard size={16} />
            Ana Sayfa
          </div>
          <div>
            <Users size={16} />
            Mezun Ağı
          </div>
          <div>
            <BriefcaseBusiness size={16} />
            Kariyer
          </div>
          <div>
            <MessageCircle size={16} />
            Mentörlük
          </div>
          <p className="mt-auto pt-12 text-xs text-muted-foreground">
            Ortak geçmiş, yeni yollar.
          </p>
        </div>
        <div className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Senin Mezun360 alanın
              </p>
              <h3 className="mt-1 text-xl font-semibold text-primary sm:text-2xl">
                Yolculuğunun yeni sayfası.
              </h3>
            </div>
            <span className="rounded-full bg-pastel-blue p-3 text-primary">
              <Compass size={22} aria-hidden="true" />
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="preview-tile bg-pastel-blue">
              <Users aria-hidden="true" />
              <p>Mezun ağın</p>
              <span>Bir bağ, birçok olasılık</span>
            </div>
            <div className="preview-tile bg-pastel-mint">
              <BriefcaseBusiness aria-hidden="true" />
              <p>Kariyer rotan</p>
              <span>Yeni adımlara yer aç</span>
            </div>
            <div className="preview-tile bg-pastel-lavender">
              <MessageCircle aria-hidden="true" />
              <p>Deneyim paylaşımı</p>
              <span>Birlikte düşün, ilerle</span>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_1fr]">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <p className="mb-4 font-semibold">Kariyer fırsatları</p>
              <div className="flex flex-wrap gap-2">
                {['İş', 'Staj', 'İMEP', 'Yeni Mezun'].map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-background px-3 py-1 text-sm text-primary"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Hedeflerine uygun yolları bir arada keşfet.
              </p>
            </div>
            <div className="rounded-xl bg-pastel-turquoise p-5">
              <span className="text-xs font-semibold tracking-wider text-primary">
                HIZLI MENTÖRLÜK
              </span>
              <p className="my-2 font-semibold">
                Kısa bir sohbet.
                <br />
                Yeni bir bakış açısı.
              </p>
              <p className="text-sm text-muted-foreground">
                Deneyimli mezunlarla yolunu birlikte düşün.
              </p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}

export function InsightPreview() {
  return (
    <figure className="insight-preview" aria-labelledby="insight-caption">
      <figcaption
        id="insight-caption"
        className="flex flex-wrap justify-between gap-2 border-b border-border/60 pb-4 text-xs font-semibold text-muted-foreground"
      >
        <span>KARİYER MERKEZİ</span>
        <span>Tasarım önizlemesi · Temsili içerik</span>
      </figcaption>
      <div className="mt-6 flex items-center gap-3">
        <span className="rounded-xl bg-pastel-lavender p-3 text-primary">
          <Sparkles size={22} aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold">Topluluğun ortak resmi</h3>
          <p className="text-sm text-muted-foreground">
            Kişilerden toplu eğilimlere
          </p>
        </div>
      </div>
      <div className="mt-7 space-y-4" aria-hidden="true">
        {[
          ['Sektörler', 'w-4/5', 'bg-pastel-blue'],
          ['Yetkinlikler', 'w-3/5', 'bg-pastel-turquoise'],
          ['Mezun katılımı', 'w-2/3', 'bg-pastel-lavender'],
        ].map(([label, width, color]) => (
          <div key={label}>
            <p className="mb-2 text-sm text-muted-foreground">{label}</p>
            <div className="h-6 rounded-md bg-background">
              <div className={`h-full rounded-md ${width} ${color}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-primary">
        <Handshake size={18} aria-hidden="true" />
        <span>Daha güçlü bir üniversite–mezun bağı</span>
        <ArrowUpRight
          className="ml-auto shrink-0"
          size={18}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Çizimler örnektir; gerçek istatistik veya mezun verisi içermez.
      </p>
    </figure>
  )
}
