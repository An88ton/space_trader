import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PlayerInventory } from '../entities/player-inventory.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PlayerInventory]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'space-trader-super-secret',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '2h') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
