import request from 'supertest';
import { sign } from 'jsonwebtoken';
import { Connection } from "typeorm";
import { hash } from 'bcryptjs';

import createDatabaseConnection from '../../../../database';
import auth from '../../../../config/auth';
import { app } from '../../../../app';
import { User } from "../../../users/entities/User";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { StatementsRepository } from '../../repositories/StatementsRepository';
import { TransferOperationError } from './TransferOperationError';
import { JWTTokenMissingError } from '../../../../shared/errors/JWTTokenMissingError';
import { JWTInvalidTokenError } from '../../../../shared/errors/JWTInvalidTokenError';

interface IPayload {
  email: string;
}

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw'
}

let connection: Connection;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

let senderUser: User;
let receiverUser: User;

let payload: IPayload;

describe('Transfer operation controller', () => {
  beforeAll(async () => {
    connection = await createDatabaseConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    statementsRepository = new StatementsRepository();

    const password = 'mypassword';
    const passwordHash = await hash(password, 8);

    senderUser = await usersRepository.create({
      name: 'Sender',
      email: 'sender@mail.com',
      password: passwordHash
    });

    receiverUser = await usersRepository.create({
      name: 'Receiver',
      email: 'receiver@mail.com',
      password: passwordHash
    });

    payload = { email: senderUser.email };
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to make a transfer from one account to another', async () => {
    const token = sign(payload, auth.jwt.secret, {
      subject: senderUser.id
    });

    await statementsRepository.create({
      user_id: senderUser.id as string,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'deposit'
    });

    const response = await request(app)
    .post(`/api/v1/statements/transfer/${receiverUser.id}`)
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      description: 'transfer',
      amount: 100
    });

    const transfer = response.body;

    expect(response.status).toBe(201);
    expect(transfer).toHaveProperty('id');
    expect(transfer.sender_id).toBe(senderUser.id);
    expect(transfer.receiver_id).toBe(receiverUser.id);
    expect(transfer.type).toBe('transfer');
  })

  it('should not be able to make a transfer without sending description and amount', async () => {
    const token = sign(payload, auth.jwt.secret, {
      subject: senderUser.id
    });

    await statementsRepository.create({
      user_id: senderUser.id as string,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'deposit'
    });

    const response = await request(app)
    .post(`/api/v1/statements/transfer/${receiverUser.id}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    const error = new TransferOperationError.MissingData();
    const expectedErrorMessage = JSON.stringify({
      message: error.message
    });

    expect(response.status).toBe(400);
    expect(response.text).toEqual(expectedErrorMessage);
  })

  it('should not be able to make a transfer without sending the authentication token', async () => {
    const response = await request(app)
    .post(`/api/v1/statements/transfer/${receiverUser.id}`)
    .send({
      description: 'transfer',
      amount: 100
    });

    const error = new JWTTokenMissingError();
    const expectedErrorMessage = JSON.stringify({
      message: error.message
    });

    expect(response.status).toBe(401);
    expect(response.text).toEqual(expectedErrorMessage);
  })

  it('should not be able to make a transfer with jwt token secret incorrect', async () => {
    const token = sign(payload, 'incorrect_jwt_secret', {
      subject: senderUser.id
    });

    await statementsRepository.create({
      user_id: senderUser.id as string,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'deposit'
    });

    const response = await request(app)
    .post(`/api/v1/statements/transfer/${receiverUser.id}`)
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      description: 'transfer',
      amount: 100
    });

    const error = new JWTInvalidTokenError();
    const expectedErrorMessage = JSON.stringify({
      message: error.message
    });

    expect(response.status).toBe(401);
    expect(response.text).toEqual(expectedErrorMessage);
  })
})
