export type FileOrURL = File | string;

export interface PreferencesBrandingFormValues {
  logoKey: string;
  logoUri: string;
  primaryColor: string;
  _logoFile?: FileOrURL;
}
