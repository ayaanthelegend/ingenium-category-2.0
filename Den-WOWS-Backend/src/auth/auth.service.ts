import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {User} from "../users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const valid = await this.usersService.validatePassword(username, pass);
    if (!valid) return null;
    const u = user.toObject();
    delete u.password;
    return u;
  }

  async login(user: any) {
    // `user` is an object e.g. returned from validateUser or created user
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto) {
    return this.usersService.create(createUserDto);
  }
}
