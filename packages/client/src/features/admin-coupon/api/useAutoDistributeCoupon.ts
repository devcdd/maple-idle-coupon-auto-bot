import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/lib/axiosInstance';

export interface AutoDistributeResult {
  message: string;
  totalCharacters: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    characterId: string;
    success: boolean;
    message: string;
  }>;
}

export const useAutoDistributeCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId: string): Promise<AutoDistributeResult> => {
      const response = await axiosInstance.post(
        `/admin/auto-coupon/${couponId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // 성공 후 쿠폰 리스트를 다시 가져옴
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
};
