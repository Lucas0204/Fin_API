import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class transfersTable1645908605041 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'transfers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true
          },
          {
            name: 'sender_id',
            type: 'uuid'
          },
          {
            name: 'receiver_id',
            type: 'uuid'
          },
          {
            name: 'amount',
            type: 'numeric'
          },
          {
            name: 'description',
            type: 'varchar'
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['transfer']
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ],
        foreignKeys: [
          {
            name: 'FKSenderTransfer',
            referencedTableName: 'users',
            referencedColumnNames: [ 'id' ],
            columnNames: [ 'sender_id' ],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          {
            name: 'FKReceiverTransfer',
            referencedTableName: 'users',
            referencedColumnNames: [ 'id' ],
            columnNames: [ 'receiver_id' ],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          }
        ]
      }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('transfers');
    }
}
