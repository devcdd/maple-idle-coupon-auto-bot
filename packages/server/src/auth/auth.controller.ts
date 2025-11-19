import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { KakaoCallbackDto, AuthResponseDto } from '../dto/kakao-callback.dto';
import { UpdateNicknameDto } from '../dto/create-user.dto';
import { UserService } from '../supabase/user';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('kakao/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '카카오 OAuth 콜백',
    description:
      '카카오 OAuth 인가 코드를 받아 사용자 정보를 조회하고 로그인 처리합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async kakaoCallback(
    @Body() callbackDto: KakaoCallbackDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.handleKakaoCallback(
      callbackDto,
      request,
    );

    // RefreshToken을 응답 헤더에 추가 (프론트엔드에서 쿠키로 저장)
    response.setHeader('x-refresh-token', authResponse.refreshToken);

    return authResponse;
  }

  @Patch('user/:userId/nickname')
  @ApiOperation({
    summary: '사용자 닉네임 업데이트',
    description: '특정 사용자의 닉네임을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '닉네임 업데이트 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async updateNickname(
    @Param('userId') userId: string,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ) {
    return this.userService.updateUserNickname(
      userId,
      updateNicknameDto.nickname,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토큰 갱신',
    description:
      'Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '토큰이 갱신되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '유효하지 않은 Refresh Token',
  })
  async refreshTokens(@Req() request: Request, @Res() response: Response) {
    try {
      console.log('🔄 Refresh API 호출됨');
      console.log('🍪 요청 쿠키:', request.cookies);
      console.log('🍪 Refresh Token 쿠키:', request.cookies?.refreshToken);

      // 쿠키에서 refreshToken 가져오기
      const refreshToken = request.cookies?.refreshToken;

      if (!refreshToken) {
        return response.status(401).json({
          success: false,
          message: 'Refresh Token이 없습니다.',
        });
      }

      // 새로운 토큰 발급
      const tokens = await this.authService.refreshTokens(refreshToken);

      // 응답 헤더에 새로운 토큰 추가 (프론트엔드에서 자동 처리)
      response.setHeader('x-access-token', tokens.accessToken);
      response.setHeader('x-refresh-token', tokens.refreshToken);

      return response.json({
        success: true,
        message: '토큰이 갱신되었습니다.',
        accessToken: tokens.accessToken, // body에도 토큰 포함 (헤더 + body 이중 보장)
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return response.status(401).json({
        success: false,
        message: '토큰 갱신에 실패했습니다.',
      });
    }
  }
}
