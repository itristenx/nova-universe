import './globals.css';
import './animations.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[color:Canvas] text-[color:CanvasText] motion-base animate-fade-in">
        <div className="mx-auto max-w-[1400px] glass animate-slide-up">
          {children}
        </div>
      </body>
    </html>
  );
}