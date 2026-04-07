import { I18n } from 'i18n-js';

import en from './en';
import hi from './hi';
import ne from './ne';

const i18n = new I18n({
  en,
  hi,
  ne,
});

i18n.enableFallback = true;
i18n.locale = 'en';

export default i18n;