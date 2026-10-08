export type ShowcaseTheme = {
  /** Slide background. Any CSS background value, gradients included. */
  background: string;
  /** Giant wordmark color. */
  wordmark: string;
  /** Band behind the tags. */
  stripe: string;
  /** Tag text inside the band. */
  stripeText: string;
  /** Header, product name, buttons and nav. */
  foreground: string;
  /** Text on white surfaces, e.g. the active nav pill. */
  accent: string;
};

export type Product = {
  id: string;
  /** Short label for the bottom pill nav, e.g. "ZUZU VOLT". */
  navLabel: string;
  /** Headline next to the product, e.g. "VOLT BLUE RASPBERRY". */
  name: string;
  /** Short claims shown in the band, e.g. ["ZERO SUGAR", "ZERO CALORIES"]. */
  tags: string[];
  /** Transparent product render. Portrait, roughly 2:5 for a slim can. */
  image: { src: string; width: number; height: number; alt: string };
  theme: ShowcaseTheme;
};
