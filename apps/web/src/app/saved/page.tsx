import Link from "next/link";
import { Star } from "lucide-react";

export default function SavedPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
        <Star className="h-7 w-7 text-brand" /> Saved entries
      </h1>
      <p className="mt-2 text-text-muted">
        Your bookmarked organisations. Saved in your browser.
      </p>
      <div id="saved-root" className="mt-6" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var slugs = JSON.parse(localStorage.getItem("saved-entries") || "[]");
            } catch(e) { var slugs = []; }
            var root = document.getElementById("saved-root");
            if (slugs.length === 0) {
              root.innerHTML = '<p class="text-text-muted">No saved entries yet. Browse the <a href="/directory" class="text-brand hover:underline">directory</a> to find organisations to bookmark.</p>';
            } else {
              root.innerHTML = '<p class="text-sm text-text-muted mb-3">' + slugs.length + ' saved ' + (slugs.length === 1 ? 'entry' : 'entries') + '.</p><ul class="space-y-2">' +
                slugs.map(function(s) {
                  return '<li><a href="/entry/' + s + '/" class="block rounded-lg border border-border p-3 font-semibold hover:text-brand">' + s.replace(/-/g, ' ') + '</a></li>';
                }).join('') +
                '</ul><button onclick="localStorage.removeItem(\\'saved-entries\\');location.reload()" class="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-alt">Clear all saved</button>';
            }
          `,
        }}
      />
    </main>
  );
}
