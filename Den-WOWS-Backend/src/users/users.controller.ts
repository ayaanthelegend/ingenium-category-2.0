import {Controller, Get, UseGuards, Req, Body, Post, Delete, Param, Patch} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {AdminKeyGuard} from "../auth/admin-key.guard";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";
import {FeatureFlagGuard, RequireFlag} from "../flags/flag.guard";

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/all')
  @UseGuards(AdminKeyGuard)
  getUsers() {
    return this.usersService.getAll();
  }

  @Delete(':id')
  @UseGuards(AdminKeyGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id)
  }

  @Patch(':id')
  @UseGuards(AdminKeyGuard)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto)
  }

  // Protected route: current user info
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @RequireFlag('global')
  @UseGuards(FeatureFlagGuard)
  async me(@Req() req) {
    // req.user is set by JwtStrategy's validate()
    const user = await this.usersService.findById(req.user.sub);
    if (!user) return null;
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }
}
