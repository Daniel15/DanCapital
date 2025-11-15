// @ts-nocheck
import { useFormikContext } from 'formik';
import { FFormGroup } from '@/components';
import { CompanyLogoUpload } from './CompanyLogoUpload';

export function BrandingCompanyLogoUploadField() {
  const { setFieldValue, values } = useFormikContext();

  return (
    <FFormGroup name={'companyLogo'} label={''} fastField>
      <CompanyLogoUpload
        initialPreview={values.companyLogoUri}
        logoUrl={values.companyLogoUrl}
        onChange={(file) => {
          const imageUrl = file ? URL.createObjectURL(file) : '';

          // Reset the logo key and URL since it is changed to file.
          setFieldValue('companyLogoKey', '');
          setFieldValue('companyLogoUrl', '');

          setFieldValue('_companyLogoFile', file);
          setFieldValue('companyLogoUri', imageUrl);
        }}
        onUrlChange={(url) => {
          // Reset the logo key and file since it is changed to URL.
          setFieldValue('companyLogoKey', '');
          setFieldValue('_companyLogoFile', null);

          setFieldValue('companyLogoUrl', url);
          setFieldValue('companyLogoUri', url);
        }}
      />
    </FFormGroup>
  );
}
