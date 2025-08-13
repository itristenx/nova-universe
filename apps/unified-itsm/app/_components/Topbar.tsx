export function Topbar({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-[color:Canvas]/70 border-b border-[color:Separator]">
      <div className="px-4 py-3 flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{title ?? 'Unified ITSM'}</h1>
        <div className="ml-auto">
          {/* search/action slot */}
        </div>
      </div>
    </header>
  );
}