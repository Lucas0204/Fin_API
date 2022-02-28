import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransferStatement } from '../../dtos/ITransferStatementDTO';
import { GetBalanceError } from "./GetBalanceError";

interface IRequest {
  user_id: string;
}

interface IResponse {
  balance: number;
  statement: (Statement | ITransferStatement)[];
}

interface IBalanceResponse {
  statement: Statement[];
  balance: number;
}

@injectable()
export class GetBalanceUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({ user_id }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new GetBalanceError();
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id,
      with_statement: true
    }) as IBalanceResponse;

    const statement = this.parseStatements(balance.statement);

    return {
      balance: balance.balance,
      statement
    };
  }

  private parseStatements(statements: Statement[]): (Statement | ITransferStatement)[]{
    return statements.map(operation => {
      const firstIndex = Array.from(operation.description).findIndex(char => char === '[') + 1;
      const lastIndex = Array.from(operation.description).findIndex(char => char === ']');

      const description = operation.description.slice(firstIndex, lastIndex).toLowerCase();

      if (description === 'transfer' && operation.type === 'withdraw') {
        const {
          id,
          user_id,
          amount,
          created_at,
          updated_at,
          description
        } = operation;

        return {
          id,
          sender_id: user_id,
          amount,
          description,
          type: 'transfer',
          created_at,
          updated_at
        };
      }

      return operation;
    })
  }
}
