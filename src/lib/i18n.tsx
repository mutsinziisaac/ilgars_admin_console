import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import en from "@/locales/en.json"
import pt from "@/locales/pt.json"

export type Locale = "en" | "pt"

type Messages = typeof en
type TranslationKey = keyof Messages | `${keyof Messages & string}.${string}`

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const STORAGE_KEY = "ilgars.locale"
const dictionaries: Record<Locale, Messages> = { en, pt }

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const isLocale = (value: string | null | undefined): value is Locale =>
  value === "en" || value === "pt"

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") return "en"

  const savedLocale = window.localStorage.getItem(STORAGE_KEY)
  if (isLocale(savedLocale)) return savedLocale

  const browserLocale = window.navigator.language.toLowerCase()
  return browserLocale.startsWith("pt") ? "pt" : "en"
}

const lookup = (messages: Messages, key: string): string | undefined => {
  const value = key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (!current || typeof current !== "object") return undefined
      return (current as Record<string, unknown>)[segment]
    }, messages)

  return typeof value === "string" ? value : undefined
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale())

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  const t = useCallback(
    (key: TranslationKey) =>
      lookup(dictionaries[locale], key) ?? lookup(dictionaries.en, key) ?? key,
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }

  return context
}
