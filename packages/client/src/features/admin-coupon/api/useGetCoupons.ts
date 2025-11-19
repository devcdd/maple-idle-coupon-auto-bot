import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/lib/axiosInstance';

export interface Coupon {
  id: string;
  name: string;
  createdAt: string;
}

export const useGetCoupons = () => {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async (): Promise<Coupon[]> => {
      const response = await axiosInstance.get('/admin/coupons');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
