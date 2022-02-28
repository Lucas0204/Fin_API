import { Request, Response } from "express";
import { container } from "tsyringe";

import { TransferOperationUseCase } from './TransferOperationUseCase';

class TransferOperationController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { receiver_id } = request.params;
    const { id } = request.user;

    const { description, amount } = request.body;

    if (!receiver_id || !description || !amount) {
      return response.status(400).json({
        error: 'Necessary data is missing!'
      });
    }

    const transferOperationUseCase = container.resolve(TransferOperationUseCase);

    const transfer = await transferOperationUseCase.execute({
      sender_id: id,
      receiver_id,
      description,
      amount
    });

    return response.status(201).json(transfer);
  }
}

export { TransferOperationController };
