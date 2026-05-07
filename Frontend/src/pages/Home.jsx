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

/* ─────────────────────────────────────────
   3-D BACKGROUND – floating legal documents
───────────────────────────────────────────*/
function LegalBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 14;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const d1 = new THREE.DirectionalLight(0x4f9cf9, 1.2);
    d1.position.set(5, 8, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x01696f, 0.8);
    d2.position.set(-5, -3, 3);
    scene.add(d2);

    function docShape(w, h, r) {
      const s = new THREE.Shape();
      s.moveTo(-w/2+r,-h/2); s.lineTo(w/2-r,-h/2);
      s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      s.lineTo(w/2,h/2-r);
      s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
      s.lineTo(-w/2+r,h/2);
      s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
      s.lineTo(-w/2,-h/2+r);
      s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      return s;
    }

    function addLine(parent, y, w, color, opacity) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, 0.06),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
      );
      m.position.set(0, y, 0.02);
      parent.add(m);
    }

    const COLS = [
      { face:0xffffff, l1:0x01696f, l2:0x4f9cf9 },
      { face:0xf0f9ff, l1:0x1e40af, l2:0x6366f1 },
      { face:0xfafff8, l1:0x166534, l2:0x01696f },
    ];
    const docs = [];

    for (let i = 0; i < 14; i++) {
      const c = COLS[i % 3];
      const w = 0.9 + Math.random() * 0.5;
      const h = 1.2 + Math.random() * 0.5;
      const doc = new THREE.Mesh(
        new THREE.ExtrudeGeometry(docShape(w,h,0.08),{depth:0.04,bevelEnabled:false}),
        new THREE.MeshPhongMaterial({ color:c.face, transparent:true, opacity:0.82, shininess:60 })
      );
      const cs = i%3===0 ? 0.18 : 0;
      if (cs) {
        const cShape = new THREE.Shape();
        cShape.moveTo(0,0); cShape.lineTo(cs,0); cShape.lineTo(0,-cs); cShape.closePath();
        const corner = new THREE.Mesh(
          new THREE.ExtrudeGeometry(cShape,{depth:0.045,bevelEnabled:false}),
          new THREE.MeshPhongMaterial({ color:c.l1, transparent:true, opacity:0.5 })
        );
        corner.position.set(w/2-cs, h/2-0.005, 0);
        doc.add(corner);
      }
      addLine(doc, h/2-0.22, w*0.55, c.l1, 0.9);
      addLine(doc, h/2-0.38, w*0.70, c.l2, 0.5);
      addLine(doc, h/2-0.54, w*0.65, c.l2, 0.4);
      addLine(doc, h/2-0.70, w*0.60, c.l2, 0.35);
      if (h>1.5) addLine(doc, h/2-0.86, w*0.50, c.l2, 0.3);

      doc.position.set(
        (Math.random()-0.5)*16,
        (Math.random()-0.5)*10,
        (Math.random()-0.5)*6-2
      );
      doc.rotation.z = (Math.random()-0.5)*0.5;
      doc.rotation.x = (Math.random()-0.5)*0.3;
      docs.push({
        mesh:doc, speed:0.3+Math.random()*0.4, amp:0.3+Math.random()*0.3,
        rot:(Math.random()-0.5)*0.004, phase:Math.random()*Math.PI*2, baseY:doc.position.y
      });
      scene.add(doc);
    }

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.1,0.06,16,60),
      new THREE.MeshPhongMaterial({ color:0x01696f, transparent:true, opacity:0.07 })
    );
    ring1.position.set(3,0,-4); scene.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.8,0.04,16,60),
      new THREE.MeshPhongMaterial({ color:0x4f9cf9, transparent:true, opacity:0.05 })
    );
    ring2.position.set(3,0,-4); ring2.rotation.x=0.4; scene.add(ring2);

    const clock = new THREE.Clock();
    let fid;
    function animate() {
      fid = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      docs.forEach(d => {
        d.mesh.position.y = d.baseY + Math.sin(t*d.speed+d.phase)*d.amp;
        d.mesh.rotation.z += d.rot;
      });
      ring1.rotation.z = t*0.08;
      ring2.rotation.z = -t*0.05;
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const nW = el.clientWidth, nH = el.clientHeight;
      camera.aspect = nW/nH; camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(fid);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ── DATA ── */
const features = [
  { icon:FileText,     title:"AI-Powered FIR Filing",    desc:"Draft legally structured FIRs in minutes. Our AI understands your situation and generates a proper complaint ready for submission.",  color:"text-teal-600",   bg:"bg-teal-50"   },
  { icon:Users,        title:"Verified Lawyer Network",   desc:"Connect instantly with licensed, verified advocates in your district. Browse profiles, reviews, and expertise before you choose.",  color:"text-blue-600",   bg:"bg-blue-50"   },
  { icon:MessageSquare,title:"Secure Legal Chat",         desc:"Communicate with your lawyer through end-to-end encrypted messaging. Your conversations remain completely private.",                color:"text-indigo-600", bg:"bg-indigo-50" },
  { icon:Shield,       title:"Case Tracking",             desc:"Monitor the real-time status of your FIR and proceedings. Get notified on every meaningful update automatically.",                 color:"text-green-600",  bg:"bg-green-50"  },
  { icon:Globe,        title:"Multi-Language Support",    desc:"Access justice in your language. Supports Hindi, Marathi, and major regional languages across India.",                             color:"text-orange-500", bg:"bg-orange-50" },
  { icon:Lock,         title:"Evidence Vault",            desc:"Upload and securely store photos, videos, and documents related to your case with tamper-proof cloud storage.",                    color:"text-purple-600", bg:"bg-purple-50" },
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

/* ── PAGE ── */
export default function Home() {
  const { user, token } = useSelector((s) => s.auth)
  const { t } = useTranslation()
  const isLoggedIn = !!(token && user)

  return (
    <PublicLayout>

      {/* ── HERO
          Uses calc(100vh - 4rem) so it fills the viewport
          minus the sticky navbar height (h-16 = 4rem).
          No footer here — PublicLayout renders it. ── */}
      <section
        className="relative flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/40"
        style={{ minHeight: "calc(100vh - 4rem)" }}
      >
        <LegalBackground />

        {/* subtle dot-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            backgroundImage:
              "linear-gradient(rgba(1,105,111,0.03) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(1,105,111,0.03) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 w-full px-6 lg:px-12 py-24 lg:py-32">
          <div className="max-w-3xl">

            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
              <Zap size={14} className="text-teal-500" />
              {t('home.eyebrow')}
            </div>

            {/* headline */}
            <h1 className="text-5xl lg:text-[4.25rem] font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              {t('home.heroTitle').split(' ').map((word, i, arr) => {
                // Just a heuristic: make the middle word teal, or "accessible" in English
                if (word.toLowerCase().includes('accessible') || word === 'पहुंच' || word === 'आवाक्यात') {
                  return <span key={i} className="text-teal-600">{word} </span>
                }
                return word + ' '
              })}
            </h1>

            {/* sub */}
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl mb-10">
              {t('home.heroSub')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-14">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-600/20 hover:-translate-y-0.5"
                  >
                    {t('home.goToDashboard')} <ArrowRight size={17} />
                  </Link>
                  <Link
                    to={`/${user?.role}/profile`}
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {t('home.viewProfile')} <ChevronRight size={17} />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-teal-600/20 hover:-translate-y-0.5"
                  >
                    {t('home.getStartedFree')} <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {t('home.signIn')} <ChevronRight size={17} />
                  </Link>
                </>
              )}
            </div>

            {/* trust pills */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              {[
                t('home.trustPill1'),
                t('home.trustPill2'),
                t('home.trustPill3'),
              ].map((pillText) => (
                <span key={pillText} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-teal-500" />
                  {pillText}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-teal-600 py-16">
        <div className="w-full px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl lg:text-5xl font-bold mb-1">{value}</div>
              <div className="text-teal-100 text-sm font-medium uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">Everything you need for legal support</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              From filing your first complaint to managing a full legal case —
              our platform handles every step so you never face the system alone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon:Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="group p-8 rounded-2xl border border-slate-100 hover:shadow-lg hover:shadow-slate-100/80 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 bg-slate-50">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Simple Workflow</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-4">How it works for you</h2>
            <p className="text-slate-500 text-lg">
              Whether you're a citizen, lawyer, or police officer — the platform
              is designed to fit your workflow naturally.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {steps.map(({ role, color, list }) => (
              <div key={role} className="bg-white rounded-2xl border border-slate-100 p-8">
                <div className={`inline-flex items-center ${color} text-white text-sm font-semibold px-3.5 py-1 rounded-full mb-7`}>
                  {role}
                </div>
                <ol className="space-y-4">
                  {list.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 ${color} text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5`}>
                        {i + 1}
                      </span>
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
      <section className="py-28 bg-white">
        <div className="w-full px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Real Experiences</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Trusted across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="p-8 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col gap-5">
                <div className="flex gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">"{text}"</p>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-20 bg-teal-50 border-y border-teal-100">
        <div className="w-full px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {trust.map(({ icon:Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-teal-100">
                <Icon size={24} className="text-teal-600" />
              </div>
              <h4 className="font-semibold text-slate-900">{title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
            Your rights are worth{" "}
            <span className="text-teal-600">fighting for</span>
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed mb-10">
            Join thousands of citizens, lawyers, and police officers making the
            Indian legal system more accessible, transparent, and efficient.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-teal-600/20 hover:-translate-y-0.5 text-lg"
            >
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 text-lg"
            >
              Sign In <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}