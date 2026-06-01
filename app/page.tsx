import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center bg-background text-foreground px-6">
      <section className="text-center max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Build Your SaaS{" "}
            <span className="text-primary">Faster</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            A modern foundation with Next.js 16, TypeScript, Tailwind CSS, and
            shadcn/ui — everything you need to ship your next big idea.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8">
            View on GitHub
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Free to use · Open source · Deploy in seconds
        </p>
      </section>
    </main>
  );
}
