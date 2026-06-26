import React from "react";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Company: [
    ["About Us", "/about"],
    ["Pricing", "/pricing"],
    ["Contact", "/contact"],
    ["Success Stories", "/"]
  ],
  Members: [
    ["Register Free", "/register"],
    ["Login", "/login"],
    ["Search Matches", "/matches"],
    ["Upgrade Plan", "/subscription"]
  ],
  Help: [
    ["Privacy Policy", "#"],
    ["Terms of Service", "#"],
    ["Cookie Policy", "#"],
    ["FAQ", "#"]
  ]
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="container-pad py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 text-xl font-black text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-maroon-600 to-pink-600 text-white">
                <Heart size={18} fill="currentColor" />
              </span>
              Soulmate Matrimony
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
              India's most trusted matrimony platform. Connecting genuine profiles for meaningful, lifelong partnerships.
            </p>
            <div className="mt-6 grid gap-2">
              <a href="mailto:hello@soulmate.in" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail size={14} /> hello@soulmate.in
              </a>
              <a href="tel:+918000000000" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Phone size={14} /> +91 80000 00000
              </a>
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={14} /> Chennai, Tamil Nadu, India
              </p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">{group}</p>
              <ul className="grid gap-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Soulmate Matrimony. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={12} fill="currentColor" className="text-pink-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
