export type HomeHeroStripProps = {
  heroTitle: string;
  heroTagline: string;
};

export function HomeHeroStrip({ heroTitle, heroTagline }: HomeHeroStripProps) {
  return (
    <section
      className="relative border-b border-hairline dark:border-white/15"
      aria-labelledby="home-hero-heading"
    >
      <div className="relative z-10 mx-auto w-full max-w-content px-base py-lg md:px-lg md:py-xl xl:px-xl">
        <h1
          id="home-hero-heading"
          className="font-display text-display-md font-medium tracking-tight text-ink dark:text-white"
        >
          {heroTitle}
        </h1>
        <p className="mt-sm max-w-2xl font-sans text-title-sm font-medium text-body-color dark:text-zinc-300">
          {heroTagline}
        </p>
      </div>
    </section>
  );
}
