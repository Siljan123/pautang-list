import { ref, watch, onMounted } from 'vue'

export type Mode = 'light' | 'dark' | 'system'

export interface ColorPreset {
  id: string
  name: string
  primaryOklchLight: string
  primaryFgLight: string
  primaryOklchDark: string
  primaryFgDark: string
  badgeColor: string
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'neutral',
    name: 'Neutral',
    primaryOklchLight: 'oklch(0.205 0 0)',
    primaryFgLight: 'oklch(0.985 0 0)',
    primaryOklchDark: 'oklch(0.922 0 0)',
    primaryFgDark: 'oklch(0.205 0 0)',
    badgeColor: '#18181b'
  },
  {
    id: 'emerald',
    name: 'Emerald (Pautang)',
    primaryOklchLight: 'oklch(0.6 0.17 160)',
    primaryFgLight: 'oklch(0.985 0 0)',
    primaryOklchDark: 'oklch(0.696 0.17 162)',
    primaryFgDark: 'oklch(0.145 0 0)',
    badgeColor: '#10b981'
  },
  {
    id: 'indigo',
    name: 'Indigo',
    primaryOklchLight: 'oklch(0.5 0.22 270)',
    primaryFgLight: 'oklch(0.985 0 0)',
    primaryOklchDark: 'oklch(0.65 0.2 270)',
    primaryFgDark: 'oklch(0.145 0 0)',
    badgeColor: '#6366f1'
  },
  {
    id: 'violet',
    name: 'Violet',
    primaryOklchLight: 'oklch(0.52 0.25 295)',
    primaryFgLight: 'oklch(0.985 0 0)',
    primaryOklchDark: 'oklch(0.7 0.2 295)',
    primaryFgDark: 'oklch(0.145 0 0)',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'rose',
    name: 'Rose',
    primaryOklchLight: 'oklch(0.58 0.22 15)',
    primaryFgLight: 'oklch(0.985 0 0)',
    primaryOklchDark: 'oklch(0.68 0.2 15)',
    primaryFgDark: 'oklch(0.145 0 0)',
    badgeColor: '#f43f5e'
  },
  {
    id: 'amber',
    name: 'Amber',
    primaryOklchLight: 'oklch(0.65 0.18 75)',
    primaryFgLight: 'oklch(0.145 0 0)',
    primaryOklchDark: 'oklch(0.75 0.18 75)',
    primaryFgDark: 'oklch(0.145 0 0)',
    badgeColor: '#f59e0b'
  },
  {
    id: 'cyan',
    name: 'Ocean Cyan',
    primaryOklchLight: 'oklch(0.6 0.15 210)',
    primaryFgLight: 'oklch(0.985 0 0)',
    primaryOklchDark: 'oklch(0.72 0.15 210)',
    primaryFgDark: 'oklch(0.145 0 0)',
    badgeColor: '#06b6d4'
  }
]

export interface FontPreset {
  id: string
  name: string
  fontFamily: string
}

export const FONT_PRESETS: FontPreset[] = [
  { id: 'inter', name: 'Inter (Default)', fontFamily: "'Inter', sans-serif" },
  { id: 'roboto', name: 'Roboto', fontFamily: "'Roboto', sans-serif" },
  { id: 'outfit', name: 'Outfit', fontFamily: "'Outfit', sans-serif" },
  { id: 'geist', name: 'Geist Sans', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }
]

export const RADIUS_PRESETS = [
  { label: '0', value: '0rem' },
  { label: '0.3', value: '0.3rem' },
  { label: '0.5', value: '0.5rem' },
  { label: '0.625', value: '0.625rem' },
  { label: '0.75', value: '0.75rem' },
  { label: '1.0', value: '1rem' }
]

export type LayoutDensity = 'compact' | 'default' | 'comfortable'

const currentMode = ref<Mode>('system')
const currentColorPreset = ref<string>('emerald')
const currentRadius = ref<string>('0.625rem')
const currentFont = ref<string>('inter')
const currentDensity = ref<LayoutDensity>('default')

export function useAppearance() {
  const isInitialized = ref(false)

  function applySettings() {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    // 1. Apply Mode (Dark/Light/System)
    let isDark = false
    if (currentMode.value === 'dark') {
      isDark = true
    } else if (currentMode.value === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 2. Apply Color Preset CSS Variables
    const preset = COLOR_PRESETS.find(p => p.id === currentColorPreset.value) || COLOR_PRESETS[1]
    const primary = isDark ? preset.primaryOklchDark : preset.primaryOklchLight
    const primaryFg = isDark ? preset.primaryFgDark : preset.primaryFgLight

    root.style.setProperty('--primary', primary)
    root.style.setProperty('--primary-foreground', primaryFg)
    root.style.setProperty('--ring', primary)
    root.style.setProperty('--sidebar-primary', primary)
    root.style.setProperty('--sidebar-primary-foreground', primaryFg)

    // 3. Apply Radius
    root.style.setProperty('--radius', currentRadius.value)

    // 4. Apply Font
    const fontObj = FONT_PRESETS.find(f => f.id === currentFont.value) || FONT_PRESETS[0]
    root.style.fontFamily = fontObj.fontFamily

    // 5. Persist
    const state = {
      mode: currentMode.value,
      colorPreset: currentColorPreset.value,
      radius: currentRadius.value,
      font: currentFont.value,
      density: currentDensity.value
    }
    localStorage.setItem('pautang_appearance_settings', JSON.stringify(state))
  }

  function loadSettings() {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('pautang_appearance_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.mode) currentMode.value = parsed.mode
        if (parsed.colorPreset) currentColorPreset.value = parsed.colorPreset
        if (parsed.radius) currentRadius.value = parsed.radius
        if (parsed.font) currentFont.value = parsed.font
        if (parsed.density) currentDensity.value = parsed.density
      }
    } catch (e) {
      console.warn('Could not parse appearance settings', e)
    }
  }

  function resetToDefaults() {
    currentMode.value = 'system'
    currentColorPreset.value = 'emerald'
    currentRadius.value = '0.625rem'
    currentFont.value = 'inter'
    currentDensity.value = 'default'
    applySettings()
  }

  onMounted(() => {
    if (!isInitialized.value) {
      loadSettings()
      applySettings()
      isInitialized.value = true

      // Listen for system theme changes if mode is 'system'
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', () => {
        if (currentMode.value === 'system') {
          applySettings()
        }
      })
    }
  })

  watch([currentMode, currentColorPreset, currentRadius, currentFont, currentDensity], () => {
    applySettings()
  })

  return {
    mode: currentMode,
    colorPreset: currentColorPreset,
    radius: currentRadius,
    font: currentFont,
    density: currentDensity,
    COLOR_PRESETS,
    FONT_PRESETS,
    RADIUS_PRESETS,
    applySettings,
    resetToDefaults
  }
}
