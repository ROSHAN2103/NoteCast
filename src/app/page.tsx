import {ThemeToggle} from '@/components/theme-toggle';
import {VerbalizeForm} from '@/components/VerbalizeForm';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
        <header className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </header>
        <div className="w-full max-w-3xl">
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-bold text-center mb-2 text-foreground">
            VerbalizeAI
          </h1>
          <p className="text-center text-lg text-muted-foreground mb-10">
            Turn your text into professional audio with AI.
          </p>
          <VerbalizeForm />
        </div>
        <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
          <p>Built with vibe and code.</p>
        </footer>
      </main>
    </div>
  );
}
