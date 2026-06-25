import { Injectable, UnprocessableEntityException,UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserRequest } from './dto/create-user.request';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository){}

  async createUser(request: CreateUserRequest){
    await this.validateCreateUserRequest(request)
    const user = await this.usersRepo.create({
      ...request,
      password: await bcrypt.hash(request.password, 10)
    })

    return user;
  }

  private async validateCreateUserRequest(request: CreateUserRequest) {
    let user: User;
    try {
      user = await this.usersRepo.findOne({
        email: request.email,
      });
    } catch (err) {}

    if (user) {
      throw new UnprocessableEntityException('Email already exists.');
    }
  }

  async validateUser(email: string, password: string){
    const user = await this.usersRepo.findOne({email});
    const passwordIsValid = await bcrypt.compare(password, user.password)

    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }


  async getUser(getUserArgs: Partial<User>){
    return await this.usersRepo.findOne(getUserArgs)
  }
  
}
