export type AvataxClientOptions = {
  machineName?: string;
  accountId: string;
  licenseKey: string;
  environment: "sandbox" | "production";
  companyCode: string;
  documentRecordingEnabled?: boolean;
};
