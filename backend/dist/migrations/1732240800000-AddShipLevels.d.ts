import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddShipLevels1732240800000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
