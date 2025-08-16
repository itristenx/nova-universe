export const useTranslations = () => (key: string) => key;
export const useFormatter = () => ({}) as any;
export const useLocale = () => 'en';
export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) =>
  children as any;
