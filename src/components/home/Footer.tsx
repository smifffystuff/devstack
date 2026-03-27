import Link from "next/link";

const LINKS = [
  {
    heading: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/20 px-4 sm:px-6 pt-12 pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 mb-10">
          {/* Brand */}
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-3">
              <svg
                className="w-5 h-5 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h10" />
                <circle cx="19" cy="17" r="3" />
              </svg>
              DevStash
            </Link>
            <p className="text-sm text-muted-foreground">Store Smarter. Build Faster.</p>
          </div>

          {/* Link columns */}
          <div className="flex gap-10 sm:gap-16">
            {LINKS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.heading}
                </h4>
                {col.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {year} DevStash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
