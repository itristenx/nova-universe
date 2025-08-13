import Link from 'next/link';

export default function ShellHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}