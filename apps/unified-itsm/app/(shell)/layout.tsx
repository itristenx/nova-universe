import { Sidebar } from '../_components/Sidebar';
import { Topbar } from '../_components/Topbar';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-4 mx-auto w-full max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}