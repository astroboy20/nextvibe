export interface ICoupon {
  _id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  minOrderValue?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateCouponInput {
  code?: string; // Optional custom code
  discountType: "fixed" | "percentage";
  discountValue: number;
  expiresAt: Date | string;
  usageLimit: number;
  minOrderValue?: number;
}

export interface IApplyCouponInput {
  code: string;
  cartTotal: number;
}

export interface IApplyCouponResponse {
  status: string;
  data: {
    _id: string;
    code: string;
    discountType: "fixed" | "percentage";
    discountValue: number;
    expiresAt: Date | string;
    usageLimit: number;
    usedCount: number;
    active: true;
    createdAt:  Date | string;
    updatedAt:  Date | string;
    __v: 0;
  };
}
