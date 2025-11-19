import React, { useState } from 'react';
import { useCreateCoupon } from '../api/useCreateCoupon';

export const CouponRegisterForm: React.FC = () => {
  const [couponName, setCouponName] = useState('');
  const createCouponMutation = useCreateCoupon();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponName.trim()) {
      alert('쿠폰 이름을 입력해주세요.');
      return;
    }

    try {
      await createCouponMutation.mutateAsync({ name: couponName.trim() });
      alert('쿠폰이 성공적으로 등록되었습니다!');
      setCouponName('');
    } catch (error) {
      console.error('쿠폰 등록 실패:', error);
      alert('쿠폰 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">새 쿠폰 등록</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-2">
            쿠폰 이름
          </label>
          <input
            type="text"
            id="couponName"
            value={couponName}
            onChange={(e) => setCouponName(e.target.value)}
            placeholder="예: discount_coupon"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={createCouponMutation.isPending}
          />
          <p className="text-sm text-gray-500 mt-1">
            쿠폰 이름은 영문, 숫자, 언더스코어(_)만 사용할 수 있습니다.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createCouponMutation.isPending || !couponName.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {createCouponMutation.isPending ? '등록 중...' : '쿠폰 등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

