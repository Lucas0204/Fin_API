import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryTransfersRepository } from '../../repositories/in-memory/InMemoryTransfersRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { ITransfersRepository } from '../../repositories/ITransfersRepository';
import { TransferOperationUseCase } from './TransferOperationUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

let transfersRepositoryInMemory: ITransfersRepository;
let usersRepositoryInMemory: IUsersRepository;
let statementsRepositoryInMemory: IStatementsRepository;
let transferOperationUseCase: TransferOperationUseCase;

describe('Transfer operation use case', () => {
  beforeEach(() => {
    transfersRepositoryInMemory = new InMemoryTransfersRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    transferOperationUseCase = new TransferOperationUseCase(
      transfersRepositoryInMemory,
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  })

  it('should be able to make a transfer from one account to another', async () => {
    const password = 'mypassword';
    const passwordHash = await hash(password, 8);

    const userSender = await usersRepositoryInMemory.create({
      name: 'sender',
      email: 'sender@mail.com',
      password: passwordHash
    });

    const userReceiver = await usersRepositoryInMemory.create({
      name: 'receiver',
      email: 'receiver@mail.com',
      password: passwordHash
    });

    await statementsRepositoryInMemory.create({
      user_id: userSender.id as string,
      amount: 100,
      type: 'deposit' as OperationType,
      description: 'depositing'
    });

    const transfer = await transferOperationUseCase.execute({
      sender_id: userSender.id as string,
      receiver_id: userReceiver.id as string,
      description: 'transfer',
      amount: 100
    });

    expect(transfer).toHaveProperty('id');
    expect(transfer.type).toBe('transfer');
  })

  it('should not be able to make a transfer to himself', async () => {
    const password = 'mypassword';
    const passwordHash = await hash(password, 8);

    const user = await usersRepositoryInMemory.create({
      name: 'sender',
      email: 'sender@mail.com',
      password: passwordHash
    });

    await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      amount: 100,
      type: 'deposit' as OperationType,
      description: 'depositing'
    });

    let transfer: any;

    try {
      transfer = await transferOperationUseCase.execute({
        sender_id: user.id as string,
        receiver_id: user.id as string,
        description: 'transfer',
        amount: 100
      });
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }

    expect(transfer).toBeUndefined();
  })

  it('should not be able to make a transfer from account that does not exist', async () => {
    const password = 'mypassword';
    const passwordHash = await hash(password, 8);

    const user = await usersRepositoryInMemory.create({
      name: 'sender',
      email: 'sender@mail.com',
      password: passwordHash
    });

    let transfer: any;

    try {
      transfer = await transferOperationUseCase.execute({
        sender_id: uuidv4(),
        receiver_id: user.id as string,
        description: 'transfer',
        amount: 100
      });
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }

    expect(transfer).toBeUndefined();
  })

  it('should not be able to make a transfer from one account to another that does not exist', async () => {
    const password = 'mypassword';
    const passwordHash = await hash(password, 8);

    const user = await usersRepositoryInMemory.create({
      name: 'sender',
      email: 'sender@mail.com',
      password: passwordHash
    });

    await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      amount: 100,
      type: 'deposit' as OperationType,
      description: 'depositing'
    });

    let transfer: any;

    try {
      transfer = await transferOperationUseCase.execute({
        sender_id: user.id as string,
        receiver_id: uuidv4(),
        description: 'transfer',
        amount: 100
      });
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }

    expect(transfer).toBeUndefined();
  })

  it('should not be able to make a transfer from account with insufficient funds', async () => {
    const password = 'mypassword';
    const passwordHash = await hash(password, 8);

    const userSender = await usersRepositoryInMemory.create({
      name: 'sender',
      email: 'sender@mail.com',
      password: passwordHash
    });

    await statementsRepositoryInMemory.create({
      user_id: userSender.id as string,
      amount: 50,
      type: 'deposit' as OperationType,
      description: 'depositing'
    });

    const userReceiver = await usersRepositoryInMemory.create({
      name: 'receiver',
      email: 'receiver@mail.com',
      password: passwordHash
    });

    let transfer: any;

    try {
      transfer = await transferOperationUseCase.execute({
        sender_id: userSender.id as string,
        receiver_id: userReceiver.id as string,
        description: 'transfer',
        amount: 100
      });
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }

    expect(transfer).toBeUndefined();
  })
})
