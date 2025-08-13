import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[color:Canvas] text-[color:CanvasText]">
        <div className="mx-auto max-w-[1400px]">
          {children}
        </div>
      </body>
    </html>
  );
}