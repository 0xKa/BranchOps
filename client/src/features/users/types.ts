export interface Employee {
  id: string;
  userId: string;
  branchId: string;
  fullName: string;
  phone: string | null;
  jobTitle: string | null;
  notes: string | null;
  isActive: boolean;
  hiredAt: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
