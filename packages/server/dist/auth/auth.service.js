'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthService = void 0;
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const jwt_1 = require('@nestjs/jwt');
const axios_1 = __importDefault(require('axios'));
const user_1 = require('../supabase/user');
let AuthService = class AuthService {
  configService;
  userService;
  jwtService;
  constructor(configService, userService, jwtService) {
    this.configService = configService;
    this.userService = userService;
    this.jwtService = jwtService;
  }
  async handleKakaoCallback(callbackDto, request) {
    try {
      const tokenResponse = await this.exchangeCodeForToken(
        callbackDto.code,
        request,
      );
      const userInfo = await this.getKakaoUserInfo(tokenResponse.access_token);
      const authResponse = await this.processUserLogin(userInfo);
      return authResponse;
    } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error);
      throw new common_1.HttpException(
        '카카오 로그인 처리 중 오류가 발생했습니다.',
        common_1.HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async exchangeCodeForToken(code, request) {
    const kakaoClientId = this.configService.get('KAKAO_CLIENT_ID');
    const kakaoClientSecret = this.configService.get('KAKAO_CLIENT_SECRET');
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
      console.log('=== 카카오 토큰 교환 요청 정보 ===');
      console.log('Token URL:', tokenUrl);
      console.log('Client ID:', kakaoClientId ? '설정됨' : '없음');
      console.log('Client Secret:', kakaoClientSecret ? '설정됨' : '없음');
      console.log('Redirect URI:', redirectUri);
      console.log('Authorization Code:', code ? '있음' : '없음');
      console.log('Params:', params.toString());
      const response = await axios_1.default.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response.data;
    } catch (error) {
      console.error('카카오 토큰 교환 실패:', error);
      console.error('에러 응답:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      console.error('에러 메시지:', error.message);
      throw new common_1.HttpException(
        '인가 코드를 액세스 토큰으로 교환하는 중 오류가 발생했습니다.',
        common_1.HttpStatus.BAD_REQUEST,
      );
    }
  }
  async getKakaoUserInfo(accessToken) {
    try {
      const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
      const response = await axios_1.default.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(
        '카카오 API 원본 응답:',
        JSON.stringify(response.data, null, 2),
      );
      const kakaoId = response.data.id.toString();
      const userInfo = {
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
    } catch (error) {
      console.error('카카오 사용자 정보 조회 실패:', error);
      throw new common_1.HttpException(
        '카카오 사용자 정보를 조회하는 중 오류가 발생했습니다.',
        common_1.HttpStatus.BAD_REQUEST,
      );
    }
  }
  async processUserLogin(userInfo) {
    try {
      console.log('카카오 사용자 정보:', JSON.stringify(userInfo, null, 2));
      const dbUser = await this.userService.getUserByUserId(userInfo.userId);
      if (!dbUser) {
        throw new Error('유저 조회/생성 실패');
      }
      console.log('사용자 정보:', JSON.stringify(dbUser, null, 2));
      const user = {
        userId: dbUser.userId,
        provider: dbUser.provider,
        nickname: dbUser.nickname,
        isAdmin: await this.userService.isUserAdmin(dbUser.userId),
      };
      const payload = {
        sub: dbUser.userId,
        userId: dbUser.userId,
        provider: dbUser.provider,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '30d',
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
      throw new common_1.HttpException(
        '사용자 정보를 처리하는 중 오류가 발생했습니다.',
        common_1.HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async refreshTokens(refreshToken) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.getUserByUserId(payload.userId);
      if (!user) {
        throw new common_1.HttpException(
          '사용자를 찾을 수 없습니다.',
          common_1.HttpStatus.UNAUTHORIZED,
        );
      }
      const newPayload = {
        sub: user.userId,
        userId: user.userId,
        provider: user.provider,
      };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
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
      throw new common_1.HttpException(
        '토큰 갱신에 실패했습니다.',
        common_1.HttpStatus.UNAUTHORIZED,
      );
    }
  }
  async validateToken(token) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.getUserByUserId(payload.userId);
      if (!user) {
        throw new common_1.UnauthorizedException('사용자를 찾을 수 없습니다.');
      }
      return {
        userId: user.userId,
        provider: user.provider,
        nickname: user.nickname,
      };
    } catch (error) {
      throw new common_1.UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [
      config_1.ConfigService,
      user_1.UserService,
      jwt_1.JwtService,
    ]),
  ],
  AuthService,
);
//# sourceMappingURL=auth.service.js.map
