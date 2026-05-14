import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import {
  Scale, Shield, FileText, MessageSquare, Users,
  ChevronRight, CheckCircle, ArrowRight, Star,
  Lock, Zap, Globe,
} from "lucide-react";
import PublicLayout from "@/components/common/PublicLayout";

/* ── 3D background — documents floating over rich teal bg ── */
function LegalBackground() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 14;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const d1 = new THREE.DirectionalLight(0x7dd3d8, 1.4); d1.position.set(5, 8, 5); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.6); d2.position.set(-5, -3, 3); scene.add(d2);

    function docShape(w, h, r) {
      const s = new THREE.Shape();
      s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2); s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      s.lineTo(w/2,h/2-r); s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
      s.lineTo(-w/2+r,h/2); s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
      s.lineTo(-w/2,-h/2+r); s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      return s;
    }
    function addLine(parent, y, w, color, opacity) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, 0.055),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
      );
      m.position.set(0, y, 0.02); parent.add(m);
    }

    // Brighter doc colours so they pop on dark bg
    const COLS = [
      { face: 0xffffff, l1: 0x01696f, l2: 0x4f9cf9 },
      { face: 0xe8f4ff, l1: 0x1e40af, l2: 0x6366f1 },
      { face: 0xedfff8, l1: 0x166534, l2: 0x01696f },
    ];
    const docs = [];
    for (let i = 0; i < 16; i++) {
      const c = COLS[i % 3], w = 0.9 + Math.random()*0.6, h = 1.2 + Math.random()*0.6;
      const doc = new THREE.Mesh(
        new THREE.ExtrudeGeometry(docShape(w,h,0.08),{depth:0.05,bevelEnabled:false}),
        new THREE.MeshPhongMaterial({ color:c.face, transparent:true, opacity:0.92, shininess:80 })
      );
      const cs = i%3===0 ? 0.18 : 0;
      if (cs) {
        const cShape = new THREE.Shape();
        cShape.moveTo(0,0); cShape.lineTo(cs,0); cShape.lineTo(0,-cs); cShape.closePath();
        const corner = new THREE.Mesh(
          new THREE.ExtrudeGeometry(cShape,{depth:0.055,bevelEnabled:false}),
          new THREE.MeshPhongMaterial({ color:c.l1, transparent:true, opacity:0.6 })
        );
        corner.position.set(w/2-cs, h/2-0.005, 0); doc.add(corner);
      }
      addLine(doc, h/2-0.22, w*0.55, c.l1, 1.0);
      addLine(doc, h/2-0.38, w*0.70, c.l2, 0.6);
      addLine(doc, h/2-0.54, w*0.65, c.l2, 0.5);
      addLine(doc, h/2-0.70, w*0.60, c.l2, 0.4);
      if (h > 1.5) addLine(doc, h/2-0.86, w*0.50, c.l2, 0.3);
      doc.position.set((Math.random()-0.5)*18, (Math.random()-0.5)*10, (Math.random()-0.5)*6-1);
      doc.rotation.z = (Math.random()-0.5)*0.5;
      doc.rotation.x = (Math.random()-0.5)*0.3;
      docs.push({ mesh:doc, speed:0.25+Math.random()*0.35, amp:0.28+Math.random()*0.28,
        rot:(Math.random()-0.5)*0.003, phase:Math.random()*Math.PI*2, baseY:doc.position.y });
      scene.add(doc);
    }
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2,0.05,16,60),
      new THREE.MeshPhongMaterial({ color:0x7dd3d8, transparent:true, opacity:0.15 }));
    ring1.position.set(4, -1, -5); scene.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.0,0.035,16,60),
      new THREE.MeshPhongMaterial({ color:0xffffff, transparent:true, opacity:0.08 }));
    ring2.position.set(-3, 2, -6); ring2.rotation.x=0.5; scene.add(ring2);

    const clock = new THREE.Clock(); let fid;
    function animate() {
      fid = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      docs.forEach(d => { d.mesh.position.y = d.baseY + Math.sin(t*d.speed+d.phase)*d.amp; d.mesh.rotation.z += d.rot; });
      ring1.rotation.z = t*0.07; ring2.rotation.z = -t*0.04;
      renderer.render(scene, camera);
    }
    animate();
    function onResize() { const nW=el.clientWidth,nH=el.clientHeight; camera.aspect=nW/nH; camera.updateProjectionMatrix(); renderer.setSize(nW,nH); }
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(fid); window.removeEventListener("resize",onResize); renderer.dispose(); if (el&&renderer.domElement.parentNode===el) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:0}} />;
}

/* ── DATA ── */
const features = [
  { icon:FileText,      title:"AI-Powered FIR Filing",  desc:"Draft legally structured FIRs in minutes. Our AI understands your situation and generates a proper complaint ready for submission.", color:"text-teal-600",   bg:"bg-teal-50"   },
  { icon:Users,         title:"Verified Lawyer Network", desc:"Connect instantly with licensed, verified advocates in your district. Browse profiles, reviews, and expertise before you choose.",  color:"text-blue-600",   bg:"bg-blue-50"   },
  { icon:MessageSquare, title:"Secure Legal Chat",       desc:"Communicate with your lawyer through end-to-end encrypted messaging. Your conversations remain completely private.",               color:"text-indigo-600", bg:"bg-indigo-50" },
  { icon:Shield,        title:"Case Tracking",           desc:"Monitor the real-time status of your FIR and proceedings. Get notified on every meaningful update automatically.",                 color:"text-green-600",  bg:"bg-green-50"  },
  { icon:Globe,         title:"Multi-Language Support",  desc:"Access justice in your language. Supports Hindi, Marathi, and major regional languages across India.",                             color:"text-orange-500", bg:"bg-orange-50" },
  { icon:Lock,          title:"Evidence Vault",          desc:"Upload and securely store photos, videos, and documents related to your case with tamper-proof cloud storage.",                    color:"text-purple-600", bg:"bg-purple-50" },
];
const steps = [
  { role:"Citizen", color:"bg-teal-600",   list:["Describe your incident in plain language","AI drafts a structured FIR for you","Submit to the nearest police station","Track your case in real time"] },
  { role:"Lawyer",  color:"bg-blue-600",   list:["Create a verified professional profile","Receive case connection requests","Communicate securely with clients","Manage hearings and documents"] },
  { role:"Police",  color:"bg-indigo-600", list:["Receive digitally structured FIRs","Auto-detect jurisdiction and IPC sections","Manage case workflow on one dashboard","Collaborate with legal teams"] },
];
const stats = [
  { value:"50,000+", label:"FIRs Filed" },
  { value:"2,400+",  label:"Verified Lawyers" },
  { value:"98%",     label:"Satisfaction Rate" },
  { value:"28",      label:"States Covered" },
];
const testimonials = [
  { name:"Priya Sharma",     role:"Pune, Maharashtra",          stars:5, text:"I was harassed at work and had no idea how to file a complaint. This platform helped me draft a proper FIR in 10 minutes and connected me to a lawyer the same day." },
  { name:"Adv. Rohit Mehta", role:"Advocate, Delhi High Court", stars:5, text:"As a lawyer, the case management tools are excellent. I can manage client communications, documents, and hearings all from one place." },
  { name:"Insp. Kavita Rao", role:"Maharashtra Police",         stars:5, text:"The structured digital FIR system has reduced our paperwork significantly. IPC section detection alone saves hours every week." },
];
const trust = [
  { icon:Shield, title:"End-to-End Encryption",      desc:"All communications and documents are encrypted. Your data is never shared without your consent." },
  { icon:Scale,  title:"Bar Council Verified",        desc:"Every lawyer on our platform is verified against Bar Council records before being listed." },
  { icon:Lock,   title:"Tamper-Proof Evidence Vault", desc:"Evidence uploaded is timestamped, tamper-proof, and legally admissible in court." },
];

export default function Home() {
  const { user, token } = useSelector((s) => s.auth);
  const { t } = useTranslation();
  const isLoggedIn = !!(token && user);

  return (
    <PublicLayout>

      {/* ══════════════════════════════════════════════
          HERO — full-bleed rich gradient + 3D canvas
          Text centered, bold, white on dark
      ══════════════════════════════════════════════ */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          minHeight: "calc(100vh - 4rem)",
          background: "linear-gradient(135deg, oklch(0.44 0.10 185) 0%, oklch(0.35 0.09 210) 45%, oklch(0.20 0.04 240) 100%)",
        }}
      >
        {/* 3D canvas — full bleed background */}
        <LegalBackground />

        {/* dark vignette so centre text reads cleanly against the docs */}
        <div className="absolute inset-0 pointer-events-none" style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 70% 65% at 50% 50%, oklch(0.20 0.06 210 / 0.65) 0%, transparent 100%)",
        }} />

        {/* bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, transparent, oklch(0.988 0.003 90))",
        }} />

        {/* content */}
        <div className="relative z-10 w-full px-6 lg:px-12 py-28 lg:py-36 text-center flex flex-col items-center">

          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/12 border border-white/25 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <Zap size={13} className="text-teal-300 fill-teal-300/40" />
            {t('home.eyebrow')}
          </div>

          {/* headline */}
          <h1 className="text-[2.8rem] sm:text-[3.5rem] lg:text-[4.5rem] font-bold text-white leading-[1.06] tracking-tight mb-6 max-w-4xl">
            {t('home.heroTitle').split(' ').map((word, i) => {
              if (word.toLowerCase().includes('accessible') || word === 'पहुंच' || word === 'आवाक्यात')
                return <span key={i} className="text-teal-300">{word} </span>;
              return word + ' ';
            })}
          </h1>

          {/* sub */}
          <p className="text-lg lg:text-xl text-white/70 leading-relaxed max-w-xl mb-10">
            {t('home.heroSub')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard"
                  className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-black/25 hover:-translate-y-0.5 text-[0.9375rem]">
                  {t('home.goToDashboard')} <ArrowRight size={16} />
                </Link>
                <Link to={`/${user?.role}/profile`}
                  className="inline-flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 text-[0.9375rem] backdrop-blur-sm">
                  {t('home.viewProfile')} <ChevronRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup"
                  className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/92 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-black/25 hover:-translate-y-0.5 text-[0.9375rem]">
                  {t('home.getStartedFree')} <ArrowRight size={16} />
                </Link>
                <Link to="/login"
                  className="inline-flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 text-[0.9375rem] backdrop-blur-sm">
                  {t('home.signIn')} <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* trust pills */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/55">
            {[t('home.trustPill1'), t('home.trustPill2'), t('home.trustPill3')].map((pill) => (
              <span key={pill} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-teal-300 shrink-0" />{pill}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-slate-100 py-14">
        <div className="w-full px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10">
            {stats.map(({ value, label }, i) => (
              <div key={label} className={`${i > 0 ? "lg:border-l border-slate-100 lg:pl-10" : ""}`}>
                <div className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 tabular-nums mb-1">{value}</div>
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-xl mb-14">
            <p className="text-teal-600 font-semibold text-xs uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="text-3xl lg:text-[2.1rem] font-bold text-slate-900 leading-tight mb-4">Everything you need for legal support</h2>
            <p className="text-slate-500 text-base leading-relaxed">From filing your first complaint to managing a full legal case — our platform handles every step so you never face the system alone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            {features.map(({ icon:Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white hover:bg-slate-50/80 transition-colors duration-200 p-7 flex flex-col gap-4">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-slate-900 mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-slate-50">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-xl mb-14">
            <p className="text-teal-600 font-semibold text-xs uppercase tracking-widest mb-3">Simple Workflow</p>
            <h2 className="text-3xl lg:text-[2.1rem] font-bold text-slate-900 leading-tight mb-3">How it works for you</h2>
            <p className="text-slate-500 text-base">Whether you're a citizen, lawyer, or police officer — the platform is designed to fit your workflow naturally.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {steps.map(({ role, color, list }) => (
              <div key={role} className="bg-white rounded-xl border border-slate-100 p-7">
                <div className={`inline-flex items-center ${color} text-white text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wide`}>{role}</div>
                <ol className="space-y-3.5">
                  {list.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className={`shrink-0 w-5 h-5 ${color} text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5`}>{i+1}</span>
                      <span className="text-slate-600 text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div className="max-w-sm">
              <p className="text-teal-600 font-semibold text-xs uppercase tracking-widest mb-2">Real Experiences</p>
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">Trusted across India</h2>
            </div>
            <p className="text-slate-400 text-sm max-w-[22ch] text-right hidden md:block">From citizens and advocates to police officers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }, i) => (
              <div key={name} className={`p-7 rounded-xl border flex flex-col gap-5 ${i===1 ? "bg-teal-50/60 border-teal-100" : "bg-slate-50/50 border-slate-100"}`}>
                <div className="flex gap-0.5">{Array.from({length:stars}).map((_,j)=><Star key={j} size={13} className="text-amber-400 fill-amber-400"/>)}</div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="pt-3 border-t border-slate-100">
                  <div className="font-semibold text-slate-900 text-sm">{name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-16 border-y border-teal-100 bg-teal-50/40">
        <div className="w-full px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            {trust.map(({ icon:Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-teal-100 shrink-0">
                  <Icon size={20} className="text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — dark gradient matching hero ── */}
      <section
        className="relative py-28 overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.44 0.10 185) 0%, oklch(0.35 0.09 210) 50%, oklch(0.20 0.04 240) 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, oklch(0.55 0.12 185 / 0.3), transparent)" }} />
        <div className="relative z-10 w-full px-6 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-teal-300 font-semibold text-xs uppercase tracking-widest mb-5">Get started today</p>
            <h2 className="text-3xl lg:text-[2.6rem] font-bold text-white leading-tight mb-5">
              Your rights are worth <span className="text-teal-300">fighting for</span>
            </h2>
            <p className="text-lg text-white/65 leading-relaxed mb-9 max-w-lg">
              Join thousands of citizens, lawyers, and police officers making the Indian legal system more accessible, transparent, and efficient.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup"
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/92 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-black/20 hover:-translate-y-0.5">
                Start for Free <ArrowRight size={17} />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-white/12 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/25 hover:border-white/40 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm">
                Sign In <ChevronRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}