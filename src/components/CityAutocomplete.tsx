import React, { useEffect, useMemo, useRef, useState } from 'react'
import { searchCities, type CitySuggestion } from '@/lib/mapbox'

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect?: (city: CitySuggestion) => void
  placeholder?: string
  label?: string
  required?: boolean
  country?: string
  id?: string
  className?: string
}

export const CityAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'City, Country',
  label,
  required,
  country,
  id,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<CitySuggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [lastSelectedValue, setLastSelectedValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced input
  const debouncedValue = useMemo(() => value, [value])

  useEffect(() => {
    let mounted = true
    if (!debouncedValue || debouncedValue.length < 2) {
      setOptions([])
      setOpen(false)
      return
    }
    
    // Only search if the value has changed from the last selected value
    if (debouncedValue === lastSelectedValue) {
      setOpen(false)
      return
    }
    
    setLoading(true)
    searchCities(debouncedValue, { country, limit: 8 })
      .then((res) => { 
        if (mounted) {
          setOptions(res)
          setOpen(true)
        }
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [debouncedValue, country, lastSelectedValue])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else       if (e.key === 'Enter') {
        if (activeIndex >= 0 && options[activeIndex]) {
          const sel = options[activeIndex]
          onChange(sel.placeName)
          onSelect?.(sel)
          setLastSelectedValue(sel.placeName)
          setOpen(false)
        }
      } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required ? ' *' : ''}</label>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && value !== lastSelectedValue && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={open}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      {open && (loading || options.length > 0) && (
        <ul role="listbox" className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
          {loading && (
            <li className="px-4 py-2 text-gray-500">Searching…</li>
          )}
          {!loading && options.map((opt, idx) => (
            <li
              key={opt.id}
              role="option"
              aria-selected={idx === activeIndex}
              className={`px-4 py-2 cursor-pointer ${idx === activeIndex ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.placeName); onSelect?.(opt); setLastSelectedValue(opt.placeName); setOpen(false) }}
            >
              {opt.placeName}
            </li>
          ))}
          {!loading && options.length === 0 && (
            <li className="px-4 py-2 text-gray-500">No results</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default CityAutocomplete

