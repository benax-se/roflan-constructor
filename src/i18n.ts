import { createI18n } from 'vue-i18n'

import ru from '@/translations/ru'
import en from '@/translations/en'

const messages = { ru, en }

const getLocale = () => {
    const language = navigator.language.toLowerCase()
    const locales = Object.keys(messages)
    for (const locale of locales) {
        if (language.includes(locale)) {
            return locale
        }
    }
    return 'ru'
}

export const i18n = createI18n({
    legacy: false,
    locale: getLocale(),
    fallbackLocale: 'en',
    messages
})
