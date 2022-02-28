import { Statement } from "../entities/Statement";
import { ITransferStatement } from '../dtos/ITransferStatementDTO';

export class BalanceMap {
  static toDTO({statement, balance}: { statement: (Statement | ITransferStatement)[], balance: number}) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at
    }) => (
      {
        id,
        amount: Number(amount),
        description,
        type,
        created_at,
        updated_at
      }
    ));

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
