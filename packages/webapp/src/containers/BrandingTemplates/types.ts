

export interface BrandingTemplateValues {
  templateName: string;

  // Company logo
  companyLogoKey?: string;
  companyLogoUri?: string;
  companyLogoUrl?: string;
}

export interface BrandingState extends ElementPreviewState {
  companyName: string;
  companyAddress: string;

  companyLogoKey: string;
  companyLogoUri: string;
  companyLogoUrl: string;

  primaryColor: string;
}

export interface ElementPreviewState {

}