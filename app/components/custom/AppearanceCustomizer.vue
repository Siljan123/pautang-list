<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Palette,
  Type,
  LayoutGrid,
  Sliders,
  Copy,
  Sparkles,
  DollarSign,
  TrendingUp,
  CreditCard,
  User,
  Search,
  Bell,
  ArrowUpRight
} from 'lucide-vue-next'
import { useAppearance } from '@/composables/useAppearance'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const {
  mode,
  colorPreset,
  radius,
  font,
  density,
  COLOR_PRESETS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  resetToDefaults
} = useAppearance()

const copiedCode = ref(false)
const sampleToggle = ref(true)
const sampleInput = ref('₱5,000.00')

const activePreset = computed(() => {
  return COLOR_PRESETS.find(p => p.id === colorPreset.value) || COLOR_PRESETS[1]
})
const generatedCssSnippet = computed(() => {
  return `:root {
  --radius: ${radius.value};
  --primary: ${activePreset.value!.primaryOklchLight};
  --primary-foreground: ${activePreset.value!.primaryFgLight};
}

.dark {
  --primary: ${activePreset.value!.primaryOklchDark};
  --primary-foreground: ${activePreset.value!.primaryFgDark};
}`
})

function copyCssConfig() {
  navigator.clipboard.writeText(generatedCssSnippet.value)
  copiedCode.value = true
  setTimeout(() => {
    copiedCode.value = false
  }, 2000)
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto space-y-8 p-1 sm:p-4">
    <div class="grid grid-cols-4 lg:grid-cols-4 gap-8">
      
      <!-- Left Column: Controls (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- 1. Color Theme Presets -->
        <Card class="border-border shadow-xs">
          <CardHeader class="pb-3">
            <CardTitle class="text-base font-semibold flex items-center gap-2">
              <Palette class="h-4 w-4 text-primary" />
              Accent Color Palette
            </CardTitle>
            <CardDescription class="text-xs">
              Dynamically updates <code class="bg-muted px-1.5 py-0.5 rounded text-[11px]">--primary</code> and <code class="bg-muted px-1.5 py-0.5 rounded text-[11px]">--ring</code> OKLCH CSS variables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                v-for="preset in COLOR_PRESETS"
                :key="preset.id"
                @click="colorPreset = preset.id"
                :class="[
                  'flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium transition-all text-left',
                  colorPreset === preset.id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs'
                    : 'border-border bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                ]"
              >
                <span
                  class="h-5 w-5 rounded-full flex-shrink-0 shadow-xs border border-white/20 flex items-center justify-center"
                  :style="{ backgroundColor: preset.badgeColor }"
                >
                  <Check v-if="colorPreset === preset.id" class="h-3 w-3 text-white stroke-[3]" />
                </span>
                <span class="truncate font-medium text-xs text-foreground">{{ preset.name }}</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <!-- 2. Dark / Light Mode -->
        <Card class="border-border shadow-xs">
          <CardHeader class="pb-3">
            <CardTitle class="text-base font-semibold flex items-center gap-2">
              <Sun class="h-4 w-4 text-primary" />
              Color Mode
            </CardTitle>
            <CardDescription class="text-xs">
              Toggle Light, Dark, or System mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="mode = 'light'"
                :class="[
                  'flex flex-col items-center justify-center gap-2 rounded-xl border py-3 px-2 text-xs font-medium transition-all',
                  mode === 'light'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                ]"
              >
                <Sun class="h-4 w-4" />
                Light Mode
              </button>

              <button
                @click="mode = 'dark'"
                :class="[
                  'flex flex-col items-center justify-center gap-2 rounded-xl border py-3 px-2 text-xs font-medium transition-all',
                  mode === 'dark'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                ]"
              >
                <Moon class="h-4 w-4" />
                Dark Mode
              </button>

              <button
                @click="mode = 'system'"
                :class="[
                  'flex flex-col items-center justify-center gap-2 rounded-xl border py-3 px-2 text-xs font-medium transition-all',
                  mode === 'system'
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                ]"
              >
                <Laptop class="h-4 w-4" />
                System
              </button>
            </div>
          </CardContent>
        </Card>

        <!-- 3. Border Radius Controls -->
        <Card class="border-border shadow-xs">
          <CardHeader class="pb-3">
            <CardTitle class="text-base font-semibold flex items-center gap-2">
              <Sliders class="h-4 w-4 text-primary" />
              Border Radius (<code class="text-xs font-mono">--radius</code>)
            </CardTitle>
            <CardDescription class="text-xs">
              Controls corner roundedness across cards, buttons, and dialogs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="r in RADIUS_PRESETS"
                :key="r.value"
                @click="radius = r.value"
                :class="[
                  'flex flex-col items-center justify-center rounded-lg border py-2.5 text-xs font-semibold transition-all',
                  radius === r.value
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground'
                ]"
              >
                {{ r.label }}
              </button>
            </div>
          </CardContent>
        </Card>

        <!-- 4. Typography Font Family -->
        <Card class="border-border shadow-xs">
          <CardHeader class="pb-3">
            <CardTitle class="text-base font-semibold flex items-center gap-2">
              <Type class="h-4 w-4 text-primary" />
              Font Family
            </CardTitle>
            <CardDescription class="text-xs">
              Sets global typography style across headings and body copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="f in FONT_PRESETS"
                :key="f.id"
                @click="font = f.id"
                :class="[
                  'flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all',
                  font === f.id
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/30'
                    : 'border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground'
                ]"
                :style="{ fontFamily: f.fontFamily }"
              >
                <span>{{ f.name }}</span>
                <Check v-if="font === f.id" class="h-3.5 w-3.5 text-primary" />
              </button>
            </div>
          </CardContent>
        </Card>

        <!-- 5. Layout Density -->
        <Card class="border-border shadow-xs">
          <CardHeader class="pb-3">
            <CardTitle class="text-base font-semibold flex items-center gap-2">
              <LayoutGrid class="h-4 w-4 text-primary" />
              Layout Density
            </CardTitle>
            <CardDescription class="text-xs">
              Adjust spacing scale for compact data tables or spacious overview grids.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="density = 'compact'"
                :class="[
                  'rounded-xl border py-2.5 text-xs font-medium transition-all',
                  density === 'compact'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent'
                ]"
              >
                Compact
              </button>
              <button
                @click="density = 'default'"
                :class="[
                  'rounded-xl border py-2.5 text-xs font-medium transition-all',
                  density === 'default'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent'
                ]"
              >
                Default
              </button>
              <button
                @click="density = 'comfortable'"
                :class="[
                  'rounded-xl border py-2.5 text-xs font-medium transition-all',
                  density === 'comfortable'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent'
                ]"
              >
                Spacious
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
