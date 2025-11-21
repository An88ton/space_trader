import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerUserDto: RegisterUserDto): Promise<import("./dto/registered-user.dto").RegisteredUserDto>;
    login(loginUserDto: LoginUserDto): Promise<import("./dto/session.dto").SessionDto>;
    resumeSession(authorization?: string): Promise<import("./dto/session.dto").SessionDto>;
    logout(authorization?: string): Promise<{
        success: true;
    }>;
    private extractToken;
}
