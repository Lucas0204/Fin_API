import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from '../dtos/ICreateTransferDTO';

export interface ITransfersRepository {
  create(data: ICreateTransferDTO): Promise<Transfer>;
}
