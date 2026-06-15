// src/lib/theme.ts
// Loads the central theme from settings/theme and provides colour helpers
// Sections call loadTheme(admin) once to get all site colours

export interface SiteTheme {
  hero_bg?: string; hero_text?: string; hero_accent?: string;
  services_bg?: string; services_text?: string; services_heading?: string;
  services_card_bg?: string; services_card_border?: string;
  story_bg?: string; story_text?: string; story_heading?: string; story_card_bg?: string;
  packages_bg?: string; packages_text?: string; packages_heading?: string;
  packages_card_bg?: string; packages_card_border?: string;
  testimonials_bg?: string; testimonials_text?: string; testimonials_heading?: string;
  testimonials_card_bg?: string; testimonials_card_border?: string;
  accent?: string;
  [key: string]: string | undefined;
}

export async function loadTheme(admin: any): Promise<SiteTheme> {
  if (!admin) return {};
  try {
    const { data } = await admin
      .from('site_content')
      .select('content')
      .eq('page', 'settings')
      .eq('section', 'theme')
      .single();
    return (data?.content as SiteTheme) ?? {};
  } catch {
    return {};
  }
}
