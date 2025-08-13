import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-8">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Unified ITSM</h1>
        <div className="ml-auto text-sm">
          <Link href="/(shell)/login" className="rounded px-3 py-1.5 border">Sign in</Link>
        </div>
      </div>
      <p className="mt-2 text-sm opacity-80">Core, Pulse, and Orbit in one app. Apple-inspired UI.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {[
          { href: '/admin', title: 'Admin (Core)', desc: 'System health, users, CMDB, integrations' },
          { href: '/technician', title: 'Technician (Pulse)', desc: 'My work, workflows, inventory' },
          { href: '/portal', title: 'End-User (Orbit)', desc: 'Service catalog, tickets, knowledge' },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border p-4 hover:bg-[color:ButtonFace]/10">
            <div className="text-lg font-semibold">{c.title}</div>
            <div className="opacity-70 text-sm mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}