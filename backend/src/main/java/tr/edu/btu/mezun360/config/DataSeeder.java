package tr.edu.btu.mezun360.config;

import java.time.Clock;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.identity.application.EmailCanonicalizer;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.identity.domain.UserAccount;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;
import tr.edu.btu.mezun360.jobs.domain.JobPost;
import tr.edu.btu.mezun360.jobs.domain.WorkModel;
import tr.edu.btu.mezun360.jobs.infrastructure.JobPostRepository;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
import tr.edu.btu.mezun360.alumni.domain.Skill;
import tr.edu.btu.mezun360.alumni.infrastructure.AlumniProfileRepository;

@Component
@Profile({"local", "dev"})
public class DataSeeder implements CommandLineRunner {

    private final UserAccountRepository accounts;
    private final JobPostRepository jobs;
    private final AlumniProfileRepository profiles;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(UserAccountRepository accounts, JobPostRepository jobs, AlumniProfileRepository profiles, PasswordEncoder passwordEncoder, Clock clock, JdbcTemplate jdbcTemplate) {
        this.accounts = accounts;
        this.jobs = jobs;
        this.profiles = profiles;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        UserAccount admin = seedUser("admin@example.test", "admin", Role.ADMIN);
        seedUser("alumni@example.test", "alumni", Role.ALUMNI);
        seedJobs(admin);
        seedNetworkAlumni();
        seedEvents();
        seedNews();
    }

    private UserAccount seedUser(String email, String password, Role role) {
        String canonical = EmailCanonicalizer.canonicalize(email);
        var existing = accounts.findByEmailCanonical(canonical);
        String hash = passwordEncoder.encode(password);
        if (existing.isEmpty()) {
            UserAccount account = UserAccount.development(
                email, 
                canonical, 
                hash, 
                role, 
                clock.instant()
            );
            return accounts.save(account);
        } else {
            jdbcTemplate.update("UPDATE mezun360.user_accounts SET password_hash = ? WHERE email_canonical = ?", hash, canonical);
            return existing.get();
        }
    }

    private void seedJobs(UserAccount admin) {
        if (jobs.count() > 0) return;

        jobs.save(new JobPost(UUID.randomUUID(), "Senior Java Engineer", "TechCorp TR", "Istanbul", WorkModel.HYBRID, "We are looking for an experienced Java developer with Spring Boot expertise to join our core banking team.", "https://techcorp.tr/careers/1", admin, clock.instant().minus(2, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "Product Manager", "Innovate A.S.", "Bursa", WorkModel.ONSITE, "Leading tech company in Bursa is seeking a Product Manager to oversee our B2B SaaS products.", "https://innovate.as/jobs", admin, clock.instant().minus(5, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "React Developer", "StartApp", "Remote", WorkModel.REMOTE, "Fast-growing startup looking for a frontend developer to build responsive web applications using React and TypeScript.", "https://startapp.io/apply", admin, clock.instant().minus(1, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "Data Scientist", "Bursa Analytics", "Bursa", WorkModel.HYBRID, "Join our data team to build predictive models and analyze large datasets using Python and SQL.", "https://bursaanalytics.com/careers", admin, clock.instant().minus(10, ChronoUnit.DAYS)));
        jobs.save(new JobPost(UUID.randomUUID(), "DevOps Engineer", "CloudNet", "Remote", WorkModel.REMOTE, "We need a DevOps engineer to manage our Kubernetes clusters, CI/CD pipelines, and AWS infrastructure.", "https://cloudnet.com/jobs", admin, clock.instant().minus(14, ChronoUnit.DAYS)));
    }

    private Skill getOrCreateSkill(String name) {
        String normalized = name.toLowerCase().replaceAll("[^a-z0-9]", "");
        java.util.List<Skill> existing = jdbcTemplate.query("SELECT id FROM mezun360.skills WHERE normalized_name = ?", (rs, rowNum) -> {
            Skill s = new Skill();
            s.id = (UUID) rs.getObject("id");
            s.name = name;
            return s;
        }, normalized);
        
        if (!existing.isEmpty()) {
            return existing.get(0);
        }
        
        Skill s = new Skill();
        s.id = UUID.randomUUID();
        s.name = name;
        s.normalizedName = normalized;
        s.createdAt = clock.instant();
        s.updatedAt = clock.instant();
        jdbcTemplate.update("INSERT INTO mezun360.skills (id, name, normalized_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", s.id, s.name, s.normalizedName, java.sql.Timestamp.from(s.createdAt), java.sql.Timestamp.from(s.updatedAt));
        return s;
    }

    private void seedNetworkAlumni() {
        if (accounts.findByEmailCanonical("mentor1@example.test").isPresent()) return;

        createAlumni("mentor1@example.test", "Ahmet", "Yılmaz", "Yazılım Mimarı", "TechCorp TR", "Bilgisayar Mühendisliği", 2021, "Bilişim", true, "Java", "Spring Boot", "Microservices");
        createAlumni("mentor2@example.test", "Ayşe", "Kaya", "Veri Bilimi Uzmanı", "Bursa Analytics", "Matematik", 2019, "Veri", true, "Python", "Machine Learning", "Data Engineering");
        createAlumni("mentor3@example.test", "Mehmet", "Demir", "Frontend Developer", "Innovate A.S.", "Bilgisayar Mühendisliği", 2022, "Bilişim", false, "React", "TypeScript", "UX Design");
        createAlumni("mentor4@example.test", "Zeynep", "Çelik", "Product Manager", "StartApp", "Endüstri Mühendisliği", 2020, "Yazılım", true, "Agile", "Scrum", "Product Strategy");
        createAlumni("alumni5@example.test", "Can", "Öztürk", "Makine Mühendisi", "AutoMaker", "Makine Mühendisliği", 2018, "Otomotiv", false, "CAD", "SolidWorks");
    }

    private void createAlumni(String email, String firstName, String lastName, String title, String company, String department, Integer gradYear, String industry, boolean mentor, String... skillNames) {
        UserAccount account = seedUser(email, "password123", Role.ALUMNI);
        if (profiles.findByUserId(account.id()).isEmpty()) {
            AlumniProfile profile = new AlumniProfile();
            profile.id = UUID.randomUUID();
            profile.userId = account.id();
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.currentPosition = title;
            profile.currentCompany = company;
            profile.department = department;
            profile.graduationYear = gradYear;
            profile.industry = industry;
            profile.willingToMentor = mentor;
            profile.createdAt = clock.instant();
            profile.updatedAt = clock.instant();

            for (String skillName : skillNames) {
                profile.skills.add(getOrCreateSkill(skillName));
            }
            profiles.save(profile);
            
            // Auto-verify mentor
            jdbcTemplate.update("INSERT INTO mezun360.alumni_verification_requests (id, profile_id, evidence_revision, evidence, status, source, submitted_at, created_at, updated_at, version) VALUES (?, ?, 0, '{}', 'VERIFIED', 'MANUAL_ADMIN', ?, ?, ?, 0)", UUID.randomUUID(), profile.id, java.sql.Timestamp.from(clock.instant()), java.sql.Timestamp.from(clock.instant()), java.sql.Timestamp.from(clock.instant()));
            
            // Add privacy settings
            jdbcTemplate.update("INSERT INTO mezun360.alumni_privacy_settings (profile_id, directory_opt_in, profile_visibility, created_at, updated_at, version) VALUES (?, true, 'ALUMNI_MEMBERS', ?, ?, 0)", profile.id, java.sql.Timestamp.from(clock.instant()), java.sql.Timestamp.from(clock.instant()));
        }
    }
    private void seedEvents() {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM mezun360.events", Integer.class);
        if (count != null && count > 0) return;

        java.sql.Timestamp now = java.sql.Timestamp.from(clock.instant());
        java.sql.Timestamp future1 = java.sql.Timestamp.from(clock.instant().plus(java.time.Duration.ofDays(10)));
        java.sql.Timestamp future2 = java.sql.Timestamp.from(clock.instant().plus(java.time.Duration.ofDays(20)));
        java.sql.Timestamp past1 = java.sql.Timestamp.from(clock.instant().minus(java.time.Duration.ofDays(15)));

        jdbcTemplate.update("INSERT INTO mezun360.events (id, title, description, event_date, location, is_online, capacity, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            UUID.randomUUID(), "BTÜ Bilişim Zirvesi 2026", "BTÜ öğrencileri ve mezunlarını bilişim sektörü liderleriyle buluşturan büyük zirve.", future1, "Mimar Sinan Yerleşkesi - Turkuaz Salon", false, 300, now, now);

        jdbcTemplate.update("INSERT INTO mezun360.events (id, title, description, event_date, location, is_online, capacity, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            UUID.randomUUID(), "Yazılım Mimari Atölyesi", "Mikroservisler ve dağıtık sistemler üzerine derinlemesine teknik atölye.", future2, "Online (Zoom)", true, 100, now, now);

        jdbcTemplate.update("INSERT INTO mezun360.events (id, title, description, event_date, location, is_online, capacity, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            UUID.randomUUID(), "Geleneksel Mezun Buluşması", "Yıllık mezuniyet sonrası buluşma etkinliğimiz. Eski arkadaşlarınızla hasret giderin.", past1, "Yıldırım Yerleşkesi - Açık Alan", false, 500, now, now);
    }
    
    private void seedNews() {
        jdbcTemplate.update("DELETE FROM mezun360.news_articles");

        java.sql.Timestamp now = java.sql.Timestamp.from(clock.instant());
        java.sql.Timestamp past1 = java.sql.Timestamp.from(clock.instant().minus(java.time.Duration.ofDays(2)));
        java.sql.Timestamp past2 = java.sql.Timestamp.from(clock.instant().minus(java.time.Duration.ofDays(5)));
        java.sql.Timestamp past3 = java.sql.Timestamp.from(clock.instant().minus(java.time.Duration.ofDays(10)));

        jdbcTemplate.update("INSERT INTO mezun360.news_articles (id, title, summary, content, publish_date, image_url, author, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            UUID.randomUUID(), 
            "BTÜ'den Yeni Yapay Zeka Laboratuvarı", 
            "Üniversitemiz, yapay zeka araştırmalarını desteklemek amacıyla yeni ve modern donanımlara sahip bir laboratuvar açtı.", 
            "BTÜ, teknolojiye yaptığı yatırımlara bir yenisini daha ekledi. Mimar Sinan Yerleşkesi'nde faaliyete geçen Yapay Zeka Laboratuvarı, hem akademisyenlere hem de lisans ve lisansüstü öğrencilere ileri düzey araştırmalar yapma imkanı sunacak. Merkezde 40 adet yüksek performanslı GPU sunucusu yer alıyor.", 
            past1, "https://placehold.co/800x400/png?text=Yapay+Zeka+Lab", "BTÜ İletişim Koordinatörlüğü", now, now);

        jdbcTemplate.update("INSERT INTO mezun360.news_articles (id, title, summary, content, publish_date, image_url, author, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            UUID.randomUUID(), 
            "Mezunlarımızdan Global Başarı", 
            "Bilgisayar Mühendisliği 2021 mezunlarımızdan oluşan bir takım, global bir hackathon'da birinci oldu.", 
            "Uluslararası çapta düzenlenen ve 50'den fazla ülkeden 200'ü aşkın takımın katıldığı \"Tech for Good\" hackathon'unda mezunlarımız Ahmet Yılmaz ve Elif Kaya büyük bir başarıya imza atarak birinci oldu. Geliştirdikleri çevre dostu optimizasyon algoritması sayesinde, lojistik süreçlerdeki karbon salınımını %20 oranında azaltmayı başardılar.", 
            past2, "https://placehold.co/800x400/png?text=Global+Hackathon", "Mezunlar Derneği", now, now);

        jdbcTemplate.update("INSERT INTO mezun360.news_articles (id, title, summary, content, publish_date, image_url, author, created_at, updated_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)",
            UUID.randomUUID(), 
            "Yeni Dönem Kayıtları Başlıyor", 
            "2026-2027 Güz dönemi ders kayıt süreçleri hakkında bilinmesi gereken önemli tarihler yayınlandı.", 
            "Öğrenci İşleri Daire Başkanlığı tarafından yapılan açıklamaya göre, güz dönemi ders kayıtları 15 Eylül tarihinde başlayacak. Ders seçimleri Öğrenci Bilgi Sistemi (ÖBS) üzerinden gerçekleştirilecek olup, danışman onayları 20 Eylül'e kadar tamamlanmalıdır. Tüm öğrencilerimize yeni dönemde başarılar dileriz.", 
            past3, "https://placehold.co/800x400/png?text=Ders+Kayitlari", "Öğrenci İşleri", now, now);
    }
}
