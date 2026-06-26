import React from "react";
import { Heart, HeartHandshake, Lock, ShieldCheck, Star, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const team = [
  { name: "Priya Raghavan", role: "Founder & CEO", initial: "P" },
  { name: "Arjun Menon", role: "Head of Technology", initial: "A" },
  { name: "Deepika Iyer", role: "Head of Trust & Safety", initial: "D" }
];

const milestones = [
  { year: "2020", desc: "Atamio Matrimony founded in Chennai" },
  { year: "2021", desc: "Reached 5,000 verified profiles" },
  { year: "2022", desc: "Launched Premium membership plans" },
  { year: "2023", desc: "8,000+ successful matches celebrated" },
  { year: "2024", desc: "Expanded to 140+ cities across India" }
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-maroon-700 to-maroon-900 py-24 text-white text-center">
        <div className="container-pad">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Heart size={32} fill="currentColor" className="text-pink-300" />
          </div>
          <p className="label text-maroon-300">Our story</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">About Atamio Matrimony</h1>
          <p className="mt-5 mx-auto max-w-2xl text-lg leading-8 text-maroon-200">
            We believe every person deserves a meaningful connection. Atamio was built to make the
            search for a life partner dignified, private, and purposeful.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-20">
        <div className="container-pad grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="label">Our mission</p>
            <h2 className="mt-3 section-title">
              Connecting hearts with{" "}
              <span className="text-maroon-700">intention and trust</span>
            </h2>
            <p className="section-subtitle">
              Atamio Matrimony was founded with one goal: to provide a platform where families and
              individuals can find life partners based on real compatibility — not just browsing.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              We combine detailed profiles, interest-first communication, horoscope matching, and
              human review to create a space that families trust and individuals feel safe in.
            </p>
            <Link to="/register" className="btn-primary mt-8 inline-flex">
              Join Atamio Free →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, label: "Verified Profiles", desc: "Every profile manually reviewed." },
              { icon: Lock, label: "Privacy First", desc: "Contact shared only after interest." },
              { icon: HeartHandshake, label: "Interest Gated", desc: "Chat only after mutual acceptance." },
              { icon: Star, label: "Compatibility Score", desc: "Smart matching algorithm." }
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                <Icon size={20} className="text-maroon-600 mb-3" />
                <p className="font-black text-slate-950">{label}</p>
                <p className="mt-1 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-[#fff8fa] py-20">
        <div className="container-pad">
          <p className="label text-center">Our journey</p>
          <h2 className="mt-3 section-title text-center mb-12">Milestones that matter</h2>
          <div className="relative border-l-2 border-maroon-200 pl-8 grid gap-8 max-w-2xl mx-auto">
            {milestones.map(({ year, desc }) => (
              <div key={year} className="relative">
                <span className="absolute -left-[2.65rem] top-1 h-4 w-4 rounded-full border-2 border-maroon-500 bg-white" />
                <p className="text-xs font-black uppercase tracking-widest text-maroon-500">{year}</p>
                <p className="mt-1 text-slate-700 font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-20">
        <div className="container-pad">
          <p className="label text-center">The team</p>
          <h2 className="mt-3 section-title text-center mb-12">People behind Atamio</h2>
          <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
            {team.map(({ name, role, initial }) => (
              <div key={name} className="panel card-hover text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-maroon-100 to-rose-100 text-2xl font-black text-maroon-700">
                  {initial}
                </div>
                <p className="font-black text-slate-950">{name}</p>
                <p className="mt-1 text-sm text-slate-500">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-maroon-700 to-maroon-900 py-16 text-white">
        <div className="container-pad grid gap-8 sm:grid-cols-4 text-center">
          {[
            { value: "32K+", label: "Verified Profiles" },
            { value: "8.5K", label: "Successful Matches" },
            { value: "18K", label: "Active Members" },
            { value: "140+", label: "Cities Covered" }
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-black text-white">{value}</p>
              <p className="mt-1 text-sm text-maroon-300">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
