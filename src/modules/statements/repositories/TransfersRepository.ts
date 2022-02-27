import { getRepository, Repository } from "typeorm";
import { ICreateTransferDTO } from "../dtos/ICreateTransferDTO";
import { Transfer } from "../entities/Transfer";
import { ITransfersRepository } from "./ITransfersRepository";


class TransfersRepository implements ITransfersRepository {
  private repository: Repository<Transfer>;

  constructor() {
    this.repository = getRepository(Transfer);
  }

  async create({
    sender_id,
    receiver_id,
    description,
    amount
  }: ICreateTransferDTO): Promise<Transfer> {
    const transfer = this.repository.create({
      sender_id,
      receiver_id,
      description,
      amount
    });

    return await this.repository.save(transfer);
  }
}

export { TransfersRepository };
