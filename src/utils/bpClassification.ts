import { BPCategory, BPCategoryInfo } from '../types/reading';

/**
 * Blood Pressure Classification based on 2017 ACC/AHA Clinical Guidelines.
 * 
 * Important medical disclaimer:
 * A single reading does not establish a medical condition or diagnosis. Blood pressure fluctuates
 * naturally throughout the day based on physical activity, stress, hydration, and other factors.
 * Always consult a qualified healthcare provider for proper diagnosis and medical advice.
 */
export function classifyBloodPressure(
  systolic: number,
  diastolic: number,
  t?: (key: string, defaultText?: string) => string
): BPCategoryInfo {
  const tr = t || ((_k: string, def?: string) => def || _k);

  // Guard against invalid/extreme values
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return {
      category: 'normal',
      label: tr('pending', 'Pending'),
      badgeLabel: tr('cat_normal', 'Uncategorized'),
      color: '#64748B',
      bgColor: '#F1F5F9',
      description: tr('bp_desc_invalid', 'Enter valid systolic and diastolic values.'),
      actionGuidance: tr('bp_guidance_invalid', 'Please recheck your numbers.'),
      isConcerning: false,
    };
  }

  // Hypertensive Crisis (> 180 and/or > 120)
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'crisis',
      label: tr('cat_crisis', 'Hypertensive Crisis'),
      badgeLabel: tr('cat_high_alert', 'High Alert'),
      color: '#B91C1C', // Dark red
      bgColor: '#FEE2E2',
      description: tr('bp_desc_crisis', 'This reading is exceptionally high. Note: a single measurement does not constitute a clinical diagnosis.'),
      actionGuidance: tr('bp_guidance_crisis', 'Rest quietly for 5 minutes and take another reading.'),
      isConcerning: true,
    };
  }

  // Stage 2 Hypertension (>= 140 or >= 90)
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'stage2',
      label: tr('bp_stage2_range', 'Stage 2 Range'),
      badgeLabel: tr('cat_stage2', 'Stage 2'),
      color: '#EF4444', // Red
      bgColor: '#FEE2E2',
      description: tr('bp_desc_stage2', 'Systolic is 140+ or diastolic is 90+.'),
      actionGuidance: tr('bp_guidance_stage2', 'Continue tracking your readings consistently.'),
      isConcerning: false,
    };
  }

  // Stage 1 Hypertension (130-139 or 80-89)
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'stage1',
      label: tr('bp_stage1_range', 'Stage 1 Range'),
      badgeLabel: tr('cat_stage1', 'Stage 1'),
      color: '#F59E0B', // Amber
      bgColor: '#FEF3C7',
      description: tr('bp_desc_stage1', 'Systolic 130–139 or diastolic 80–89.'),
      actionGuidance: tr('bp_guidance_stage1', 'Consider discussing these measurements with your healthcare provider.'),
      isConcerning: false,
    };
  }

  // Elevated (120-129 and < 80)
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'elevated',
      label: tr('bp_elevated_range', 'Elevated Range'),
      badgeLabel: tr('cat_elevated', 'Elevated'),
      color: '#D97706', // Warm amber
      bgColor: '#FEF3C7',
      description: tr('bp_desc_elevated', 'Systolic is slightly elevated (120–129 mmHg) while diastolic is under 80 mmHg.'),
      actionGuidance: tr('bp_guidance_elevated', 'Adopting heart-healthy habits can help maintain optimal levels.'),
      isConcerning: false,
    };
  }

  // Low Blood Pressure (< 90 or < 60)
  if (systolic < 90 || diastolic < 60) {
    return {
      category: 'low',
      label: tr('cat_hypotension', 'Low Blood Pressure'),
      badgeLabel: tr('cat_hypotension', 'Low BP'),
      color: '#2563EB', // Blue
      bgColor: '#EAF4FF',
      description: tr('bp_desc_low', 'Systolic is below 90 mmHg or diastolic is below 60 mmHg.'),
      actionGuidance: tr('bp_guidance_low', 'Low readings are common in healthy individuals.'),
      isConcerning: false,
    };
  }

  // Normal (< 120 and < 80)
  return {
    category: 'normal',
    label: tr('bp_standard_range', 'Standard Range'),
    badgeLabel: tr('cat_good_range', 'Good range'),
    color: '#16A34A', // Green
    bgColor: '#E8F8F0',
    description: tr('bp_desc_normal', 'Systolic is under 120 mmHg and diastolic is under 80 mmHg.'),
    actionGuidance: tr('bp_guidance_normal', 'Maintain healthy lifestyle habits to keep your blood pressure in this range.'),
    isConcerning: false,
  };
}

export const MONTH_NAMES: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  bn: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
};

/**
 * Format timestamp into display string matching UI: e.g. "Oct 15, 2026 • 08:30 AM"
 */
export function formatReadingDateTime(isoString: string, lang?: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const months = (lang && MONTH_NAMES[lang]) || MONTH_NAMES.en;
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strHours = hours.toString().padStart(2, '0');
    
    return `${month} ${day}, ${year} • ${strHours}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

/**
 * Short date format for list items: e.g. "Oct 15, 08:30 AM"
 */
export function formatShortDateTime(isoString: string, lang?: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const months = (lang && MONTH_NAMES[lang]) || MONTH_NAMES.en;
    const month = months[d.getMonth()];
    const day = d.getDate();
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours.toString().padStart(2, '0');
    
    return `${month} ${day}, ${strHours}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}
