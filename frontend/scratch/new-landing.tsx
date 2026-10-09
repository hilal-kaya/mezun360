import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Briefcase, Users, Calendar, MoveUpRight, Navigation, Lightbulb, MapPin, Search, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicHeader } from './public-header'
import { ProductIdentity } from '@/components/product-identity'

function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative bg-[#FAFAF9] overflow-hidden pt-24 pb-16 lg:pt-36 lg:pb-32">
      {/* Soft background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FCE7F3]/60 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#DCFCE7]/50 rounded-full blur-[100px] translate-y-1/3 pointer-events-none" aria-hidden="true" />

      <div className="public-container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F87171]" /> Kariyerin boyunca yanında
          </div>
          <h1 id="hero-title" className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05]">
            Kariyerin,<br />bağlantıların, <span className="text-slate-400">bir<br />sonraki adımın.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-md">
            Öğrencileri, mezunları ve iş dünyasını tek bir sıcak toplulukta buluşturan kariyer ekosistemine katıl.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <Button asChild className="bg-[#0B1727] text-white hover:bg-slate-800 rounded-full px-8 h-14 text-base font-medium">
              <Link to="/login">Hemen Katıl <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8 h-14 text-base font-medium border-slate-200 text-slate-900 hover:bg-slate-50 bg-white">
              <a href="#platform">Platformu Keşfet</a>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-3 text-sm text-slate-500 font-medium">
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=M1&backgroundColor=e2e8f0`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=F1&backgroundColor=fce7f3`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=F2&backgroundColor=dcfce7`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=M2&backgroundColor=ffedd5`} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <span><strong className="text-slate-900 font-bold">12.000+</strong> öğrenci ve mezunla birlikte</span>
          </div>
        </div>

        {/* Right Column: Visual Diagram */}
        <div className="relative h-[550px] w-full hidden lg:block select-none" aria-hidden="true">
          {/* Orbits */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-dashed border-slate-300 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-dashed border-slate-300 rounded-full" />
          
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] bg-white rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center z-20">
            <div className="w-10 h-10 bg-[#0B1727] text-white rounded-xl flex items-center justify-center font-bold text-xl mb-3">M</div>
            <h3 className="font-bold text-slate-900 text-lg leading-none mb-1">Mezun360</h3>
            <p className="text-[10px] text-slate-400 font-medium">Herkes için ortak alan</p>
          </div>

          {/* Floating Nodes */}
          {/* Node: Yeni bağlantı */}
          <div className="absolute top-[10%] right-[10%] bg-white/80 backdrop-blur-md pl-3 pr-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 z-10 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">Yeni bağlantı</p>
              <p className="text-[10px] text-slate-500 mt-1">Topluluğuna katıldı</p>
            </div>
          </div>

          {/* Node: Mezun */}
          <div className="absolute top-[25%] left-[5%] bg-white/80 backdrop-blur-md pl-2 pr-5 py-2 rounded-full shadow-sm border border-slate-100 z-10 flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Mezun&backgroundColor=e2e8f0`} className="w-11 h-11 rounded-full border-2 border-white bg-slate-100" alt="" />
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">Mezun</p>
              <p className="text-[10px] text-slate-500">Deneyimini paylaş</p>
            </div>
          </div>

          {/* Node: Öğrenci */}
          <div className="absolute top-[45%] right-[0%] bg-white/80 backdrop-blur-md pl-2 pr-5 py-2 rounded-full shadow-sm border border-slate-100 z-10 flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Ogrenci&backgroundColor=fce7f3`} className="w-11 h-11 rounded-full border-2 border-white bg-slate-100" alt="" />
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">Öğrenci</p>
              <p className="text-[10px] text-slate-500">Yolunu keşfet</p>
            </div>
          </div>

          {/* Node: İş Dünyası */}
          <div className="absolute bottom-[10%] right-[15%] bg-white/80 backdrop-blur-md pl-2 pr-5 py-2 rounded-full shadow-sm border border-slate-100 z-10 flex items-center gap-3">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=IsDunyasi&backgroundColor=ffedd5`} className="w-11 h-11 rounded-full border-2 border-white bg-slate-100" alt="" />
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">İş Dünyası</p>
              <p className="text-[10px] text-slate-500">Yeteneğe ulaş</p>
            </div>
          </div>

          {/* Node: Yeni Fırsat */}
          <div className="absolute bottom-[5%] left-[10%] bg-white/80 backdrop-blur-md pl-3 pr-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFEDD5] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-0.5 font-medium uppercase tracking-wider">YENİ FIRSAT</p>
              <p className="text-sm font-bold text-slate-900 leading-none">Product Designer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="platform" className="py-24 bg-white">
      <div className="public-container">
        <div className="text-center mb-16">
          <p className="text-[#F87171] font-bold text-[11px] tracking-widest uppercase mb-4">Tek Platform, Sınırsız Bağ</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0B1727] tracking-tight mb-6">Sana Ait Bir Alan</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Kariyerinin her aşamasında ihtiyaç duyduğun insanlara, fırsatlara ve deneyimlere yakın ol.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-[#FFE4E6] rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 border border-white/40 rounded-tl-full translate-x-1/4 translate-y-1/4" />
            <div className="flex justify-between items-start mb-16">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-400">01</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Mezun Ağı</h3>
            <p className="text-slate-600 leading-relaxed mb-10 max-w-sm">
              Farklı sektörlerden mezunlarla yeniden buluş, deneyimlerini paylaş ve güçlü bağlantılar kur.
            </p>
            <a href="#mezun-agi" className="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-slate-700">
              Daha fazla keşfet <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-[#D1FAE5] rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 border border-white/40 rounded-tl-full translate-x-1/4 translate-y-1/4" />
            <div className="flex justify-between items-start mb-16">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Briefcase className="w-6 h-6 text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-400">02</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">İş & Staj</h3>
            <p className="text-slate-600 leading-relaxed mb-10 max-w-sm">
              Sana uygun kariyer fırsatlarını keşfet; üniversite topluluğuna özel ilanlara kolayca ulaş.
            </p>
            <a href="#is-staj" className="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-slate-700">
              Daha fazla keşfet <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FFEDD5] rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 border border-white/40 rounded-tl-full translate-x-1/4 translate-y-1/4" />
            <div className="flex justify-between items-start mb-16">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Lightbulb className="w-6 h-6 text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-400">03</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Mentörlük</h3>
            <p className="text-slate-600 leading-relaxed mb-10 max-w-sm">
              Yolculuğunu daha önce tamamlayanlardan ilham al ya da deneyiminle bir başkasına ışık ol.
            </p>
            <a href="#mentorluk" className="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-slate-700">
              Daha fazla keşfet <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Card 4 */}
          <div className="bg-[#F3F4F6] rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 border border-white/40 rounded-tl-full translate-x-1/4 translate-y-1/4" />
            <div className="flex justify-between items-start mb-16">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-slate-700" />
              </div>
              <span className="text-sm font-medium text-slate-400">04</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Etkinlikler</h3>
            <p className="text-slate-600 leading-relaxed mb-10 max-w-sm">
              Buluşmalar, kariyer sohbetleri ve atölyelerle kampüs ruhunu hayatının her döneminde yaşa.
            </p>
            <a href="#etkinlikler" className="inline-flex items-center text-sm font-bold text-slate-900 group-hover:text-slate-700">
              Daha fazla keşfet <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="py-24 bg-white">
      <div className="public-container">
        <div className="bg-[#FAFAF9] rounded-[3rem] p-12 lg:p-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#F87171] font-bold text-[11px] tracking-widest uppercase mb-4">Bağlantı Kurmak Çok Kolay</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0B1727] tracking-tight leading-[1.1]">
              Üç adımda topluluğun<br />bir parçası ol.
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#FCE7F3] flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#BE185D]">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Profilini oluştur</h3>
                <p className="text-slate-600 leading-relaxed">Hikayeni, ilgi alanlarını ve hedeflerini paylaş.</p>
              </div>
            </div>
            <div className="w-full h-px bg-slate-200" />
            
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#FCE7F3] flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#BE185D]">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Çevreni keşfet</h3>
                <p className="text-slate-600 leading-relaxed">Sana ilham verecek insanları ve fırsatları bul.</p>
              </div>
            </div>
            <div className="w-full h-px bg-slate-200" />
            
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#FCE7F3] flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#BE185D]">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Bağını güçlendir</h3>
                <p className="text-slate-600 leading-relaxed">Topluluğa katıl, üret ve birlikte geliş.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EcosystemRadialSection() {
  return (
    <section id="ozellikler" className="py-24 lg:py-32 bg-[#0B1727] relative overflow-hidden">
      <div className="public-container relative z-10 text-center">
        <p className="text-[#34D399] font-bold text-[11px] tracking-widest uppercase mb-4">Mezun360 Ekosistemi</p>
        <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
          Bir mezun veri tabanından<br /><span className="text-[#FBCFE8]">daha fazlası</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-20">
          Üniversiteden iş dünyasına uzanan bağların merkezinde, yaşayan ve büyüyen bir topluluk.
        </p>

        {/* Radial Diagram */}
        <div className="relative h-[600px] max-w-[800px] mx-auto hidden md:block select-none" aria-hidden="true">
          {/* Orbits */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-dashed border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-dashed border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] border border-dashed border-white/10 rounded-full" />

          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center z-20 shadow-[0_0_60px_rgba(255,255,255,0.1)]">
            <span className="text-[#F87171] font-bold text-[10px] tracking-widest mb-1">360°</span>
            <h3 className="font-bold text-slate-900 text-xl leading-tight">Kariyer<br />Merkezi</h3>
          </div>

          {/* Satellites */}
          {/* Mezun */}
          <div className="absolute top-[35%] left-[10%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#A7F3D0] flex flex-col items-center justify-center z-10">
            <span className="text-slate-500 font-medium text-[10px] mb-1">01</span>
            <h4 className="font-bold text-slate-900 text-lg">Mezun</h4>
            <p className="text-[10px] text-slate-700 mt-0.5">Deneyim paylaşır</p>
          </div>

          {/* Öğrenci */}
          <div className="absolute top-[35%] right-[10%] translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#FBCFE8] flex flex-col items-center justify-center z-10">
            <span className="text-slate-500 font-medium text-[10px] mb-1">02</span>
            <h4 className="font-bold text-slate-900 text-lg">Öğrenci</h4>
            <p className="text-[10px] text-slate-700 mt-0.5">Geleceğini kurar</p>
          </div>

          {/* İş Dünyası */}
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full bg-[#FED7AA] flex flex-col items-center justify-center z-10">
            <span className="text-slate-600 font-medium text-[10px] mb-1">03</span>
            <h4 className="font-bold text-slate-900 text-lg">İş Dünyası</h4>
            <p className="text-[10px] text-slate-700 mt-0.5">Yeteneğe ulaşır</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="py-24 bg-white">
      <div className="public-container">
        <div className="bg-gradient-to-r from-[#FCE7F3] via-[#FFEDD5] to-[#D1FAE5] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="absolute right-0 top-0 w-96 h-96 border border-white/40 rounded-full translate-x-1/4 -translate-y-1/4" />
          <div className="absolute right-20 bottom-0 w-64 h-64 border border-white/40 rounded-full translate-y-1/4" />
          
          <div className="relative z-10 max-w-xl text-center lg:text-left">
            <p className="text-[#F87171] font-bold text-[11px] tracking-widest uppercase mb-4">Topluluk Seni Bekliyor</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0B1727] tracking-tight mb-6">
              BTÜ topluluğuyla bağını sürdür.
            </h2>
            <p className="text-lg text-slate-700">
              Bugün katıl, kariyer yolculuğunda yeni bir sayfa aç.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <Button asChild className="bg-[#0B1727] hover:bg-slate-800 text-white px-10 h-16 text-lg rounded-full shadow-xl">
              <Link to="/login">Kayıt Ol <ArrowRight className="w-5 h-5 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-[#0B1727] selection:text-white">
      <PublicHeader />
      <main id="main" className="flex-1 bg-white">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <EcosystemRadialSection />
        <FinalCtaSection />
      </main>
      <footer className="bg-[#F8FAFC] py-12 border-t border-slate-200">
        <div className="public-container flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-slate-500 font-medium">
          <div className="flex flex-col items-center md:items-start gap-2">
            <ProductIdentity />
            <p className="text-xs">Üniversiteyle başlayan bağ, ömür boyu sürer.</p>
          </div>
          <div className="flex gap-8">
            <span className="hover:text-slate-900 cursor-not-allowed">Gizlilik</span>
            <span className="hover:text-slate-900 cursor-not-allowed">İletişim</span>
            <span className="hover:text-slate-900 cursor-not-allowed">Sosyal Medya</span>
          </div>
          <div className="text-xs">
            &copy; {new Date().getFullYear()} Mezun360
          </div>
        </div>
      </footer>
    </div>
  )
}
