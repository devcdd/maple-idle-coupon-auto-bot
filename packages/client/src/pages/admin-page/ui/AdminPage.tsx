import React from 'react';
import { CouponList } from '@/features/admin-coupon';
import { CouponRegisterForm } from '@/features/admin-coupon-register';

export const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
          <p className="mt-2 text-gray-600">쿠폰 관리 및 배포</p>
        </div>

        <CouponRegisterForm />
        <CouponList />
      </div>
    </div>
  );
};
