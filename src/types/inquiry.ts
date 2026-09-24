export type InquiryKind = "rental" | "contact";
export type InquiryStatus = "new" | "in_progress" | "done";

export interface Inquiry {
  id: number;
  kind: InquiryKind;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  rentalFrom: string | null;
  rentalTo: string | null;
  services: string[];
  products: Array<Record<string, string>>;
  status: InquiryStatus;
  mailSent: boolean;
  createdAt: string;
}
