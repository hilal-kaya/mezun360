import { Link } from 'react-router-dom'
import { ArrowUpRight, ShieldCheck, Check, BriefcaseBusiness, GraduationCap, Users, LineChart, Network, LockKeyhole, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicHeader, ProductIdentity } from './public-header'

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#233A85] text-white py-20 lg:py-32">
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
      
      <div className="public-container relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6 backdrop-blur-sm">
            BTÜ Kariyer ve Mezun Platformu
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            BTÜ ile bağın<br />mezuniyetle bitmez.
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-blue-100 max-w-xl leading-relaxed">
            Mezunlar, kariyer merkezi, öğrenciler ve iş dünyasını tek bir noktada buluşturan yeni nesil kariyer ve gelişim ekosistemi.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-[#233A85] hover:bg-gray-100 hover:text-[#1a2b63] font-semibold px-8 h-12 text-base">
              <Link to="/login">Kayıt Ol / Giriş Yap <ArrowUpRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 text-base">
              <a href="#ekosistem">Platformu Keşfet</a>
            </Button>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-5 relative">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-7 rounded-3xl flex flex-col justify-end h-56 transform transition hover:-translate-y-1">
            <Users className="w-10 h-10 mb-auto text-[#DDF6F4]" />
            <h3 className="font-semibold text-2xl">Mezunlar</h3>
            <p className="text-blue-100 text-sm mt-2">Geniş profesyonel ağ ve mentörlük</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-7 rounded-3xl flex flex-col justify-end h-56 translate-y-10 transform transition hover:-translate-y-1">
            <BriefcaseBusiness className="w-10 h-10 mb-auto text-[#FCE9DE]" />
            <h3 className="font-semibold text-2xl flex items-center gap-2 flex-wrap">İş Dünyası <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-md text-white whitespace-nowrap">Yakında</span></h3>
            <p className="text-blue-100 text-sm mt-2">Nitelikli yeteneklere doğrudan erişim</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-7 rounded-3xl flex flex-col justify-end h-56 transform transition hover:-translate-y-1">
            <GraduationCap className="w-10 h-10 mb-auto text-[#DDE7FF]" />
            <h3 className="font-semibold text-2xl flex items-center gap-2 flex-wrap">Öğrenciler <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-md text-white whitespace-nowrap">Yakında</span></h3>
            <p className="text-blue-100 text-sm mt-2">Kariyer rehberliği ve staj fırsatları</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-7 rounded-3xl flex flex-col justify-end h-56 translate-y-10 transform transition hover:-translate-y-1">
            <LineChart className="w-10 h-10 mb-auto text-[#E4F4EA]" />
            <h3 className="font-semibold text-2xl">Kariyer Merkezi</h3>
            <p className="text-blue-100 text-sm mt-2">Veri odaklı mezun izleme ve yönetim</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section id="hakkinda" className="py-20 lg:py-32 bg-slate-50">
      <div className="public-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#233A85] tracking-tight mb-6">Neden Mezun360?</h2>
          <p className="text-lg text-slate-600">
            Mezuniyet sonrası kurumsal iletişim genellikle kopar ve kariyer verileri dağınık hale gelir. Mezun360, bu iletişimi modern, güvenli ve sürekli bir yapıya kavuşturur.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-[#DDE7FF] text-[#233A85] rounded-2xl flex items-center justify-center mb-6">
              <Network size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Sürekli İletişim</h3>
            <p className="text-slate-600">Üniversite ve mezunlar arasındaki bağın zamanla zayıflamasını engeller, iletişimi tek ve güncel bir kanalda toplar.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-[#E4F4EA] text-green-700 rounded-2xl flex items-center justify-center mb-6">
              <BriefcaseBusiness size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Kariyer Gelişimi</h3>
            <p className="text-slate-600">Mezunların mesleki gelişimlerini takip edebilecekleri ve güvenilir kariyer fırsatlarına ulaşabilecekleri kapalı bir ağ sunar.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-[#FCE9DE] text-orange-700 rounded-2xl flex items-center justify-center mb-6">
              <LineChart size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Veri Odaklı Yönetim</h3>
            <p className="text-slate-600">Kariyer merkezi için dağınık verileri anlamlı içgörülere dönüştürerek üniversitenin kalite süreçlerine katkı sağlar.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function EcosystemSection() {
  return (
    <section id="ekosistem" className="py-20 lg:py-32 bg-white">
      <div className="public-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#233A85] tracking-tight mb-6">
              Birlikte büyüyen<br />bir ekosistem.
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Mezun360, tüm paydaşların birbirinden güç aldığı bir kariyer döngüsü yaratır. Öğrencilikten iş hayatına kadar her adımda üniversitenin gücünü yanınızda hissedin.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#DDE7FF] flex items-center justify-center shrink-0 mt-1">
                  <Users size={20} className="text-[#233A85]" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Mezun Ağı ve Profil</h4>
                  <p className="text-slate-600 text-sm mt-1">Mezunlarınızı bulun, deneyimlerinizi paylaşın ve kendi profilinizi profesyonelce yönetin.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#E4F4EA] flex items-center justify-center shrink-0 mt-1">
                  <BriefcaseBusiness size={20} className="text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Kariyer ve Staj (Aktif)</h4>
                  <p className="text-slate-600 text-sm mt-1">Üniversite onaylı nitelikli iş ve staj ilanlarına doğrudan ulaşın.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ECE8FA] flex items-center justify-center shrink-0 mt-1">
                  <Users size={20} className="text-purple-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Mentörlük (Aktif)</h4>
                  <p className="text-slate-600 text-sm mt-1">Deneyimli mezunlardan rehberlik alın veya genç meslektaşlarınıza yol gösterin.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-[#FAFAF7] rounded-[3rem] p-8 lg:p-12 border border-slate-100">
            {/* Visual representation instead of complex CSS shapes */}
            <div className="aspect-square bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-[#ECE8FA]"><Globe size={120} strokeWidth={1} /></div>
              <div className="relative z-10">
                <span className="bg-[#DDE7FF] text-[#233A85] px-3 py-1 rounded-full text-xs font-semibold">Tasarım Önizlemesi</span>
                <h3 className="text-2xl font-bold mt-4">Kariyer Merkezi İçgörüleri</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs">Veriler anonimleştirilerek genel eğilimleri gösterir.</p>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-medium">Bilişim Sektörü</span>
                  <span className="text-sm font-bold text-[#233A85]">%42</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-medium">Mentörlük Eşleşmesi</span>
                  <span className="text-sm font-bold text-green-700">128</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="py-20 lg:py-32 bg-slate-50">
      <div className="public-container">
        <div className="text-center mb-16">
          <p className="text-[#233A85] font-semibold text-sm tracking-widest uppercase mb-3">Sürecin Adımları</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">Mezun360 nasıl çalışır?</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Kayıt Ol', desc: 'E-posta adresinizle güvenle platforma giriş yapın.' },
            { step: '02', title: 'Doğrulama', desc: 'Mezuniyet bilgilerinizi girerek üniversite onayından geçin.' },
            { step: '03', title: 'Gizlilik', desc: 'Profilinizin kimlere görüneceğini ve gizlilik ayarlarınızı seçin.' },
            { step: '04', title: 'Keşfet', desc: 'Mezun ağına katılın, ilanları inceleyin ve mentörlük alın.' },
          ].map((item) => (
            <div key={item.step} className="relative">
              <span className="text-5xl font-black text-slate-200 mb-4 block">{item.step}</span>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PrivacySection() {
  return (
    <section id="guvenlik" className="py-20 lg:py-32 bg-white">
      <div className="public-container">
        <div className="bg-[#233A85] rounded-[3rem] p-8 lg:p-16 text-white grid lg:grid-cols-2 gap-12 items-center overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
              <ShieldCheck size={28} className="text-[#DDF6F4]" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">Verilerin senin<br />kontrolünde.</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-md">
              Mezun360’ın tasarımında gizlilik önce gelir. Planlanan mezun deneyimi, kişisel bilgilerinizi korumak üzere inşa edilmiştir.
            </p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex gap-4 items-start">
              <div className="mt-1 bg-white/10 p-2 rounded-lg"><LockKeyhole size={20} className="text-[#DDE7FF]" /></div>
              <div>
                <h4 className="font-semibold text-lg">İletişim Bilgileri Gizli</h4>
                <p className="text-blue-200 text-sm mt-1">Kişisel e-posta ve telefon numaralarınız diğer kullanıcılara veya ziyaretçilere kapalıdır.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 bg-white/10 p-2 rounded-lg"><Check size={20} className="text-[#E4F4EA]" /></div>
              <div>
                <h4 className="font-semibold text-lg">Görünürlük Tercihi</h4>
                <p className="text-blue-200 text-sm mt-1">Profilinizi kimlerin görebileceğini (Yalnızca Ben veya BTÜ Mezunları) siz belirlersiniz.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 bg-white/10 p-2 rounded-lg"><ShieldCheck size={20} className="text-[#FCE9DE]" /></div>
              <div>
                <h4 className="font-semibold text-lg">Güvenli Doğrulama</h4>
                <p className="text-blue-200 text-sm mt-1">Platforma yalnızca resmi olarak doğrulanmış BTÜ mezunları ve personeli tam erişim sağlar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="py-20 bg-slate-50 text-center border-t border-slate-100">
      <div className="public-container max-w-3xl">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#233A85] tracking-tight mb-6">BTÜ topluluğuyla bağını sürdür.</h2>
        <p className="text-lg text-slate-600 mb-10">
          Yeni bir bağlantı, yeni bir bakış açısı, yeni bir adım. Hepsi aynı yerden başlar.
        </p>
        <Button asChild size="lg" className="bg-[#233A85] hover:bg-[#1a2b63] text-white px-10 h-14 text-lg rounded-full">
          <Link to="/login">Platforma Giriş Yap <ArrowUpRight className="ml-2 w-5 h-5" /></Link>
        </Button>
      </div>
    </section>
  )
}

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-[#233A85] selection:text-white">
      <PublicHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <EcosystemSection />
        <HowItWorksSection />
        <PrivacySection />
        <FinalCtaSection />
      </main>
      <footer className="bg-white border-t border-slate-200">
        <div className="public-container py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row justify-between gap-10">
            <div className="max-w-sm">
              <ProductIdentity />
              <p className="mt-6 text-sm text-slate-500 leading-relaxed">
                Bursa Teknik Üniversitesi Mezun360 Kariyer ve Mezun Platformu. Ortak geçmişimiz, birlikte geleceğimiz.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-12 gap-y-8" aria-label="Footer gezinme">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Platform</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li><a href="#ekosistem" className="hover:text-[#233A85] transition-colors">Ekosistem</a></li>
                  <li><a href="#nasil-calisir" className="hover:text-[#233A85] transition-colors">Nasıl Çalışır?</a></li>
                  <li><a href="#guvenlik" className="hover:text-[#233A85] transition-colors">Güvenlik ve Gizlilik</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Erişim</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li><Link to="/login" className="hover:text-[#233A85] transition-colors">Giriş Yap / Kayıt Ol</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Kurumsal</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li><span className="text-slate-400">Kullanım Koşulları <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded ml-1">Yakında</span></span></li>
                  <li><span className="text-slate-400">Aydınlatma Metni <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded ml-1">Yakında</span></span></li>
                  <li><span className="text-slate-400">İletişim <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded ml-1">Yakında</span></span></li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 text-center sm:text-left text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Bursa Teknik Üniversitesi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
