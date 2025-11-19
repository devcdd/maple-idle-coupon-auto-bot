import React, { useState } from 'react';
import { useGetCoupons, useAutoDistributeCoupon } from '../index';
import type { AutoDistributeResult } from '../api/useAutoDistributeCoupon';
import type { Coupon } from '../api/useGetCoupons';

export const CouponList: React.FC = () => {
  const { data: coupons, isLoading, error } = useGetCoupons();
  const autoDistributeMutation = useAutoDistributeCoupon();

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [result, setResult] = useState<AutoDistributeResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAutoDistribute = async (coupon: Coupon) => {
    try {
      const result = await autoDistributeMutation.mutateAsync(coupon.name);
      setResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('쿠폰 배포 실패:', error);
      alert('쿠폰 배포에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        쿠폰 리스트를 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">쿠폰 관리</h1>

      {/* 쿠폰 리스트 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">쿠폰 리스트</h2>

        {coupons && coupons.length > 0 ? (
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCoupon?.id === coupon.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCoupon(coupon)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{coupon.name}</h3>
                    <p className="text-sm text-gray-500">
                      생성일: {new Date(coupon.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAutoDistribute(coupon);
                    }}
                    disabled={autoDistributeMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {autoDistributeMutation.isPending
                      ? '배포 중...'
                      : '자동 배포'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">등록된 쿠폰이 없습니다.</p>
        )}
      </div>

      {/* 배포 결과 모달 */}
      {showResult && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">쿠폰 배포 결과</h3>
                <button
                  onClick={() => setShowResult(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-green-600 font-medium">{result.message}</p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>총 캐릭터 수: {result.totalCharacters}</p>
                  <p>성공: {result.successCount}</p>
                  <p>실패: {result.failureCount}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">상세 결과</h4>
                <div className="max-h-60 overflow-y-auto">
                  {result.results.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 mb-1 rounded text-sm ${
                        item.success
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className="font-medium">{item.characterId}:</span>{' '}
                      {item.message}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowResult(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
