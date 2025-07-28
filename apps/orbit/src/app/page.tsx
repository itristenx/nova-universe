"use client";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-3xl mx-auto">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl font-bold mb-2">Welcome to Nova Orbit</h1>
        <p className="mb-6 text-muted-foreground">
          Your unified portal for IT support, knowledge, and service status.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/tickets"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">My Tickets</div>
            <div className="text-sm text-muted-foreground">
              View and manage your support tickets.
            </div>
          </Link>
          <Link
            href="/tickets/new"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">Submit Ticket</div>
            <div className="text-sm text-muted-foreground">
              Request help or report an issue.
            </div>
          </Link>
          <Link
            href="/catalog"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">Request Catalog</div>
            <div className="text-sm text-muted-foreground">
              Browse and request services or access.
            </div>
          </Link>
          <Link
            href="/knowledge"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">Knowledge Base</div>
            <div className="text-sm text-muted-foreground">
              Find answers and how-to guides.
            </div>
          </Link>
          <Link
            href="/status"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">Service Status</div>
            <div className="text-sm text-muted-foreground">
              Check real-time system health.
            </div>
          </Link>
          <Link
            href="/cosmo"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">Cosmo Assistant</div>
            <div className="text-sm text-muted-foreground">
              Chat with the AI assistant.
            </div>
          </Link>
          <Link
            href="/profile"
            className="block p-6 border rounded bg-muted hover:bg-accent transition"
          >
            <div className="font-semibold text-lg mb-1">Profile</div>
            <div className="text-sm text-muted-foreground">
              View and edit your profile.
            </div>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
