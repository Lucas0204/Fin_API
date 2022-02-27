import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

enum TransferType {
  TRANSFER = 'transfer'
}

@Entity('transfers')
class Transfer {

  @PrimaryColumn()
  id: string;

  @Column()
  sender_id: string;

  @Column()
  receiver_id: string;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column()
  type: TransferType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidv4();
      this.type = 'transfer' as TransferType;
    }
  }
}

export { Transfer };
