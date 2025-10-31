export type AvataxClientOptions = {
  machineName?: string;
  accountId: number;
  licenseKey: string;
  environment: "sandbox" | "production";
  companyCode: string;
  companyId: number;
  documentRecordingEnabled?: boolean;
};
