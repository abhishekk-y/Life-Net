import { createElement } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, Building2, Check, ClipboardCheck,
  Droplets, Heart, Moon, ShieldCheck, Sun, TimerReset, Stethoscope, Pill,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../ThemeProvider';

const capabilities = [
  {
    icon: Droplets,
    title: 'Blood inventory',
    description: 'Track blood group, component, storage temperature, quantity, and expiry date at each participating bank.',
    number: '01',
  },
  {
    icon: Heart,
    title: 'Organ registry',
    description: 'Record availability and viability windows so clinical teams can review potentially relevant listings.',
    number: '02',
  },
  {
    icon: ClipboardCheck,
    title: 'Request coordination',
    description: 'Keep requests, resource matches, approvals, transfers, and completion status in one auditable record.',
    number: '03',
  },
  {
    icon: Building2,
    title: 'Reviewed care network',
    description: 'Review center applications before accounts can access operational inventory and request workflows.',
    number: '04',
  },
  {
    icon: Stethoscope,
    title: 'Doctor appointments',
    description: 'Patients can browse clinician profiles approved for LifeNet and request an available in-person appointment time.',
    number: '05',
  },
  {
    icon: Pill,
    title: 'Pharmacy prices',
    description: 'Compare same-product listings from pharmacies approved for LifeNet and send a pickup request.',
    number: '06',
  },
];

const workflow = [
  ['Join', 'Patients sign up directly; providers submit their credentials.'],
  ['Verify', 'An administrator reviews each healthcare provider account.'],
  ['Connect', 'Patients find providers while centers coordinate resources.'],
  ['Follow through', 'Appointments, pickup orders, and resource requests show their status.'],
];

export function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f8f5] text-[#172a2b] dark:bg-gray-950 dark:text-gray-100">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-[#dce5df] bg-[#f7f8f5]/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90">
        <nav aria-label="Main navigation" className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#143b3a] text-white"><Heart size={19} fill="currentColor" /></span>
            <span>
              <span className="block text-base font-semibold tracking-tight">LifeNet</span>
              <span className="block text-[0.68rem] tracking-wide text-[#5c706d] dark:text-gray-400">CARE NETWORK</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#capabilities" className="text-sm font-medium text-[#536765] transition hover:text-[#143b3a] dark:text-gray-300 dark:hover:text-white">Capabilities</a>
            <a href="#workflow" className="text-sm font-medium text-[#536765] transition hover:text-[#143b3a] dark:text-gray-300 dark:hover:text-white">How access works</a>
            <a href="#principles" className="text-sm font-medium text-[#536765] transition hover:text-[#143b3a] dark:text-gray-300 dark:hover:text-white">Care principles</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#536765] transition hover:bg-[#eaf0eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login">
              <Button className="h-10 rounded-xl bg-[#143b3a] px-4 text-sm text-white hover:bg-[#1d514e]">
                Sign in <ArrowRight size={15} className="ml-2" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className="relative border-b border-[#dce5df] dark:border-gray-800">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-28">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c8d9d1] bg-white/75 px-3.5 py-2 text-xs font-semibold text-[#315b53] shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-[#548e73]" />
                Patient services and approved provider tools
              </div>
              <h1 className="max-w-[12ch] text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">
                One network for everyday care and critical coordination.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#5b6d69] dark:text-gray-300 sm:text-lg sm:leading-8">
                LifeNet connects patient access to approved doctors and pharmacies with the inventory and request tools care organizations use to coordinate blood and organ resources.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/register">
                  <Button className="h-12 w-full rounded-xl bg-[#143b3a] px-6 text-white hover:bg-[#1d514e] sm:w-auto">
                    Create an account <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <a href="#capabilities">
                  <Button variant="outline" className="h-12 w-full rounded-xl border-[#cbd8d2] bg-transparent px-6 text-[#284642] hover:bg-[#edf2ef] dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto">
                    Explore capabilities <ArrowDownRight size={16} className="ml-2" />
                  </Button>
                </a>
              </div>
              <p className="mt-5 text-xs leading-5 text-[#788985] dark:text-gray-500">Email verification activates patient accounts. Provider accounts also require administrator review.</p>
            </div>

            <div className="relative mx-auto w-full max-w-[34rem] lg:ml-auto">
              <div aria-hidden="true" className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[#dbe9df] blur-2xl dark:bg-teal-950/50" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[#cfddd5] bg-[#e8efea] p-4 shadow-[0_28px_80px_-50px_rgba(25,67,56,.5)] dark:border-gray-700 dark:bg-gray-900 sm:p-6">
                <div className="flex items-center justify-between border-b border-[#d0ddd5] pb-4 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#678078] dark:text-gray-400">Request pathway</p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">A shared operational view</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#315e50] shadow-sm dark:bg-gray-800 dark:text-emerald-200"><ClipboardCheck size={18} /></span>
                </div>

                <div className="mt-5 rounded-2xl border border-[#d4e0d8] bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9e8e6] text-[#a94a45]"><Droplets size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Resource request</p>
                      <p className="mt-0.5 text-xs text-[#788985] dark:text-gray-400">Status and responsible center stay visible</p>
                    </div>
                    <span className="rounded-md bg-[#f5f0df] px-2 py-1 text-[0.65rem] font-semibold text-[#79652f]">TRACKED</span>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    {['Request', 'Match', 'Approve', 'Resolve'].map((step, index) => (
                      <div key={step} className="relative">
                        <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? 'bg-[#1f5a50] text-white' : 'bg-[#edf2ef] text-[#778983] dark:bg-gray-800 dark:text-gray-400'}`}>
                          {index === 0 ? <Check size={14} /> : index + 1}
                        </div>
                        <p className="mt-2 text-center text-[0.65rem] font-medium text-[#647670] dark:text-gray-400">{step}</p>
                        {index < 3 && <span aria-hidden="true" className="absolute left-[calc(50%+1rem)] top-3.5 h-px w-[calc(100%-1rem)] bg-[#d7e1db] dark:bg-gray-700" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#153d3b] p-4 text-white">
                    <TimerReset size={18} className="text-emerald-200" />
                    <p className="mt-4 text-sm font-semibold">Time-sensitive listings</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-50/70">Expiry and viability details remain part of the record.</p>
                  </div>
                  <div className="rounded-2xl border border-[#d4e0d8] bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                    <ShieldCheck size={18} className="text-[#477b64] dark:text-emerald-300" />
                    <p className="mt-4 text-sm font-semibold">Provider review</p>
                    <p className="mt-1 text-xs leading-5 text-[#788985] dark:text-gray-400">Center applications require review before use.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div className="max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#487665] dark:text-emerald-300">Built around coordination</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Connected services for patients and care teams.</h2>
              <p className="mt-4 text-sm leading-7 text-[#62736f] dark:text-gray-400">A role-based workspace joins appointment access, pharmacy listings, inventory updates, and the requests that depend on them.</p>
            </div>
            <div className="grid gap-x-10 sm:grid-cols-2">
              {capabilities.map(({ icon, title, description, number }) => (
                <article key={number} className="border-t border-[#d5e0d9] py-6 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f0e9] text-[#386e59] dark:bg-emerald-950/60 dark:text-emerald-200">{createElement(icon, { size: 18 })}</span>
                    <span className="font-mono text-xs text-[#92a19b]">{number}</span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#687a75] dark:text-gray-400">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24 border-y border-[#d5e0d9] bg-[#edf2ee] dark:border-gray-800 dark:bg-gray-900/60">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#487665] dark:text-emerald-300">How access works</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">A clear path from application to resolution.</h2>
            </div>
            <ol className="mt-12 grid gap-0 border-t border-[#cddbd2] sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-700">
              {workflow.map(([title, description], index) => (
                <li key={title} className="border-b border-[#cddbd2] py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 lg:py-8 dark:border-gray-700">
                  <span className="font-mono text-xs text-[#6b8b7d]">0{index + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#657771] dark:text-gray-400">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="principles" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#487665] dark:text-emerald-300">Care principles</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Useful information, with the right limits.</h2>
          </div>
          <div className="space-y-4 text-sm leading-6 text-[#62736f] dark:text-gray-400">
            <p>Inventory reflects what participating centers report and may change. A center must confirm current availability, suitability, and transfer details.</p>
            <p>LifeNet supports coordination and record keeping. It does not replace medical judgment, determine transplant eligibility, or promise emergency response.</p>
            <p>Reported stock and availability can change. Clinicians, pharmacists, and authorized transplant teams confirm suitability and make all care and allocation decisions.</p>
          </div>
        </section>

        <footer className="border-t border-[#d5e0d9] dark:border-gray-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-xs text-[#71827c] dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold text-[#31584e] dark:text-gray-300"><Heart size={15} /> LifeNet</Link>
            <p>For healthcare organizations approved for LifeNet. For emergencies, contact local emergency services.</p>
            <div className="flex gap-5 text-sm">
              <Link to="/login" className="hover:text-[#143b3a] dark:hover:text-white">Sign in</Link>
              <Link to="/register" className="hover:text-[#143b3a] dark:hover:text-white">Request access</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
