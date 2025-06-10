// hooks/useAuthRole.ts
import { useAuthStore } from '@/store/authStore';

export const useAuthRole = () => {
  return useAuthStore((state) => state.user?.role);
};
// dùng để phân quyền role