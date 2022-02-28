import { AppError } from "../../../../shared/errors/AppError";

export namespace TransferOperationError {
  export class MissingData extends AppError {
    constructor() {
      super('Necessary data is missing!');
    }
  }

  export class OperationToHimself extends AppError {
    constructor() {
      super('It is not possible to make a transfer for yourself!');
    }
  }

  export class SenderUserDoesNotExist extends AppError {
    constructor() {
      super('User does not exist!', 404);
    }
  }

  export class ReceiverUserDoesNotExist extends AppError {
    constructor() {
      super('Receiver user does not exist!', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds!');
    }
  }
}
