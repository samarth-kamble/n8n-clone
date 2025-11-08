import Image from "next/image";
import Link from "next/link";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    // ✅ Add dark:bg-background so page background switches properly
    <div className="relative flex min-h-screen bg-background dark:bg-background">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary dark:bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/90 via-primary to-accent/50"></div>
        <div className="absolute inset-0 bg-foreground/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaDMwdjJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white dark:text-white">
          <div className="max-w-md space-y-6">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/20 overflow-hidden">
                <Image
                  src="/logos/logo.svg"
                  alt="Nodebase Logo"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
              </div>
              <h1 className="text-3xl font-bold text-primary-foreground">
                Nodebase
              </h1>
            </div>

            <h2 className="text-4xl font-bold leading-tight text-primary-foreground">
              Automate workflows. Connect apps. Build faster.
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Nodebase lets you visually create automations between your apps
              and APIs — no code required.
            </p>

            <div className="flex gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold text-primary-foreground">
                  10k+
                </div>
                <div className="text-sm text-primary-foreground/70">
                  Workflows Created
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-foreground">
                  200+
                </div>
                <div className="text-sm text-primary-foreground/70">
                  Integrations
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-foreground">
                  99.99%
                </div>
                <div className="text-sm text-primary-foreground/70">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM SIDE */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 bg-background dark:bg-background">
        <div className="w-full max-w-md space-y-8">
          <Link
            href="/"
            className="flex items-center gap-3 justify-center group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
              <Image
                src="/logos/logo.svg"
                alt="Nodebase Logo"
                width={40}
                height={40}
                className="rounded-md"
              />
            </div>

            {/* ✅ Make brand text theme-aware */}
            <span className="text-2xl font-bold text-foreground dark:text-foreground">
              Nodebase
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
