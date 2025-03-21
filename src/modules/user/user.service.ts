import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/mysql';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './user.entity';
import { IUserRO } from '../../@types/user.types';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private configService:ConfigService
  ) {}
   
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(loginUserDto: LoginUserDto): Promise<User | null> {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto
        .createHmac('sha256', loginUserDto.password)
        .digest('hex'),
    };

    return this.userRepository.findOne(findOneOptions);
  }

  async create(dto: CreateUserDto): Promise<IUserRO> {
    // check uniqueness of username/email
    const { username, email, password } = dto;
  
    const exists = await this.userRepository.count({
      $or: [{ username }, { email }],
    });

    if (exists > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: { username: 'Username and email must be unique.' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new user
    const user = new User(username, email, password);
    const errors = await validate(user);

    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: { username: 'Userinput is not valid.' },
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      await this.em.persistAndFlush(user);
      return this.buildUserRO(user);
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOneOrFail(id);
    wrap(user).assign(dto);
    await this.em.flush();

    return this.buildUserRO(user);
  }

  async delete(email: string) {
    return this.userRepository.nativeDelete({ email });
  }

  async findById(id: number): Promise<IUserRO> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      const errors = { User: ' not found' };
      throw new HttpException({ errors }, 401);
    }

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<IUserRO> {
    const user = await this.userRepository.findOneOrFail({ email });
    return this.buildUserRO(user);
  }

  generateJWT(user: User) {
    const today = new Date();
    const exp = new Date(today);
    const SECRET=this.configService.get('SECRET')
    exp.setDate(today.getDate() + 60);
 
    return jwt.sign(
      {
        email: user.email,
        exp: exp.getTime() / 1000,
        id: user.id,
        username: user.username,
      },
      SECRET,
    );
  }

  private buildUserRO(user: User) {
    const userRO = {
      email: user.email,
      token: this.generateJWT(user),
      username: user.username,
    } as any;

    return { user: userRO };
  }
}
