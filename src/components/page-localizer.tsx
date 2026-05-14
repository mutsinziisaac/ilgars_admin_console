import { useEffect, useMemo, useRef } from "react"
import type { ReactNode } from "react"
import { useI18n } from "@/lib/i18n"
import pt from "@/locales/pt.json"

interface PageLocalizerProps {
  children: ReactNode
}

const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title"] as const

type OriginalAttributes = Partial<Record<(typeof TRANSLATABLE_ATTRIBUTES)[number], string>>

const shouldSkipTextNode = (node: Text) => {
  const parent = node.parentElement
  if (!parent) return true

  return Boolean(parent.closest("script, style, code, pre, textarea, [data-no-localize]"))
}

const preserveCase = (source: string, translated: string) => {
  if (source.toUpperCase() === source) return translated.toUpperCase()
  return translated
}

const translatePhrase = (value: string, phrases: Record<string, string>) => {
  const trimmed = value.trim()
  if (!trimmed) return value

  const direct = phrases[trimmed]
  if (direct) {
    return value.replace(trimmed, preserveCase(trimmed, direct))
  }

  return Object.entries(phrases).reduce((current, [english, portuguese]) => {
    if (!current.includes(english)) return current
    return current.replaceAll(english, preserveCase(english, portuguese))
  }, value)
}

export function PageLocalizer({ children }: PageLocalizerProps) {
  const { locale } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const textOriginals = useRef(new WeakMap<Text, string>())
  const attributeOriginals = useRef(new WeakMap<Element, OriginalAttributes>())
  const phrases = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pt.phrases).sort(([left], [right]) => right.length - left.length),
      ) as Record<string, string>,
    [],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const translateTextNode = (node: Text) => {
      if (shouldSkipTextNode(node)) return

      const existingOriginal = textOriginals.current.get(node)
      const original = existingOriginal ?? node.nodeValue ?? ""
      if (!existingOriginal) {
        textOriginals.current.set(node, original)
      }

      node.nodeValue = locale === "pt" ? translatePhrase(original, phrases) : original
    }

    const translateElementAttributes = (element: Element) => {
      TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        const value = element.getAttribute(attribute)
        if (!value) return

        const originals = attributeOriginals.current.get(element) ?? {}
        const original = originals[attribute] ?? value
        if (!originals[attribute]) {
          attributeOriginals.current.set(element, { ...originals, [attribute]: original })
        }

        element.setAttribute(attribute, locale === "pt" ? translatePhrase(original, phrases) : original)
      })
    }

    const translateTree = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        translateTextNode(node as Text)
        node = walker.nextNode()
      }

      if (root instanceof Element) {
        translateElementAttributes(root)
      }
      root.querySelectorAll?.("*").forEach(translateElementAttributes)
    }

    translateTree(container)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Text) {
            translateTextNode(node)
          } else if (node instanceof Element) {
            translateTree(node)
          }
        })
      })
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [locale, phrases])

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  )
}
