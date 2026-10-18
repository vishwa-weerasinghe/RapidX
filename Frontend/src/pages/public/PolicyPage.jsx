import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Mail, Phone } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../../components/ThemeToggle";
import logoImg from "../../assets/logo.jpg";

const policyContent = {
  frequently: {
    title: "Frequently Asked Questions",
    intro: "Hello, what can we help you find?",
    sections: [
      {
        question: "What is the best time to visit Minneriya National Park for a safari?",
        answer: <>The best time to visit is between <strong>July and October</strong>, during the famous <strong>“Elephant Gathering”</strong>, when hundreds of wild elephants gather around the Minneriya tank.</>,
      },
      {
        question: "Is the safari safe for children and families?",
        answer: "Yes, our experienced and certified safari drivers ensure a safe and comfortable ride for families, including children.",
      },
      {
        question: "What should I bring for the safari?",
        answer: <>We recommend bringing <strong>a hat, sunglasses, sunscreen, camera, and plenty of drinking water</strong>. Binoculars are also great for spotting distant wildlife.</>,
      },
      {
        question: "Will I definitely see elephants during the safari?",
        answer: "While elephant sightings are very common in Minneriya, especially during the dry season, wildlife is unpredictable. Sightings can vary depending on the time of year and weather conditions.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    effectiveDate: "19 August 2025",
    sections: [
      { heading: "1) Information We Collect", body: "We collect personal information such as your name, email, phone number, country or region, and details provided during inquiries or bookings. We also collect booking details, communications, technical data, and payment information handled securely by third-party payment gateways. We do not store full card details on our servers." },
      { heading: "2) How We Use Your Information", body: "We use your information to respond to inquiries, manage reservations, deliver safari services, process payments, send confirmations and notifications, improve our website and services, send optional promotions when you opt in, and comply with legal obligations." },
      { heading: "3) Legal Bases for Processing", body: "Where applicable, we rely on your consent, performance of a booking contract, compliance with legal obligations, and our legitimate interests such as improving services and website security." },
      { heading: "4) Sharing & Disclosure", body: "We do not sell or rent your personal data. Limited information may be shared with drivers, guides, pickup partners, payment processors, IT or analytics providers, and authorities when required by law or needed to protect rights and safety." },
      { heading: "5) Cookies & Similar Technologies", body: "We use cookies and similar tools to operate the site, remember preferences, and understand website performance. You can control cookies in your browser settings, though disabling some may affect site functionality." },
      { heading: "6) Data Retention", body: "We retain personal information only as long as necessary to provide services, meet legal and financial obligations, resolve disputes, and enforce agreements. When no longer needed, we securely delete or anonymize it." },
      { heading: "7) Data Security", body: "We use reasonable technical and organizational measures to protect your data from unauthorized access, loss, or misuse. However, no transmission or storage method is completely secure." },
      { heading: "8) Third-Party Links", body: "Our website may contain links to payment gateways, social media, blogs, and other third-party sites. Their privacy practices are independent of ours, so please review their policies." },
      { heading: "9) International Transfers", body: "Your information may be transferred to and processed in countries with different data protection laws. Where required, we take steps to maintain an adequate level of protection." },
      { heading: "10) Your Rights & Choices", body: "You may request access, correction, deletion, or restriction of your personal data; object to certain processing; withdraw marketing consent; or lodge a complaint where applicable. We may verify your identity before fulfilling a request." },
      { heading: "11) Children’s Privacy", body: "Our services are not directed to children under 13, and we do not knowingly collect their personal information. Contact us if you believe a child has provided us with personal data." },
      { heading: "12) Updates to This Policy", body: "We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    effectiveDate: "19 August 2025",
    intro: "By accessing and booking through our website, you agree to be bound by these Terms & Conditions.",
    sections: [
      { heading: "1) Eligibility", body: "You must be at least 18 years old to book a safari. If booking for others, you are responsible for ensuring all participants comply with these terms." },
      { heading: "2) Bookings & Payments", body: "Bookings must be made through our website, email, or official partners. Full or partial payment may be required. Prices are quoted in Sri Lankan Rupees unless otherwise stated. Park entrance fees are payable separately and subject to government rates." },
      { heading: "3) Cancellations & Refunds", body: "Cancellations and refunds are governed by our Return & Refund Policy. Please review it before making a booking." },
      { heading: "4) Changes to Bookings", body: "Date or time changes depend on jeep and guide availability. Additional fees may apply, and last-minute availability cannot be guaranteed." },
      { heading: "5) Safari Safety Rules", body: "Guests must follow driver and guide instructions. Feeding, disturbing, or harassing animals is prohibited. Smoking and alcohol are not allowed during the safari. We may refuse service to guests behaving dangerously or inappropriately." },
      { heading: "6) Assumption of Risk & Liability", body: "A jeep safari involves inherent risks, including wildlife, rough terrain, and weather conditions. By booking, you acknowledge these risks and agree that the service provider is not liable for personal injury, loss, or damage unless caused by proven negligence." },
      { heading: "7) Force Majeure", body: "We are not responsible for delays, cancellations, or interruptions caused by events beyond our control, including natural disasters, strikes, government actions, or national park closures." },
      { heading: "8) Intellectual Property", body: "All website content, images, and branding belong to the service provider and may not be copied, distributed, or used without permission." },
      { heading: "9) Privacy", body: "Your use of our website and services is also governed by our Privacy Policy." },
      { heading: "10) Governing Law", body: "These Terms & Conditions are governed by the laws of Sri Lanka, and disputes are subject to the exclusive jurisdiction of Sri Lankan courts." },
      { heading: "11) Changes to Terms", body: "We may update these Terms & Conditions at any time. Updates will be posted on this page with a revised effective date." },
    ],
  },
  refunds: {
    title: "Return & Refund Policy",
    effectiveDate: "19 August 2025",
    intro: "We aim to provide memorable safari experiences. This policy explains how cancellations, changes, and refunds are handled.",
    sections: [
      { heading: "1) Cancellations by Customers", body: "More than 7 days before the tour date: full refund minus payment gateway or transaction fees. 3–7 days before the tour date: 50% refund. Less than 3 days before the tour date or a no-show: no refund." },
      { heading: "2) Cancellations by the Service Provider", body: "If we cancel or reschedule due to park closures, unsafe weather, jeep breakdowns, or unforeseen circumstances, and rescheduling is not possible, you will receive a full refund." },
      { heading: "3) Rescheduling", body: "You may request to reschedule at least 72 hours before the safari. Approval depends on jeep and guide availability. Requests made later may incur fees or may not be possible." },
      { heading: "4) Partial Cancellations (Group Bookings)", body: "Partial cancellations may be accepted for group bookings with revised pricing. Refunds are calculated based on the updated group size and notice period." },
      { heading: "5) Refund Processing", body: "Refunds are issued to the original payment method. Processing typically takes 7–14 business days, depending on your bank or payment provider." },
      { heading: "6) Non-Refundable Items", body: "National park entrance tickets once purchased, last-minute add-ons confirmed on the day of the safari, no-shows, and late arrivals over 30 minutes after the agreed pickup time are non-refundable." },
    ],
  },
};

function HelpPageHeader() {
  const { theme } = useTheme();
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isBlogMenuOpen, setIsBlogMenuOpen] = useState(false);
  const helpMenuRef = useRef(null);
  const blogMenuRef = useRef(null);
  const navigationLinks = [
    { label: "Home", path: "/" },
    { label: "Packages", path: "/#packages" },
    { label: "About", path: "/#about" },
    { label: "Safaris", path: "/#safaris" },
    { label: "Reviews", path: "/#reviews" },
    { label: "Gallery", path: "/#gallery" },
    { label: "Contact", path: "/#contact" },
  ];
  const helpLinks = [
    { label: "Frequently", path: "/help/frequently" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms and Conditions", path: "/terms-and-conditions" },
    { label: "Return & Refund Policy", path: "/return-refund-policy" },
  ];
  const blogLinks = [
    { label: "Minneriya National Park", path: "/blog#minneriya", description: "The Great Elephant Gathering" },
    { label: "Kaudulla National Park", path: "/blog#kaudulla", description: "The Pristine Wildlife Corridor" },
    { label: "Wasgamuwa National Park", path: "/blog#wasgamuwa", description: "The Gathering Place of Bears" },
    { label: "Hurulu Eco Park", path: "/blog#hurulu", description: "The Vital Elephant Corridor" },
    { label: "Full Day Safari Experience", path: "/blog#full-day-safari", description: "Hurulu Eco Park & Minneriya or Kaudulla" },
    { label: "Dambulla Cultural & Safari Tour", path: "/blog#dambulla-safari", description: "Cave Temple, Economic Center & Evening Safari" },
    { label: "Village Tour", path: "/blog#hiriwadunna-village-tour", description: "Experience Authentic Sri Lankan Rural Life" },
    { label: "Polonnaruwa Ruins & Safari Tour", path: "/blog#polonnaruwa-safari", description: "Medieval Capital & Evening Safari" },
    { label: "Sigiriya / Pidurangala & Safari Tour", path: "/blog#sigiriya-pidurangala-safari", description: "Majestic Rock Hiking & Evening Safari" },
    { label: "Sigiriya Village Tour", path: "/blog#sigiriya-village-tour", description: "Experience Authentic Sri Lankan Rural Life" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) {
        setIsHelpMenuOpen(false);
      }
      if (blogMenuRef.current && !blogMenuRef.current.contains(event.target)) {
        setIsBlogMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b shadow-[0_10px_25px_rgba(0,0,0,0.18)] backdrop-blur-xl ${theme === "dark" ? "border-white/10 bg-[#101813]/95" : "border-[var(--border)] bg-[var(--page-bg)]/95"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm sm:h-12 sm:w-12">
            <img src={logoImg} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-outfit text-lg font-extrabold tracking-tight text-[#163c2c] sm:text-xl dark:text-white">
            Wild Jeep Safari
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navigationLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-full px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition-colors hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="relative" ref={helpMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsHelpMenuOpen((prev) => !prev);
                setIsBlogMenuOpen(false);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${isHelpMenuOpen ? "bg-sacramento text-white shadow shadow-sacramento/25" : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"}`}
            >
              Help
              <ChevronDown size={13} className={`transition-transform duration-200 ${isHelpMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isHelpMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 flex w-72 flex-col rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-[0_20px_40px_rgba(20,52,38,0.15)] dark:border-slate-800 dark:bg-slate-900">
                {helpLinks.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsHelpMenuOpen(false)} className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-all hover:bg-[#edf7ef] hover:text-[#1b5d3d] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="relative" ref={blogMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsBlogMenuOpen((prev) => !prev);
                setIsHelpMenuOpen(false);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${isBlogMenuOpen ? "bg-sacramento text-white shadow shadow-sacramento/25" : "text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"}`}
            >
              Blog
              <ChevronDown size={13} className={`transition-transform duration-200 ${isBlogMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isBlogMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 flex max-h-[75vh] w-80 flex-col rounded-2xl border border-[#dfe8dc] bg-[#fffdf9] p-2.5 shadow-[0_20px_40px_rgba(20,52,38,0.15)] dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-1 flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">Safari Travel Guides</p>
                  <Link to="/blog" onClick={() => setIsBlogMenuOpen(false)} className="text-[11px] font-bold text-sacramento hover:underline dark:text-castleton-300">View All</Link>
                </div>
                <div className="space-y-0.5 overflow-y-auto pr-1">
                  {blogLinks.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsBlogMenuOpen(false)} className="group flex flex-col rounded-xl px-3 py-2 text-left transition-all hover:bg-[#edf7ef] dark:hover:bg-slate-800">
                      <span className="flex items-center justify-between text-xs font-bold text-[#1d4334] group-hover:text-[#1b5d3d] dark:text-slate-200 dark:group-hover:text-white">{item.label}<span className="text-xs text-castleton opacity-0 transition-opacity group-hover:opacity-100">→</span></span>
                      <span className="line-clamp-1 text-[11px] text-slate-400 dark:text-slate-500">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link to="/login" className="rounded-full border border-[#2d6a4f]/30 bg-white/60 px-3 py-2 text-xs font-bold text-[#1b3b2c] transition-colors hover:bg-white sm:px-4 sm:text-sm dark:border-white/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
            Log in
          </Link>
          <Link to="/register" className="rounded-full bg-[#2E7D32] px-3 py-2 text-xs font-bold text-white shadow-lg shadow-green-900/20 transition-colors hover:bg-[#1B5E20] sm:px-4 sm:text-sm">
            Register
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ContactDetails() {
  return (
    <div className="mt-10 border-t border-[#d9e4d5] pt-8 dark:border-[#2f4437]">
      <h2 className="text-xl font-bold text-[#1b3b2c] dark:text-white">Contact Us</h2>
      <div className="mt-3 space-y-2 text-[#42584a] dark:text-[#b7c9b8]">
        <a className="flex items-center gap-2 transition-colors hover:text-[#2d6a4f]" href="mailto:info@minneriyawildjeepsafari.com"><Mail size={16} /> info@minneriyawildjeepsafari.com</a>
        <a className="flex items-center gap-2 transition-colors hover:text-[#2d6a4f]" href="tel:+94778902811"><Phone size={16} /> +94 77 890 2811</a>
      </div>
    </div>
  );
}

function PrivacyPolicyPage({ isDark }) {
  const headingClass = "text-xl font-bold text-[#1b3b2c] dark:text-white";
  const bodyClass = "mt-2 leading-7 text-[#42584a] dark:text-slate-300";
  const listClass = "mt-3 list-disc space-y-2 pl-6 leading-7 text-[#42584a] dark:text-slate-300";

  return (
    <>
      <HelpPageHeader />
      <main className={`min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${isDark ? "bg-[#101813]" : "bg-[#f3efe5]"}`}>
        <article className="mx-auto max-w-4xl rounded-[28px] border border-[#dfe8dc] bg-[#fffdf9] px-6 py-8 shadow-[0_18px_45px_rgba(20,52,38,0.08)] sm:px-10 sm:py-12 dark:border-[#2f4437] dark:bg-[#1d2b22]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2d6a4f] transition-colors hover:text-[#1f513b] dark:text-green-400 dark:hover:text-green-300">
            <ArrowLeft size={17} /> Back to home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#153827] sm:text-4xl dark:text-white">Privacy Policy</h1>
          <p className="mt-3 text-sm text-[#66806d] dark:text-[#9fb5a2]">Effective date: 19 August 2025</p>
          <p className={bodyClass}>
            We value your trust and are committed to protecting your privacy. This Privacy Policy explains what information we collect when you browse our website or book our safari tour packages, how we use it, and the choices you have.
          </p>

          <div className="mt-8 space-y-8">
            <section><h2 className={headingClass}>1) Information We Collect</h2><ul className={listClass}><li><strong>Personal Information</strong>: name, email, phone number, country/region, and any details you provide when making an inquiry or booking.</li><li><strong>Booking Details</strong>: selected tour/package, date and time preferences, hotel/meeting point for pickup, number of guests, and special requests.</li><li><strong>Payment Information</strong>: processed securely via third-party payment gateways; we do not store full card details on our servers.</li><li><strong>Communications</strong>: messages sent via contact forms, email, phone, WhatsApp, or social platforms.</li><li><strong>Technical Data</strong>: IP address, device and browser type, pages viewed, referring URLs, and general usage data collected via cookies or similar technologies.</li></ul></section>
            <section><h2 className={headingClass}>2) How We Use Your Information</h2><ul className={listClass}><li>To respond to inquiries, manage reservations, and deliver safari tour services (including coordinating with drivers/guides).</li><li>To process payments and send confirmations, invoices, and service notifications.</li><li>To improve our website, services, safety practices, and customer experience.</li><li>To send optional promotions or updates if you have opted in (you may unsubscribe at any time).</li><li>To comply with legal obligations and protect our rights, users, and staff.</li></ul></section>
            <section><h2 className={headingClass}>3) Legal Bases for Processing</h2><p className={bodyClass}>Where applicable, we rely on one or more of the following legal bases: your consent, performance of a contract (booking/tour), compliance with legal obligations, and our legitimate interests (such as improving services and website security).</p></section>
            <section><h2 className={headingClass}>4) Sharing &amp; Disclosure</h2><p className={bodyClass}>We do <strong>not</strong> sell or rent your personal data. We may share limited information with:</p><ul className={listClass}><li><strong>Service providers</strong> (e.g., jeep drivers, guides, pickup partners) strictly for delivering your booked services.</li><li><strong>Payment processors</strong> to securely handle transactions.</li><li><strong>IT/analytics providers</strong> who help us operate the website (subject to confidentiality and data protection terms).</li><li><strong>Authorities</strong> when required by law or to protect our legal rights and safety.</li></ul></section>
            <section><h2 className={headingClass}>5) Cookies &amp; Similar Technologies</h2><p className={bodyClass}>We use cookies and similar tools to operate the site, remember your preferences, and understand website performance. You can control cookies in your browser settings. Disabling certain cookies may affect site functionality.</p></section>
            <section><h2 className={headingClass}>6) Data Retention</h2><p className={bodyClass}>We retain personal information only for as long as necessary to provide services, comply with legal/financial obligations, resolve disputes, and enforce agreements. When data is no longer needed, we securely delete or anonymize it.</p></section>
            <section><h2 className={headingClass}>7) Data Security</h2><p className={bodyClass}>We implement reasonable technical and organizational measures to protect your data from unauthorized access, loss, or misuse. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p></section>
            <section><h2 className={headingClass}>8) Third-Party Links</h2><p className={bodyClass}>Our website may contain links to third-party sites (e.g., payment gateways, social media, blogs). Their privacy practices are independent of ours; please review their policies when you visit those sites.</p></section>
            <section><h2 className={headingClass}>9) International Transfers</h2><p className={bodyClass}>Depending on your location, your information may be transferred to and processed in countries with different data protection laws. Where required, we take steps to ensure an adequate level of protection in accordance with applicable law.</p></section>
            <section><h2 className={headingClass}>10) Your Rights &amp; Choices</h2><p className={bodyClass}>You may have rights to:</p><ul className={listClass}><li>Request access to, or a copy of, the personal data we hold about you.</li><li>Request correction or deletion of your data, or restriction of certain processing.</li><li>Object to processing in certain situations, and withdraw marketing consent at any time.</li><li>Lodge a complaint with your local data protection authority where applicable.</li></ul><p className={bodyClass}>To exercise these rights, contact us using the details below. We may need to verify your identity before fulfilling requests.</p></section>
            <section><h2 className={headingClass}>11) Children’s Privacy</h2><p className={bodyClass}>Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us personal data, please contact us to request deletion.</p></section>
            <section><h2 className={headingClass}>12) Updates to This Policy</h2><p className={bodyClass}>We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date. Your continued use of the website after updates constitutes acceptance of the revised policy.</p></section>
            <section><h2 className={headingClass}>13) Contact Us</h2><p className={bodyClass}>If you have questions about this Privacy Policy or your personal data, please contact:</p><p className="mt-4 leading-7 text-gray-600 dark:text-[#b7c9b8]">Email: <a className="text-green-700 hover:underline" href="mailto:info@minneriyawildjeepsafari.com">info@minneriyawildjeepsafari.com</a><br />Phone/WhatsApp: <code>+94 77 890 2811</code></p></section>
          </div>
        </article>
      </main>
    </>
  );
}

function TermsPolicyPage({ isDark }) {
  const headingClass = "text-xl font-bold text-[#1b3b2c] dark:text-white";
  const bodyClass = "mt-2 leading-7 text-[#42584a] dark:text-[#b7c9b8]";
  const listClass = "mt-3 list-disc space-y-2 pl-6 leading-7 text-[#42584a] dark:text-[#b7c9b8]";

  return (
    <>
      <HelpPageHeader />
      <main className={`min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${isDark ? "bg-[#101813]" : "bg-[#f3efe5]"}`}>
        <article className="mx-auto max-w-4xl rounded-[28px] border border-[#dfe8dc] bg-[#fffdf9] px-6 py-8 shadow-[0_18px_45px_rgba(20,52,38,0.08)] sm:px-10 sm:py-12 dark:border-[#2f4437] dark:bg-[#1d2b22]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2d6a4f] transition-colors hover:text-[#1f513b] dark:text-green-400 dark:hover:text-green-300">
            <ArrowLeft size={17} /> Back to home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#153827] sm:text-4xl dark:text-white">Terms &amp; Conditions</h1>
          <p className="mt-3 text-sm text-[#66806d] dark:text-[#9fb5a2]">Effective date: 19 August 2025</p>
          <p className={bodyClass}>By accessing and booking through our website, you agree to be bound by the following Terms &amp; Conditions. Please read them carefully before making a reservation.</p>

          <div className="mt-8 space-y-8">
            <section><h2 className={headingClass}>1) Eligibility</h2><p className={bodyClass}>You must be at least 18 years old to book a safari. If booking on behalf of others, you are responsible for ensuring all participants comply with these terms.</p></section>
            <section><h2 className={headingClass}>2) Bookings &amp; Payments</h2><ul className={listClass}><li>All bookings must be made through our website, email, or official partners.</li><li>Full or partial payment may be required at the time of booking.</li><li>Prices are quoted in Sri Lankan Rupees (LKR) unless otherwise stated.</li><li>Park entrance fees are payable separately and subject to government rates.</li></ul></section>
            <section><h2 className={headingClass}>3) Cancellations &amp; Refunds</h2><p className={bodyClass}>Cancellations and refunds are governed by our <Link className="text-green-700 hover:underline" to="/return-refund-policy">Return &amp; Refund Policy</Link>. Please review it before making a booking.</p></section>
            <section><h2 className={headingClass}>4) Changes to Bookings</h2><p className={bodyClass}>Date or time changes are subject to jeep and guide availability. Additional fees may apply. We cannot guarantee availability for last-minute changes.</p></section>
            <section><h2 className={headingClass}>5) Safari Safety Rules</h2><ul className={listClass}><li>All guests must follow the instructions of the driver/guide.</li><li>Feeding, disturbing, or harassing animals is strictly prohibited.</li><li>Smoking and alcohol consumption are not allowed during the safari.</li><li>We reserve the right to refuse service to any guest behaving inappropriately or dangerously.</li></ul></section>
            <section><h2 className={headingClass}>6) Assumption of Risk &amp; Liability</h2><p className={bodyClass}>Participation in a jeep safari involves inherent risks, including but not limited to exposure to wildlife, rough terrain, and weather conditions. By booking, you acknowledge these risks and agree that the service provider is not liable for personal injury, loss, or damage unless caused by proven negligence.</p></section>
            <section><h2 className={headingClass}>7) Force Majeure</h2><p className={bodyClass}>We are not responsible for delays, cancellations, or service interruptions caused by events beyond our control, such as natural disasters, strikes, government actions, or national park closures.</p></section>
            <section><h2 className={headingClass}>8) Intellectual Property</h2><p className={bodyClass}>All website content, images, and branding are the property of the service provider and may not be copied, distributed, or used without permission.</p></section>
            <section><h2 className={headingClass}>9) Privacy</h2><p className={bodyClass}>Your use of our website and services is also governed by our <Link className="text-green-700 hover:underline" to="/privacy-policy">Privacy Policy</Link>.</p></section>
            <section><h2 className={headingClass}>10) Governing Law</h2><p className={bodyClass}>These Terms &amp; Conditions are governed by the laws of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of Sri Lankan courts.</p></section>
            <section><h2 className={headingClass}>11) Changes to Terms</h2><p className={bodyClass}>We reserve the right to update these Terms &amp; Conditions at any time. Updates will be posted on this page with a revised effective date.</p></section>
            <section><h2 className={headingClass}>12) Contact Us</h2><p className={bodyClass}>For any questions about these Terms &amp; Conditions, please contact:</p><p className="mt-4 leading-7 text-gray-600 dark:text-[#b7c9b8]">Email: <a className="text-green-700 hover:underline" href="mailto:info@minneriyawildjeepsafari.com">info@minneriyawildjeepsafari.com</a><br />Phone/WhatsApp: <code>+94 77 890 2811</code></p></section>
          </div>
        </article>
      </main>
    </>
  );
}

function RefundPolicyPage({ isDark }) {
  const headingClass = "text-xl font-bold text-[#1b3b2c] dark:text-white";
  const bodyClass = "mt-2 leading-7 text-[#42584a] dark:text-[#b7c9b8]";
  const listClass = "mt-3 list-disc space-y-2 pl-6 leading-7 text-[#42584a] dark:text-[#b7c9b8]";

  return (
    <>
      <HelpPageHeader />
      <main className={`min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${isDark ? "bg-[#101813]" : "bg-[#f3efe5]"}`}>
        <article className="mx-auto max-w-4xl rounded-[28px] border border-[#dfe8dc] bg-[#fffdf9] px-6 py-8 shadow-[0_18px_45px_rgba(20,52,38,0.08)] sm:px-10 sm:py-12 dark:border-[#2f4437] dark:bg-[#1d2b22]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#2d6a4f] transition-colors hover:text-[#1f513b] dark:text-green-400 dark:hover:text-green-300">
            <ArrowLeft size={17} /> Back to home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#153827] sm:text-4xl dark:text-white">Return &amp; Refund Policy</h1>
          <p className="mt-3 text-sm text-[#66806d] dark:text-[#9fb5a2]">Effective date: 19 August 2025</p>
          <p className={bodyClass}>We aim to provide memorable safari experiences. This Return &amp; Refund Policy explains how cancellations, changes, and refunds are handled when booking safari tours through our website.</p>
          <p className={bodyClass}>Guests booking without an account cannot manage or cancel reservations online through the dashboard and must contact our staff directly for any cancellations or changes.</p>

          <div className="mt-8 space-y-8">
            <section><h2 className={headingClass}>1) Cancellations by Customers</h2><ul className={listClass}><li>More than 7 days before tour date: Full refund (minus payment gateway/transaction fees).</li><li>3–7 days before tour date: 50% refund.</li><li>Less than 3 days before tour date or no-show: No refund.</li></ul></section>
            <section><h2 className={headingClass}>2) Cancellations by the Service Provider</h2><p className={bodyClass}>In rare cases (e.g., park closures, unsafe weather, jeep breakdowns, or unforeseen circumstances), we may cancel or reschedule your safari. If rescheduling is not possible, you will receive a full refund.</p></section>
            <section><h2 className={headingClass}>3) Rescheduling</h2><p className={bodyClass}>Customers may request to reschedule a booking at least 72 hours before the scheduled safari. Approval depends on jeep and guide availability. Rescheduling less than 72 hours before is subject to fees or may not be possible.</p></section>
            <section><h2 className={headingClass}>4) Partial Cancellations (Group Bookings)</h2><p className={bodyClass}>For group bookings, partial cancellations may be accepted with revised pricing. Refunds will be calculated based on the updated group size and cancellation notice period.</p></section>
            <section><h2 className={headingClass}>5) Refund Processing</h2><ul className={listClass}><li>Refunds are issued to the original payment method used for booking.</li><li>Processing times depend on your bank or payment provider (typically 7–14 business days).</li><li>We are not responsible for delays caused by third-party payment processors.</li></ul></section>
            <section><h2 className={headingClass}>6) Non-Refundable Items</h2><p className={bodyClass}>The following are <strong>non-refundable</strong>:</p><ul className={listClass}><li>Entrance tickets to national parks (once purchased).</li><li>Last-minute add-ons or services confirmed on the day of safari.</li><li>No-shows or late arrivals beyond 30 minutes of the agreed pickup time.</li></ul></section>
            <section><h2 className={headingClass}>7) Contact Us</h2><p className={bodyClass}>If you have any questions about our Return &amp; Refund Policy, please contact:</p><p className="mt-4 leading-7 text-gray-600 dark:text-[#b7c9b8]">Email: <a className="text-green-700 hover:underline" href="mailto:info@minneriyawildjeepsafari.com">info@minneriyawildjeepsafari.com</a><br />Phone/WhatsApp: <code>+94 77 890 2811</code></p></section>
          </div>
        </article>
      </main>
    </>
  );
}

function FrequentlyPage({ content, isDark }) {
  const [openQuestion, setOpenQuestion] = useState(null);
  const helpLinks = [
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms and Conditions", path: "/terms-and-conditions" },
    { label: "Return & Refund Policy", path: "/return-refund-policy" },
  ];

  return (
    <>
      <HelpPageHeader />
      <main className={isDark ? "min-h-screen bg-[#101813]" : "min-h-screen bg-[#f3efe5]"}>
        <section className={isDark ? "bg-[radial-gradient(circle_at_top,_rgba(26,82,60,0.7),_rgba(9,20,18,1)_60%)] px-4 py-10 sm:py-16" : "bg-[radial-gradient(circle_at_top,_#2c6e4a,_#173d2f_55%,_#112b22)] px-4 py-10 sm:py-16"}>
          <div className="mx-auto max-w-7xl">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-[#dfeecf]">
              <ArrowLeft size={17} /> Back to home
            </Link>
            <h1 className="text-center text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Hello, what can we help you find?
            </h1>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {helpLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-emerald-900/20"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2">
            {content.sections.map((section, index) => {
              const isOpen = openQuestion === index;
              return (
                <div key={section.question} className={`relative overflow-hidden rounded-[24px] border ${isDark ? "border-[#2f4437] bg-[#1d2b22]/80" : "border-[#dfe8dc] bg-[#fffdf9] shadow-[0_16px_35px_rgba(18,36,26,0.08)]"}`}>
                  <button
                    type="button"
                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex min-h-[96px] w-full items-center justify-between gap-6 px-7 py-6 text-left text-lg font-bold text-[#163c2c] transition-colors hover:text-[#2d6a4f] sm:px-11 dark:text-white dark:hover:text-green-300"
                  >
                    <span>{section.question}</span>
                    <ChevronDown className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} size={22} />
                  </button>
                  {isOpen && (
                    <>
                      <div className="border-t border-[#dfe8dc] bg-[#f8faf5] px-7 pb-7 pt-5 text-base leading-7 text-[#42584a] sm:px-11 dark:border-[#2f4437] dark:bg-[#24382b]/80 dark:text-[#b7c9b8]">
                        {section.answer}
                      </div>
                      <span className="absolute bottom-0 right-0 h-14 w-14 bg-[#2a704d] [clip-path:polygon(100%_0,100%_100%,0_100%)]" aria-hidden="true" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

export default function PolicyPage() {
  const { type } = useParams();
  const location = useLocation();
  const { theme } = useTheme();
  const routeType = type || {
    "/privacy-policy": "privacy",
    "/terms-and-conditions": "terms",
    "/return-refund-policy": "refunds",
  }[location.pathname];
  const content = policyContent[routeType] || policyContent.frequently;
  const isDark = theme === "dark";

  if (routeType === "frequently") {
    return <FrequentlyPage content={content} isDark={isDark} />;
  }

  if (routeType === "privacy") {
    return <PrivacyPolicyPage isDark={isDark} />;
  }

  if (routeType === "terms") {
    return <TermsPolicyPage isDark={isDark} />;
  }

  if (routeType === "refunds") {
    return <RefundPolicyPage isDark={isDark} />;
  }

  return (
    <>
      <HelpPageHeader />
      <main className={`min-h-screen px-4 py-10 sm:px-6 lg:px-8 ${isDark ? "bg-slate-950" : "bg-[#f8f6f0]"}`}>
        <article className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-12 dark:border-slate-700 dark:bg-slate-900">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 dark:text-green-400">
            <ArrowLeft size={17} /> Back to home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">{content.title}</h1>
          {content.effectiveDate && <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">Effective date: {content.effectiveDate}</p>}
          {content.intro && <p className="mt-7 text-lg leading-8 text-gray-700 dark:text-slate-300">{content.intro}</p>}
          <div className="mt-8 space-y-8">
            {content.sections.map((section) => (
              <section key={section.heading || section.question}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{section.heading || section.question}</h2>
                <p className="mt-2 leading-7 text-gray-600 dark:text-slate-300">{section.answer || section.body}</p>
              </section>
            ))}
          </div>
          {content.image && <img src={content.image} alt="Pidurangala landscape near Minneriya" className="mt-10 h-auto w-full rounded-xl object-cover" />}
          {routeType !== "frequently" && <ContactDetails />}
        </article>
      </main>
    </>
  );
}
