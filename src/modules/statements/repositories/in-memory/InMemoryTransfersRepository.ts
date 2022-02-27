import { ICreateTransferDTO } from "../../dtos/ICreateTransferDTO";
import { Transfer } from "../../entities/Transfer";
import { ITransfersRepository } from "../ITransfersRepository";


class InMemoryTransfersRepository implements ITransfersRepository {
  private transfers: Transfer[];

  constructor() {
    this.transfers = [];
  }

  async create({
    sender_id,
    receiver_id,
    description,
    amount
  }: ICreateTransferDTO): Promise<Transfer> {
    const transfer = new Transfer();

    Object.assign(transfer, {
      sender_id,
      receiver_id,
      description,
      amount
    });

    this.transfers.push(transfer);

    return transfer;
  }
}

export { InMemoryTransfersRepository };
