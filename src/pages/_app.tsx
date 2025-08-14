import type { AppProps } from 'next/app';
// Import global styles (Tailwind directives + custom globals)
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
