import { GitBranch, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Get in touch</h1>
      <p className="mt-2 text-lg text-text-muted">
        This directory is open source and built for public benefit. The best way to reach us is on
        GitHub. No email address to guess.
      </p>

      <div className="mt-6 space-y-3">
        <a
          href="https://github.com/olitreadwell/nz-tech-for-good/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-surface-alt"
        >
          <MessageSquare className="h-5 w-5 flex-shrink-0 text-brand" />
          <div>
            <div className="font-semibold">Open a GitHub issue</div>
            <p className="text-sm text-text-muted">
              Suggest an entry, report a problem, or ask a question.
            </p>
          </div>
        </a>
        <a
          href="https://github.com/olitreadwell/nz-tech-for-good"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-surface-alt"
        >
          <GitBranch className="h-5 w-5 flex-shrink-0 text-brand" />
          <div>
            <div className="font-semibold">View the repo</div>
            <p className="text-sm text-text-muted">Browse the code, data, and contributor guide.</p>
          </div>
        </a>
      </div>
    </main>
  );
}
