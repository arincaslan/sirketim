const PROJECTS = [
  { name: "Northgate Coffee", category: "Brand + Web" },
  { name: "Ferrous Studio", category: "Identity" },
  { name: "Lumen Health", category: "Product Design" },
  { name: "Basecamp Realty", category: "Web Design" },
];

export function Work() {
  return (
    <section id="work" className="border-t border-border py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Selected work
          </h2>
          <p className="mt-4 text-muted-foreground">
            Swap these tiles for real case studies and project thumbnails —
            grid holds 4, 6, or 8 items cleanly.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {PROJECTS.map((project) => (
            <div
              key={project.name}
              className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary"
            >
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-foreground/70 via-foreground/0 to-foreground/0 p-6 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-medium text-background">
                  {project.category}
                </p>
                <p className="text-lg font-semibold text-background">
                  {project.name}
                </p>
              </div>
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {project.name} — image placeholder
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
