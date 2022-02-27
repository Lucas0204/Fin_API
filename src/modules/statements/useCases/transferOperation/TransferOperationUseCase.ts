import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Transfer } from "../../entities/Transfer";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransfersRepository } from "../../repositories/ITransfersRepository";

interface IRequest {
  sender_id: string;
  receiver_id: string;
  description: string;
  amount: number;
}

class TransferOperationUseCase {
  constructor(
    private transfersRepository: ITransfersRepository,
    private usersRepository: IUsersRepository,
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    description,
    amount
  }: IRequest): Promise<Transfer> {
    if (sender_id === receiver_id) {
      throw new AppError('It is not possible to make a transfer for yourself!');
    }

    const senderUser = await this.usersRepository.findById(sender_id);

    if (!senderUser) {
      throw new AppError('Sender user does not exist!', 404);
    }

    const receiverUser = await this.usersRepository.findById(receiver_id);

    if (!receiverUser) {
      throw new AppError('Sender user does not exist!', 404);
    }

    const userBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    });

    if (userBalance.balance < amount) {
      throw new AppError('Insufficient funds!');
    }

    const transfer = await this.transfersRepository.create({
      sender_id,
      receiver_id,
      description,
      amount
    });

    return transfer;
  }
}

export { TransferOperationUseCase };
