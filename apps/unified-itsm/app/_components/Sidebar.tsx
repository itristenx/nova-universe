import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/admin', label: 'Admin' },
  { href: '/technician', label: 'Technician' },
  { href: '/portal', label: 'End-User' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 border-r border-[color:Separator] bg-[color:Canvas] bg-clip-padding backdrop-blur supports-[backdrop-filter]:bg-[color:Canvas]/80">
      <nav className="p-4 w-full">
        <div className="mb-4 text-sm font-semibold opacity-70">Unified ITSM</div>
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link className="block rounded px-3 py-2 hover:bg-[color:ButtonFace]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:LinkText]" href={l.href}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}