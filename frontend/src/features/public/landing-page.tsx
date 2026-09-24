import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductIdentity } from '@/components/product-identity'
import { PublicHeader } from './public-header'
import {
  AlumniPreview,
  CommunityVisual,
  InsightPreview,
} from './product-previews'
import './public.css'

const values = [
  {
    id: 'mezun-agi',
    icon: Users,
    title: 'Mezun Ağı',
    text: 'Farklı sektörlerde çalışan BTÜ mezunlarıyla bağlantı kur.',
    color: 'bg-pastel-blue',
    label: 'ORTAK GEÇMİŞ, YENİ BAĞLANTILAR',
  },
  {
    id: 'kariyer',
    icon: BriefcaseBusiness,
    title: 'Kariyer Fırsatları',
    text: 'İş, staj, İMEP ve yeni mezun fırsatlarını keşfet.',
    color: 'bg-pastel-mint',
    label: 'YOLUNU BİRLİKTE BÜYÜTELİM',
  },
  {
    id: 'mentorluk',
    icon: MessageCircle,
    title: 'Mentörlük',
    text: 'Deneyimli mezunlarla kariyer yolculuğunda bir araya gel.',
    color: 'bg-pastel-lavender',
    label: 'DENEYİMDEN İLHAM AL',
  },
  {
    id: 'katki',
    icon: HeartHandshake,
    title: 'BTÜ’ye Katkı',
    text: 'Mentörlük yap, fırsat paylaş ve deneyiminle yeni mezunlara destek ol.',
    color: 'bg-pastel-peach',
    label: 'BİLDİKLERİN BİR YOL AÇSIN',
  },
]

const privacyPoints = [
  {
    icon: Settings2,
    title: 'Görünürlüğüne sen karar ver',
    text: 'Profil görünürlüğü, mezunun tercihiyle yönetilecek.',
  },
  {
    icon: LockKeyhole,
    title: 'İletişim bilgilerin herkese açık değil',
    text: 'Kişisel e-posta, telefon ve iletişim detayları korunur.',
  },
  {
    icon: Users,
    title: 'Mezun ağına katılım isteğe bağlı',
    text: 'Rehbere katılmak açık bir tercih gerektirir.',
  },
  {
    icon: ShieldCheck,
    title: 'Yetkiye göre erişim',
    text: 'Üyelere ve yöneticilere sunulan alanlar sunucuda korunur.',
  },
]

export function LandingPage() {
  return (
    <div className="public-site">
      <a href="#main" className="public-skip">
        İçeriğe geç
      </a>
      <PublicHeader />
      <main id="main" tabIndex={-1}>
        <section
          className="public-container hero-section"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              BURSA TEKNİK ÜNİVERSİTESİ
            </p>
            <h1 id="hero-title" className="hero-title">
              BTÜ ile bağın
              <br />
              <span>mezuniyetle bitmez.</span>
            </h1>
            <p className="hero-description">
              Kariyerini geliştir, bağlantılar kur ve deneyimini BTÜ
              topluluğuyla paylaş.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="px-7">
                <Link to="/login">
                  Giriş Yap
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-border bg-transparent px-6"
              >
                <a href="#platform">
                  Platformu Keşfet
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Aynı üniversiteden, hayatın farklı yollarına.
            </p>
          </div>
          <CommunityVisual />
        </section>
        <section
          id="platform"
          className="public-container section-space border-t"
          aria-labelledby="platform-title"
        >
          <div className="section-intro">
            <div>
              <p className="eyebrow">BAĞLARIN GÜCÜYLE</p>
              <h2 id="platform-title" className="section-title">
                Birlikte daha ileri.
              </h2>
            </div>
            <p className="section-description">
              Mezuniyetin ardından da yanında olacak bir topluluk. Yeni
              bağlantılar, paylaşılan deneyimler ve kariyerinin bir sonraki
              adımı.
            </p>
          </div>
          <div className="value-grid">
            {values.map(({ id, icon: Icon, title, text, color, label }) => (
              <article id={id} key={id} className="value-item">
                <span className={`value-icon ${color}`}>
                  <Icon size={24} aria-hidden="true" />
                </span>
                <p className="mt-6 text-[11px] font-semibold tracking-widest text-muted-foreground">
                  {label}
                </p>
                <h3 className="mb-3 mt-2 text-xl font-semibold text-primary">
                  {title}
                </h3>
                <p className="text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Platform adım adım gelişiyor. Mezun ağı, kariyer ve mentörlük
            özellikleri yakında.
          </p>
        </section>
        <section className="bg-pastel-blue/35" aria-labelledby="preview-title">
          <div className="public-container section-space">
            <div className="mb-10 max-w-2xl">
              <p className="eyebrow">SANA AİT BİR ALAN</p>
              <h2 id="preview-title" className="section-title">
                Kariyerin, bağlantıların,
                <br />
                bir sonraki adımın.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Mezun360 deneyimine bir bakış. Sana özel bir başlangıçtan yeni
                fırsatlara uzanan, birlikte tasarlanan bir alan.
              </p>
            </div>
            <AlumniPreview />
            <p className="mt-5 text-sm text-muted-foreground">
              Yakında sunulacak mezun deneyiminden bir tasarım önizlemesi.
            </p>
          </div>
        </section>
        <section
          className="public-container section-space"
          aria-labelledby="how-title"
        >
          <p className="eyebrow">YOLCULUĞUN ÇOK BASİT</p>
          <h2 id="how-title" className="section-title">
            Mezun360 nasıl çalışır?
          </h2>
          <ol className="steps-grid">
            {[
              [
                'Profilini oluştur ve güncel tut',
                'Deneyimin, yetkinliklerin ve hedeflerinle kendini anlat.',
              ],
              [
                'BTÜ mezun ağıyla bağlantı kur',
                'Ortak bir geçmişten yeni bir diyaloğa adım at.',
              ],
              [
                'Kariyer fırsatları ve mentörlükten yararlan',
                'Yeni yollar keşfet, deneyimini paylaşarak ilerle.',
              ],
            ].map(([title, text], index) => (
              <li key={title}>
                <span className="step-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3 className="mb-3 mt-5 text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            Bu adımlar, yakında sunulacak mezun deneyimini anlatır. Katılım
            bağlantısı şu anda mevcut hesapların giriş ekranına yönlendirir.
          </p>
        </section>
        <section
          id="hakkinda"
          className="ecosystem-section"
          aria-labelledby="ecosystem-title"
        >
          <div className="public-container section-space">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="eyebrow text-pastel-turquoise">
                  BTÜ’DEN HAYATA UZANAN BİR BAĞ
                </p>
                <h2 id="ecosystem-title" className="section-title text-white">
                  Bir mezun veri tabanından
                  <br />
                  daha fazlası.
                </h2>
              </div>
              <p className="self-end text-lg leading-relaxed text-pastel-blue">
                Mezunları, öğrencileri, Kariyer Merkezini ve iş dünyasını ortak
                bir gelecekte buluşturmayı amaçlayan bir kariyer ekosistemi.
              </p>
            </div>
            <ul
              className="ecosystem-network"
              aria-label="Kariyer ekosisteminin paydaşları"
            >
              {['Mezun', 'Öğrenci', 'Kariyer Merkezi', 'İş Dünyası'].map(
                (label, index) => (
                  <li key={label}>
                    <span
                      className={`ecosystem-dot ecosystem-dot-${index}`}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </li>
                ),
              )}
            </ul>
            <p className="mt-5 text-sm text-pastel-blue">
              Ortak bir geçmişten, birlikte şekillenen bir geleceğe.
            </p>
          </div>
        </section>
        <section
          className="public-container section-space grid items-center gap-12 lg:grid-cols-2"
          aria-labelledby="insight-title"
        >
          <div>
            <p className="eyebrow">KARİYER MERKEZİ İÇİN</p>
            <h2 id="insight-title" className="section-title">
              Mezun verisinden
              <br />
              anlamlı içgörüye.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Yetkili Kariyer Merkezi kullanıcıları için tasarlanan alan; toplu
              verilerle mezunların yolculuğunu anlamayı ve üniversitenin
              desteğini güçlendirmeyi hedefler.
            </p>
            <ul className="mt-7 grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {[
                'İstihdam eğilimleri',
                'Sektörler ve yetkinlikler',
                'Mentörlük katılımı',
                'Mezun bağlılığı',
              ].map((text) => (
                <li key={text} className="flex items-center gap-2">
                  <Check
                    size={17}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {text}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Analizler geliştirme planındadır. Kişisel mezun bilgileri bu
              sayfada paylaşılmaz.
            </p>
          </div>
          <InsightPreview />
        </section>
        <section
          className="public-container pb-20"
          aria-labelledby="privacy-title"
        >
          <div className="privacy-panel">
            <div>
              <span className="mb-5 inline-flex rounded-xl bg-card p-3 text-primary">
                <ShieldCheck size={28} aria-hidden="true" />
              </span>
              <p className="eyebrow">GÜVENLE KURULAN BAĞLAR</p>
              <h2 id="privacy-title" className="section-title">
                Verilerin senin
                <br />
                kontrolünde.
              </h2>
              <p className="mt-5 max-w-md text-muted-foreground">
                Mezun360’ın tasarımında gizlilik önce gelir. Planlanan mezun
                deneyimi, neyi kiminle paylaşacağına senin karar vermeni esas
                alır.
              </p>
            </div>
            <ul className="privacy-points">
              {privacyPoints.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <Icon
                    size={21}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="final-cta" aria-labelledby="cta-title">
          <div className="public-container py-16 text-center">
            <p className="eyebrow justify-center">YOLCULUK DEVAM EDİYOR</p>
            <h2 id="cta-title" className="section-title">
              BTÜ topluluğuyla bağını sürdür.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Yeni bir bağlantı, yeni bir bakış açısı, yeni bir adım.
              <br className="hidden sm:block" /> Hepsi aynı yerden başlar.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild className="px-7">
                <Link to="/login">
                  Giriş Yap
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <a href="#platform">Platformu Keşfet</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-card">
        <div className="public-container py-10">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <ProductIdentity />
              <p className="mt-4 text-sm text-muted-foreground">
                Bursa Teknik Üniversitesi
              </p>
            </div>
            <nav
              aria-label="Alt gezinme"
              className="flex flex-wrap items-start gap-x-7 gap-y-3 text-sm font-semibold text-primary"
            >
              <a href="#platform">Platform</a>
              <a href="#hakkinda">Hakkında</a>
              <Link to="/login">Giriş Yap</Link>
            </nav>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t pt-6 text-sm text-muted-foreground">
            <p>BTÜ Mezun360 · Ortak geçmişimiz, birlikte geleceğimiz.</p>
            <ul
              className="flex flex-wrap gap-x-7 gap-y-3"
              aria-label="Henüz yayınlanmamış bilgiler"
            >
              {['Gizlilik', 'Kullanım Koşulları', 'İletişim'].map((label) => (
                <li key={label}>
                  {label}
                  <span className="ml-2 rounded bg-background px-2 py-0.5 text-xs">
                    Yakında
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
