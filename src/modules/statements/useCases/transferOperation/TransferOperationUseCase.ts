import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Transfer } from "../../entities/Transfer";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransfersRepository } from "../../repositories/ITransfersRepository";
import { TransferOperationError } from './TransferOperationError';

interface IRequest {
  sender_id: string;
  receiver_id: string;
  description: string;
  amount: number;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

@injectable()
class TransferOperationUseCase {
  constructor(
    @inject('TransfersRepository')
    private transfersRepository: ITransfersRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    description,
    amount
  }: IRequest): Promise<Transfer> {
    if (sender_id === receiver_id) {
      throw new TransferOperationError.OperationToHimself();
    }

    const senderUser = await this.usersRepository.findById(sender_id);

    if (!senderUser) {
      throw new TransferOperationError.SenderUserDoesNotExist();
    }

    const receiverUser = await this.usersRepository.findById(receiver_id);

    if (!receiverUser) {
      throw new TransferOperationError.ReceiverUserDoesNotExist();
    }

    const userBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    });

    if (userBalance.balance < amount) {
      throw new TransferOperationError.InsufficientFunds();
    }

    const transfer = await this.transfersRepository.create({
      sender_id,
      receiver_id,
      description,
      amount
    });

    await this.statementsRepository.create({
      user_id: senderUser.id as string,
      type: 'withdraw' as OperationType,
      amount,
      description: `[TRANSFER] - transference to ${receiverUser.id} - ${description}`
    });

    await this.statementsRepository.create({
      user_id: receiverUser.id as string,
      type: 'deposit' as OperationType,
      amount,
      description: `[TRANSFER] - transference from ${senderUser.id} - ${description}`
    });

    return transfer;
  }
}

export { TransferOperationUseCase };
