import { v4 as uuidv4 } from 'uuid';

import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";
import { ITransfersRepository } from "../../repositories/ITransfersRepository";
import { InMemoryTransfersRepository } from '../../repositories/in-memory/InMemoryTransfersRepository';


let usersRepositoryInMemory: IUsersRepository;
let statementsRepositoryInMemory: IStatementsRepository;
let transfersRepositoryInMemory: ITransfersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

describe('Get balance use case', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    transfersRepositoryInMemory = new InMemoryTransfersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  })

  it('should be able to get balance with transfers', async () => {
    const user = await usersRepositoryInMemory.create({
      name: 'Test name',
      email: 'test@mail.com',
      password: 'mypassword'
    });

    const statement = await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      type: 'deposit' as OperationType,
      amount: 120,
      description: 'depositing'
    });

    const transfer = await transfersRepositoryInMemory.create({
      sender_id: user.id as string,
      receiver_id: uuidv4(),
      amount: 100,
      description: '[TRANSFER] - transference'
    });

    await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      type: 'withdraw' as OperationType,
      amount: transfer.amount,
      description: `[TRANSFER] - transference`
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string
    });

    expect(balance).toHaveProperty('statement');
    expect(balance).toHaveProperty('balance');

    expect(balance.statement[0]).toEqual(statement);
    expect(balance.statement[1]).toHaveProperty('sender_id');
    expect(balance.statement[1].type).toBe('transfer');
  })

  it('should not be able to get balance of user that does not exists', async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: 'user_does_not_exist'
      })
    ).rejects.toEqual(new GetBalanceError());
  })
})
