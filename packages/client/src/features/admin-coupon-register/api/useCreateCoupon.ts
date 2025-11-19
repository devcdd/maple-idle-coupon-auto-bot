import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/lib/axiosInstance';

export interface CreateCouponRequest {
  name: string;
}

export interface CreateCouponResponse {
  id: string;
  name: string;
  createdAt: string;
}

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: CreateCouponRequest): Promise<CreateCouponResponse> => {
      const response = await axiosInstance.post('/coupons', couponData);
      return response.data;
    },
    onSuccess: () => {
      // 성공 후 쿠폰 리스트를 다시 가져옴
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });
};

