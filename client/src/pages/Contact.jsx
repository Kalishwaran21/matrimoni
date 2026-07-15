import React, { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "../components/Toast";
import Spinner from "../components/Spinner";
import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send (wire to backend / email service in production)
    setTimeout(() => {
      toast.success(t("contactSuccess"));
      setForm({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-maroon-700 to-maroon-900 py-20 text-white text-center">
        <div className="container-pad">
          <p className="label text-maroon-300">{t("contactHeroTag")}</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">{t("contactHeroTitle")}</h1>
          <p className="mt-4 text-maroon-200 max-w-lg mx-auto">
            {t("contactHeroDesc")}
          </p>
        </div>
      </section>

      <section className="bg-[#fff8fa] py-20">
        <div className="container-pad grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
          {/* Contact info */}
          <div className="grid gap-5">
            {[
              { icon: Mail, label: t("contactEmailLabel"), value: "hello@soulmate.in", href: "mailto:hello@soulmate.in" },
              { icon: Phone, label: t("contactPhoneLabel"), value: "+91 80000 00000", href: "tel:+918000000000" },
              { icon: MapPin, label: t("contactOfficeLabel"), value: language === "ta" ? "சென்னை, தமிழ்நாடு, இந்தியா" : "Chennai, Tamil Nadu, India", href: "#" },
              { icon: MessageCircle, label: t("contactHoursLabel"), value: language === "ta" ? "திங்கள் – சனி, காலை 9 – மாலை 6 IST" : "Mon – Sat, 9 AM – 6 PM IST", href: "#" }
            ].map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} className="flex items-start gap-4 panel card-hover no-underline">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-maroon-50 text-maroon-600">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="label">{label}</p>
                  <p className="mt-1 font-semibold text-slate-800">{value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Contact form */}
          <form onSubmit={submit} className="panel">
            <h2 className="text-2xl font-black text-slate-950 mb-6">{t("contactFormTitle")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">{t("contactName")}</span>
                <input
                  id="contact-name"
                  className="field mt-2"
                  placeholder="Full name"
                  value={form.name}
                  onChange={f("name")}
                  required
                />
              </label>
              <label>
                <span className="label">{t("contactEmailField")}</span>
                <input
                  id="contact-email"
                  className="field mt-2"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={f("email")}
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="label">{t("contactSubject")}</span>
                <input
                  id="contact-subject"
                  className="field mt-2"
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={f("subject")}
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="label">{t("contactMessage")}</span>
                <textarea
                  id="contact-message"
                  className="field mt-2 min-h-[120px] resize-y"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={f("message")}
                  required
                  rows={5}
                />
              </label>
              <button
                id="contact-submit"
                className="btn-primary sm:col-span-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="border-white/40 border-t-white" /> {t("contactSending")}
                  </>
                ) : (
                  <>
                    <Send size={17} /> {t("contactSubmit")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
