/** Mission statement and the project's funding and privacy pledge. */
export function Mission({ name, country }: { name: string; country: string }) {
  return (
    <section
      aria-labelledby="mission-heading"
      className="mt-10 rounded-lg border border-border bg-surface-alt p-6"
    >
      <h2 id="mission-heading" className="text-lg font-semibold">
        Mission
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        {name} exists to make the work of organisations in {country} using technology for public
        good easier to find, check, and support. It is volunteer-run and built in the open, so
        anyone can find prior art before starting something new.
      </p>
      <p className="mt-3 text-sm font-medium">Volunteer-run. No ads or tracking. Not monetised.</p>
    </section>
  );
}
