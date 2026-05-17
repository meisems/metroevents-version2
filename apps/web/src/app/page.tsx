// apps/web/src/app/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

export default function LandingPage() {
  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: () => api.get('/reviews?featured=true').then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Metro Events</span>
          <span className="ml-2 text-xs text-amber-600 font-medium uppercase tracking-widest">PH</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Staff Login
          </Link>
          <Link href="/portal" className="btn-primary text-sm">
            Client Portal
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-slate-900 text-white py-28 px-8 text-center">
        <p className="text-amber-400 text-sm font-medium uppercase tracking-widest mb-4">
          Creating memories since 2018
        </p>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Your Dream Event,<br />Perfectly Executed.
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Metro Events handles everything — from concept to teardown. Weddings, debuts, corporate events, and everything in between.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/portal/register" className="bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">
            Book a Consultation
          </Link>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"
             className="bg-white/10 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
            See Our Work
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What We Do</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { emoji: '💍', label: 'Weddings' },
            { emoji: '🎂', label: 'Birthdays & Debuts' },
            { emoji: '🏢', label: 'Corporate Events' },
            { emoji: '🎉', label: 'Special Occasions' },
          ].map((s) => (
            <div key={s.label} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{s.emoji}</div>
              <p className="font-semibold text-gray-800">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-gray-50 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Metro Events?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '✨', title: 'Full-Service Production', desc: 'From concept and design to logistics and execution — we handle it all so you can enjoy your day.' },
              { icon: '📦', title: 'In-House Inventory', desc: 'Extensive furniture, decor, and props inventory means no middlemen and lower costs for you.' },
              { icon: '🤝', title: 'Dedicated Coordinator', desc: 'Your personal coordinator is with you every step of the way, from first inquiry to post-event.' },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews?.length > 0 && (
        <section className="py-20 px-8 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r: any) => (
              <div key={r.id} className="card p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.comment}"</p>
                <p className="text-xs font-semibold text-gray-500">{r.client?.fullName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-slate-900 text-white py-16 px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start planning?</h2>
        <p className="text-slate-400 mb-8">Create your client account and let's build something beautiful together.</p>
        <Link href="/portal/register" className="bg-amber-500 text-white px-10 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors">
          Get Started — It's Free
        </Link>
      </section>

      <footer className="text-center py-8 text-sm text-gray-400 border-t">
        © {new Date().getFullYear()} Metro Events Philippines. All rights reserved.
      </footer>
    </div>
  );
}
