export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[color:Canvas] text-[color:CanvasText]">
        {children}
      </body>
    </html>
  );
}