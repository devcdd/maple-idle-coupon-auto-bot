import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Request } from 'express';
import { UserService } from '../supabase/user';
import {
  KakaoCallbackDto,
  KakaoResponse,
  AuthResponseDto,
  AuthUser,
} from '../dto/kakao-callback.dto';
import { JwtPayload } from '../types';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async handleKakaoCallback(
    callbackDto: KakaoCallbackDto,
    request: Request,
  ): Promise<AuthResponseDto> {
    try {
      // 1. 인가 코드로 액세스 토큰 교환
      const tokenResponse = await this.exchangeCodeForToken(
        callbackDto.code,
        request,
      );

      // 2. 액세스 토큰으로 사용자 정보 조회
      const userInfo = await this.getKakaoUserInfo(tokenResponse.access_token);

      // 3. 사용자 정보 처리 및 JWT 토큰 생성
      const authResponse = await this.processUserLogin(userInfo);

      return authResponse;
    } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error);
      throw new HttpException(
        '카카오 로그인 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exchangeCodeForToken(
    code: string,
    request: Request,
  ): Promise<{
    access_token: string;
    token_type: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }> {
    const kakaoClientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const kakaoClientSecret = this.configService.get<string>(
      'KAKAO_CLIENT_SECRET',
    );

    // 요청의 origin을 사용해서 동적으로 redirectUri 생성
    const origin = request.headers.origin || `https://${request.headers.host}`;
    const redirectUri = `${origin}/auth/callback/kakao`;

    if (!kakaoClientId || !kakaoClientSecret || !redirectUri) {
      throw new Error('카카오 OAuth 설정이 올바르지 않습니다.');
    }

    try {
      const tokenUrl = 'https://kauth.kakao.com/oauth/token';

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoClientId,
        client_secret: kakaoClientSecret,
        redirect_uri: redirectUri,
        code: code,
      });

      // 디버깅: 요청 정보 출력
      console.log('=== 카카오 토큰 교환 요청 정보 ===');
      console.log('Token URL:', tokenUrl);
      console.log('Client ID:', kakaoClientId ? '설정됨' : '없음');
      console.log('Client Secret:', kakaoClientSecret ? '설정됨' : '없음');
      console.log('Redirect URI:', redirectUri);
      console.log('Authorization Code:', code ? '있음' : '없음');
      console.log('Params:', params.toString());

      const response = await axios.post<KakaoTokenResponse>(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('카카오 토큰 교환 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      console.error('에러 메시지:', error.message);
      throw new HttpException(
        '인가 코드를 액세스 토큰으로 교환하는 중 오류가 발생했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getKakaoUserInfo(accessToken: string): Promise<KakaoResponse> {
    try {
      const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(
        '카카오 API 원본 응답:',
        JSON.stringify(response.data, null, 2),
      );

      // 카카오 API 응답을 우리가 사용하는 형식으로 변환
      const kakaoId = response.data.id.toString();
      const userInfo: KakaoResponse = {
        userId: `kakao_${kakaoId}`,
        nickname:
          response.data.kakao_account?.profile?.nickname || '카카오 사용자',
        email: response.data.kakao_account?.email || null,
        profileImageUrl:
          response.data.kakao_account?.profile?.profile_image_url || null,
        provider: 'kakao',
        providerId: kakaoId,
      };

      console.log('변환된 사용자 정보:', JSON.stringify(userInfo, null, 2));
      return userInfo;
    } catch (error: any) {
      console.error('카카오 사용자 정보 조회 실패:', error);
      throw new HttpException(
        '카카오 사용자 정보를 조회하는 중 오류가 발생했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async processUserLogin(
    userInfo: KakaoResponse,
  ): Promise<AuthResponseDto> {
    try {
      // 디버깅: 실제 카카오 응답 확인
      console.log('카카오 사용자 정보:', JSON.stringify(userInfo, null, 2));

      // 데이터베이스에서 사용자 조회 (없으면 자동 생성)
      const dbUser = await this.userService.getUserByUserId(userInfo.userId);

      if (!dbUser) {
        throw new Error('유저 조회/생성 실패');
      }

      console.log('사용자 정보:', JSON.stringify(dbUser, null, 2));

      // AuthUser 타입으로 변환 (관리자 권한 포함)
      const user: AuthUser = {
        userId: dbUser.userId,
        provider: dbUser.provider,
        nickname: dbUser.nickname,
        isAdmin: await this.userService.isUserAdmin(dbUser.userId),
      };

      // JWT 토큰 생성
      const payload = {
        sub: dbUser.userId,
        userId: dbUser.userId,
        provider: dbUser.provider,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '30d', // refresh token은 30일
      });

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
        message: '로그인 성공',
      };
    } catch (error) {
      console.error('사용자 로그인 처리 실패:', error);
      throw new HttpException(
        '사용자 정보를 처리하는 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 토큰 갱신
   * refreshToken을 검증하여 새로운 accessToken과 refreshToken을 발급
   */
  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // refreshToken 검증
      const payload = this.jwtService.verify(refreshToken) as JwtPayload;

      // 사용자 존재 확인
      const user = await this.userService.getUserByUserId(payload.userId);
      if (!user) {
        throw new HttpException(
          '사용자를 찾을 수 없습니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 새로운 토큰 생성
      const newPayload = {
        sub: user.userId,
        userId: user.userId,
        provider: user.provider,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h', // 테스트용: 1분 (운영시는 1h로 변경)
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '30d',
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw new HttpException(
        '토큰 갱신에 실패했습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * JWT 토큰에서 사용자 정보 추출 (미들웨어용)
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token) as JwtPayload;
      const user = await this.userService.getUserByUserId(payload.userId);

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      return {
        userId: user.userId,
        provider: user.provider,
        nickname: user.nickname,
      };
    } catch (error) {
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }
}
