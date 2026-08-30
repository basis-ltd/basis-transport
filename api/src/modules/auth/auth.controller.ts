import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  Public,
  SkipRegistrationCheck,
  CurrentUser,
} from '../../common/decorators/auth.decorators';
import { AuthenticatedUser } from '../../common/types/auth.types';
import {
  CompleteRegistrationDto,
  ForgotPasswordDto,
  LoginDto,
  PhonePrecheckDto,
  ResetPasswordDto,
  SendPhoneOtpDto,
  SignupDto,
  VerifyPhoneOtpDto,
  VerifyPhoneResetOtpDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(201)
  async signup(@Body() body: SignupDto) {
    const { user, token } = await this.authService.signup(body);
    return {
      message: 'User registered successfully',
      data: { user, token },
    };
  }

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { user, token } = await this.authService.login(body);
    return {
      message: 'User logged in successfully',
      data: { user, token },
    };
  }

  @Public()
  @Post('phone/precheck')
  async phoneLoginPrecheck(@Body() body: PhonePrecheckDto) {
    const data = await this.authService.phoneLoginPrecheck(body);
    return {
      message: 'Phone login precheck completed',
      data,
    };
  }

  @Public()
  @Post('phone/send-otp')
  async sendPhoneOtp(@Body() body: SendPhoneOtpDto) {
    const data = await this.authService.sendPhoneOtp(body);
    return {
      message: 'OTP sent successfully',
      data,
    };
  }

  @Public()
  @Post('phone/verify-otp')
  async verifyPhoneOtp(@Body() body: VerifyPhoneOtpDto) {
    const { user, token, mustCompleteRegistration } =
      await this.authService.verifyPhoneOtp(body);
    return {
      message: 'OTP verified successfully',
      data: { user, token, mustCompleteRegistration },
    };
  }

  @Public()
  @Post('phone/reset/send-otp')
  async sendPhoneResetOtp(@Body() body: SendPhoneOtpDto) {
    const data = await this.authService.sendPhoneResetOtp(body);
    return {
      message:
        'If an account exists for this phone number, a reset code was sent.',
      data,
    };
  }

  @Public()
  @Post('phone/reset/verify-otp')
  async verifyPhoneResetOtp(@Body() body: VerifyPhoneResetOtpDto) {
    const data = await this.authService.verifyPhoneResetOtp(body);
    return {
      message: 'Reset code verified successfully',
      data,
    };
  }

  @SkipRegistrationCheck()
  @Post('complete-registration')
  async completeRegistration(
    @Body() body: CompleteRegistrationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const result = await this.authService.completeRegistration(body, user.id);
    return {
      message: 'Registration completed successfully',
      data: result,
    };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
