export interface ITransferStatement {
  id?: string | undefined;
  sender_id: string;
  type: string;
  description: string;
  amount: number;
  created_at: Date;
  updated_at: Date;
}
