import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Book, User} from '@app/entities';
import { UserService } from './user.service';
import { AuthModule } from '@app/shared/auth';
import { RedisModule } from '@app/shared/redis';
import { UserController } from './user.controller';
import { BookService } from '../book/book.service';

@Module({
    imports: [TypeOrmModule.forFeature([User,Book]), HttpModule, AuthModule, RedisModule],

    controllers: [UserController],

    providers: [UserService,BookService],
})
export class UserModule { }
