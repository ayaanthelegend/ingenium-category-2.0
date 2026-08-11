import {Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {AdminKeyGuard} from "./admin-key.guard";
import {IsString} from "class-validator";

class LoginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AdminKeyGuard)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      return { error: 'Invalid username or password' };
    }
    return this.authService.login(user);
  }
}
