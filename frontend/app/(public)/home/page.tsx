'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { publicApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { Sparkles, Star, CheckCircle, ChevronRight, Menu, X, Phone, Mail, MapPin } from 'lucide-react';

const SERVICES = [
  { emoji:'💍', title:'Weddings', desc:'From intimate ceremonies to grand celebrations.' },
  { emoji:'👑', title:'Debuts & Birthdays', desc:'Mark every milestone with an event that captures your personality.' },
  { emoji:'🏢', title:'Corporate Events', desc:'Professional, polished, on-brand.' },
  { emoji:'🎉', title:'Special Occasions', desc:'Christenings, graduations, anniversaries — every occasion.' },
];
const PACKAGES = [
  { icon:'🥈', name:'Silver', price:'₱25,000', guests:'Up to 50 guests', highlight:false, features:['4-hour coverage','Basic décor','Coordinator'] },
  { icon:'🥇', name:'Gold', price:'₱55,000', guests:'Up to 150 guests', highlight:true, features:['8-hour coverage','Premium décor','Supplier coordination','Account manager'] },
  { icon:'💎', name:'Platinum', price:'₱95,000', guests:'Up to 300 guests', highlight:false, features:['Full-day coverage','Luxury florals','Complete management','Client portal access'] },
  { icon:'⚡', name:'Custom', price:'Negotiable', guests:'Any size', highlight:false, features:['Fully tailored','Any event type','Bespoke sourcing'] },
];
const WHY_US = [
  { icon:'🏆', title:'10+ Years', desc:'A decade of creating unforgettable events.' },
  { icon:'💛', title:'98% Satisfaction', desc:'Our clients rate us 4.9/5.' },
  { icon:'🤝', title:'Trusted Network', desc:'We work with the best vendors.' },
  { icon:'🔒', title:'Client Portal', desc:'Track your event progress anytime.' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const { data: testimonials } = useQuery({ queryKey:['testimonials'], queryFn: () => publicApi.getTestimonials().then(r => r.data) });

  const reviews = (testimonials && testimonials.length > 0) ? testimonials : [
    { clientName:'Maria & Jake Santos', eventType:'Wedding', rating:5, testimonial:'Metro Events made our dream wedding a reality. Every detail was perfect.' },
    { clientName:'Sophia Reyes', eventType:'Debut', rating:5, testimonial:'My 18th was everything I imagined. The team was so attentive!' },
    { clientName:'ABC Corporation', eventType:'Corporate Gala', rating:5, testimonial:'Professional and creative. Handled our 500-pax gala flawlessly.' },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-16 bg-[#0D1117]/85 backdrop-blur border-b border-[#0F3460]/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-gold flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          <div><p className="font-bold text-sm">Metro Events</p><p className="text-[10px] text-gray-500 uppercase tracking-widest">Creating Memories</p></div>
        </div>
        <div className="hidden md:flex gap-7 text-sm text-gray-400">
          {['Services','Packages','Why Us','Testimonials','Contact'].map(s => <a key={s} href={`#${s.toLowerCase().replace(' ','-')}`} className="hover:text-brand-gold transition">{s}</a>)}
        </div>
        <div className="hidden md:flex gap-2">
          {isAuthenticated ? <Link href="/portal" className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-light text-white text-sm font-semibold rounded-lg transition">My Event</Link> : (
            <><Link href="/client/login" className="px-4 py-2 border border-gray-700 text-sm rounded-lg text-gray-300 hover:text-white transition">Sign In</Link>
            <button onClick={() => setShowOrder(true)} className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-light text-white text-sm font-semibold rounded-lg transition">Book Now</button></>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0D1117] pt-16 px-6 flex flex-col gap-3 md:hidden">
          {['Services','Packages','Why Us','Contact'].map(s => <a key={s} href={`#${s.toLowerCase().replace(' ','-')}`} onClick={() => setMenuOpen(false)} className="text-lg text-gray-300 py-3 border-b border-gray-800">{s}</a>)}
          <Link href="/client/login" className="mt-4 py-2.5 border border-gray-700 rounded-lg text-sm text-center">Sign In</Link>
          <button onClick={() => { setShowOrder(true); setMenuOpen(false); }} className="py-2.5 bg-brand-gold text-white text-sm font-semibold rounded-lg">Book Now</button>
        </div>
      )}

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-[5%] pt-24 pb-16"
        style={{ background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%), #0D1117' }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs mb-6">
          <Star className="w-3 h-3 fill-brand-gold" /> 4.9 Rating · 200+ Events Done
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-5 max-w-4xl">
          We Create <span className="text-brand-gold">Memories</span> That Last Forever
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mb-10">Full-service event planning in the Philippines — from weddings to corporate galas.</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => setShowOrder(true)} className="flex items-center gap-2 px-7 py-3.5 bg-brand-gold hover:bg-brand-gold-light text-white font-bold rounded-xl transition">Book Your Event <ChevronRight className="w-4 h-4" /></button>
          <a href="#packages" className="px-7 py-3.5 border border-gray-700 hover:border-brand-gold/50 rounded-xl text-gray-300 hover:text-white transition">View Packages</a>
        </div>
        <div className="flex gap-12 mt-20 pt-12 border-t border-gray-800/60 flex-wrap justify-center">
          {[['200+','Events'],['98%','Happy Clients'],['5★','Rating'],['10+','Years']].map(([n,l]) => (
            <div key={l} className="text-center"><p className="text-3xl font-extrabold text-brand-gold">{n}</p><p className="text-xs text-gray-500 mt-1">{l}</p></div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-[5%] bg-[#16213E]/30">
        <SectionHeader tag="What We Do" title="Full-Service Event Planning" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {SERVICES.map(s => (
            <div key={s.title} className="bg-[#16213E] rounded-2xl border border-[#0F3460]/50 p-6 hover:border-brand-gold/30 transition-colors">
              <div className="text-4xl mb-4">{s.emoji}</div>
              <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="py-24 px-[5%]">
        <SectionHeader tag="Pricing" title="Choose Your Package" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {PACKAGES.map(pkg => (
            <div key={pkg.name} className={`rounded-2xl border p-6 flex flex-col transition-all hover:-translate-y-1 ${pkg.highlight ? 'bg-brand-gold/10 border-brand-gold/60' : 'bg-[#16213E] border-[#0F3460]/50'}`}>
              {pkg.highlight && <div className="text-center mb-3"><span className="text-xs font-bold text-brand-gold bg-brand-gold/20 px-3 py-1 rounded-full">Most Popular</span></div>}
              <div className="text-3xl mb-3">{pkg.icon}</div>
              <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
              <p className="text-2xl font-extrabold text-brand-gold mt-2 mb-1">{pkg.price}</p>
              <p className="text-xs text-gray-400 mb-5">{pkg.guests}</p>
              <ul className="space-y-2 flex-1">{pkg.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />{f}</li>
              ))}</ul>
              <button onClick={() => setShowOrder(true)} className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition ${pkg.highlight ? 'bg-brand-gold hover:bg-brand-gold-light text-white' : 'border border-gray-700 hover:border-brand-gold text-gray-300'}`}>
                Book This Package
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section id="why-us" className="py-24 px-[5%] bg-[#16213E]/30">
        <SectionHeader tag="Why Metro Events" title="The Metro Difference" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {WHY_US.map(w => (
            <div key={w.title} className="bg-[#16213E] rounded-2xl border border-[#0F3460]/50 p-6">
              <div className="text-3xl mb-3">{w.icon}</div>
              <h3 className="font-bold text-white mb-2">{w.title}</h3>
              <p className="text-sm text-gray-400">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-[5%]">
        <SectionHeader tag="Client Stories" title="What Our Clients Say" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {(reviews as any[]).slice(0,3).map((r: any, i: number) => (
            <div key={i} className="bg-[#16213E] rounded-2xl border border-[#0F3460]/50 p-6">
              <div className="flex gap-0.5 mb-3">{[...Array(r.rating ?? 5)].map((_,s) => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">"{r.testimonial ?? r.comment}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold">{(r.clientName ?? r.name ?? 'C')[0]}</div>
                <div><p className="text-sm font-semibold text-white">{r.clientName ?? r.name}</p><p className="text-xs text-gray-500">{r.eventType}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-[5%] bg-[#16213E]/30">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <SectionHeader tag="Get in Touch" title="Let's Plan Something Amazing" left />
            <div className="space-y-3 text-sm text-gray-400 mt-6">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-gold" /> +63 917 123 4567</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-gold" /> hello@metroevents.ph</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-gold" /> Quezon City, Metro Manila</p>
            </div>
          </div>
          <div className="bg-[#16213E] rounded-2xl border border-[#0F3460]/50 p-7 flex flex-col items-center justify-center gap-4 text-center">
            <Sparkles className="w-10 h-10 text-brand-gold" />
            <h3 className="text-xl font-bold text-white">Ready to Book?</h3>
            <p className="text-sm text-gray-400">Submit an inquiry and we'll get back to you within 24 hours.</p>
            <button onClick={() => setShowOrder(true)} className="w-full py-3 bg-brand-gold hover:bg-brand-gold-light text-white font-bold rounded-xl transition">Submit an Inquiry</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-[5%] border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-brand-gold flex items-center justify-center text-sm"><Sparkles className="w-4 h-4 text-white" /></div><p className="text-sm text-gray-400">Metro Events — Creating memories since 2014</p></div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Metro Events. All rights reserved.</p>
      </footer>

      {showOrder && <OrderModal onClose={() => setShowOrder(false)} />}
    </div>
  );
}

function SectionHeader({ tag, title, left }: { tag: string; title: string; left?: boolean }) {
  return (
    <div className={`${left ? '' : 'text-center'} mb-12`}>
      <span className="text-xs text-brand-gold font-semibold uppercase tracking-widest">{tag}</span>
      <h2 className="text-3xl md:text-4xl font-extrabold mt-2 text-white">{title}</h2>
    </div>
  );
}

function OrderModal({ onClose }: { onClose: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const { register, handleSubmit } = useForm({ defaultValues: { phone:'', eventDate:'', packageType:'gold', message:'' } });
  const mutation = useMutation({ mutationFn: publicApi.submitOrderRequest, onSuccess: () => { toast.success("Thanks! We'll be in touch within 24 hours. 🎉"); onClose(); }, onError: () => toast.error('Failed to submit. Please try again.') });
  return (
    <Modal title="📋 Submit an Inquiry" onClose={onClose} size="lg">
      {!isAuthenticated ? (
        <div className="text-center py-6 space-y-4">
          <p className="text-gray-400">Please sign in to submit an inquiry.</p>
          <Link href="/client/login" className="inline-block px-6 py-2.5 bg-brand-gold text-white font-semibold rounded-lg">Sign In / Register</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone Number" placeholder="+63 917 000 0000" {...register('phone')} />
            <Input label="Target Event Date" type="date" {...register('eventDate')} />
            <div className="col-span-2">
              <Select label="Preferred Package" {...register('packageType')}>
                <option value="silver">🥈 Silver — ₱25,000</option>
                <option value="gold">🥇 Gold — ₱55,000</option>
                <option value="platinum">💎 Platinum — ₱95,000</option>
                <option value="custom">⚡ Custom</option>
              </Select>
            </div>
            <div className="col-span-2"><Textarea label="Message" rows={3} placeholder="Tell us about your event…" {...register('message')} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button type="submit" loading={mutation.isPending}>Send Inquiry</Button></div>
        </form>
      )}
    </Modal>
  );
}
