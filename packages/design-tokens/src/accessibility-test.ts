/**
 * WCAG 2.1 AA Accessibility Validation Report
 * Nova Universe Design System Color Palette
 */

import { colors } from './tokens'
import { validateColorAccessibility, getContrastRatio, meetsWCAG } from './accessibility'

// Run accessibility validation
const validationResults = validateColorAccessibility(colors)

console.log('🎨 Nova Universe Color Accessibility Report')
console.log('==========================================\n')

// Print validation results
if (validationResults.isCompliant) {
  console.log('✅ All color combinations meet WCAG 2.1 AA standards!\n')
} else {
  console.log('❌ Some color combinations need attention:\n')
  
  if (validationResults.violations.length > 0) {
    console.log('🚨 VIOLATIONS (WCAG 2.1 AA):')
    validationResults.violations.forEach(violation => console.log(`  • ${violation}`))
    console.log('')
  }
}

if (validationResults.warnings.length > 0) {
  console.log('⚠️  WARNINGS (WCAG 2.1 AAA):')
  validationResults.warnings.forEach(warning => console.log(`  • ${warning}`))
  console.log('')
}

// Test specific color combinations
console.log('🔍 Key Color Combination Tests:')
console.log('================================\n')

const testCombinations = [
  // Primary colors
  { name: 'Primary Button Text', fg: '#ffffff', bg: colors.primary[500] },
  { name: 'Primary Link Text', fg: colors.primary[600], bg: colors.neutral[50] },
  { name: 'Primary Hover State', fg: '#ffffff', bg: colors.primary[700] },
  
  // Semantic colors
  { name: 'Success Message', fg: '#ffffff', bg: colors.semantic.success[500] },
  { name: 'Warning Message', fg: colors.neutral[900], bg: colors.semantic.warning[400] },
  { name: 'Error Message', fg: '#ffffff', bg: colors.semantic.error[500] },
  { name: 'Info Message', fg: '#ffffff', bg: colors.semantic.info[500] },
  
  // Neutral combinations
  { name: 'Body Text Light', fg: colors.neutral[900], bg: colors.neutral[50] },
  { name: 'Body Text Dark', fg: colors.neutral[50], bg: colors.neutral[900] },
  { name: 'Muted Text Light', fg: colors.neutral[600], bg: colors.neutral[50] },
  { name: 'Muted Text Dark', fg: colors.neutral[400], bg: colors.neutral[900] },
  
  // Secondary combinations
  { name: 'Secondary Button', fg: '#ffffff', bg: colors.secondary[500] },
  { name: 'Accent Button', fg: '#ffffff', bg: colors.accent[500] }
]

testCombinations.forEach(({ name, fg, bg }) => {
  const ratio = getContrastRatio(fg, bg)
  const aa = meetsWCAG(fg, bg, 'AA', false)
  const aaLarge = meetsWCAG(fg, bg, 'AA', true)
  const aaa = meetsWCAG(fg, bg, 'AAA', false)
  
  const status = aa ? '✅' : '❌'
  const aaStatus = aa ? 'PASS' : 'FAIL'
  const aaaStatus = aaa ? 'AAA' : aaLarge ? 'AA-Large' : 'FAIL'
  
  console.log(`${status} ${name.padEnd(25)} ${ratio.toFixed(2)}:1 [${aaStatus}/${aaaStatus}]`)
})

console.log('\n📊 Accessibility Summary:')
console.log('=========================')
console.log(`Total combinations tested: ${testCombinations.length}`)
console.log(`WCAG 2.1 AA compliant: ${testCombinations.filter(({ fg, bg }) => meetsWCAG(fg, bg, 'AA')).length}`)
console.log(`WCAG 2.1 AAA compliant: ${testCombinations.filter(({ fg, bg }) => meetsWCAG(fg, bg, 'AAA')).length}`)

// Export report for documentation
export const accessibilityReport = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  standard: 'WCAG 2.1 AA',
  results: validationResults,
  testCombinations: testCombinations.map(({ name, fg, bg }) => ({
    name,
    foreground: fg,
    background: bg,
    contrastRatio: getContrastRatio(fg, bg),
    wcagAA: meetsWCAG(fg, bg, 'AA'),
    wcagAAA: meetsWCAG(fg, bg, 'AAA'),
    wcagAALarge: meetsWCAG(fg, bg, 'AA', true)
  }))
}

export default accessibilityReport
