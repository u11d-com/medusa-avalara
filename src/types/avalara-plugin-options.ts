export type AvalaraPluginOptions = {
  accountId: number;
  licenseKey: string;
  environment: "sandbox" | "production";
  companyCode: string;
  companyId: number;

  documentRecordingEnabled?: boolean;
  machineName?: string;

  defaultTaxCode?: string;
  shippingTaxCode?: string;
};
