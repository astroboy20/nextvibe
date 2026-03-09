/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GAMIFICATION_PRICING,
  PROMOTION_PRICING,
} from "@/app/constants/pricing";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { resetForm, setStep } from "@/app/provider/slices/eventformslice";
import { toast } from "sonner";
import { useCreateEventMutation } from "@/app/provider/api/eventApi";
import { useLazyVerifyCouponQuery } from "@/app/provider/api/couponApi";
import Image from "next/image";

function LineItem({
  name,
  value,
  highlight = false,
  isDiscount = false,
}: {
  name: string;
  value: any;
  highlight?: boolean;
  isDiscount?: boolean;
}) {
  const isNumeric = typeof value === "number";
  const formatted = isNumeric ? `₦${value.toLocaleString()}` : String(value);

  return (
    <div className="flex items-center justify-between py-2">
      <span
        className={`text-sm ${
          highlight
            ? "font-semibold text-gray-900"
            : "font-medium text-gray-600"
        }`}
      >
        {name}
      </span>
      <span
        className={`text-sm font-semibold ${
          isDiscount
            ? "text-emerald-600"
            : highlight
            ? "text-[#5B1A57]"
            : "text-gray-800"
        }`}
      >
        {formatted}
      </span>
    </div>
  );
}

export default function StepSix() {
  const data = useSelector((state: RootState) => state.eventForm.data);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("UNILAG56THCONVOCATION");
  const [discount, setDiscount] = useState<{
    amount: number;
    code: string;
  } | null>(null);
  const [config, setConfig] = useState({
    promotion: 0,
    gamification: 0,
    total: 0,
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [verifyCoupon, { isLoading: couponLoading }] =
    useLazyVerifyCouponQuery();

  const promoPrice = PROMOTION_PRICING[data.numberOfAttendees]?.priceNGN ?? 0;
  const gamificationUnitPrice =
    GAMIFICATION_PRICING[data.numberOfAttendees]?.priceNGN ?? 0;

  useEffect(() => {
    if (!data) {
      setConfig({ promotion: 0, gamification: 0, total: 0 });
      return;
    }

    const promoVal = data.promoteEvent ? promoPrice : 0;

    const preRounds = Array.isArray(data.activities?.preEvent?.games)
      ? data.activities.preEvent.games.length
      : 0;
    const duringRounds =
      Array.isArray(data.activities?.duringEvent?.games)
        ? data.activities.duringEvent.games.length
        : 0;
    const gamificationTotal =
      gamificationUnitPrice * (preRounds + duringRounds);
    const total = promoVal + gamificationTotal;

    setConfig({ promotion: promoVal, gamification: gamificationTotal, total });
  }, [data, promoPrice, gamificationUnitPrice]);

  const handleVerifyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await verifyCoupon({
        code: couponCode,
        cartTotal: config.total,
      }).unwrap();
      let discountAmount = 0;
      if (result.data.discountType === "percentage") {
        discountAmount = (config.total * result.data.discountValue) / 100;
      } else if (result.data.discountType === "fixed") {
        discountAmount = result.data.discountValue;
      }
      setDiscount({ amount: discountAmount, code: result.data.code });
      setConfig((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - discountAmount),
      }));
      toast.success("Coupon applied successfully!");
    } catch {
      toast.error("Invalid coupon code");
    }
  };

  useEffect(() => {
    handleVerifyCoupon();
  }, []);

  const handleSubmit = async () => {
    try {
      const formData = {
        ...data,
        flier: data.flier as unknown as File | undefined,
        promotionalVideo: data.promotionalVideo as unknown as File | undefined,
        isIncentivized: data.eventType === "incentivized",
        maxCapacity: parseInt(data.numberOfAttendees),
        isPromoted: data.promoteEvent,
        backdrop: data.backdrop as unknown as File | undefined,
        allowSponsorship: data.allowSponsorship,
        isPublic: data.isPublic ?? true,
        requiresApproval: data.requiresApproval ?? false,
        location: {
          name: data.location,
          coordinates: {
            latitude: data.coordinates.lat,
            longitude: data.coordinates.lon,
          },
        },
        eventMode: data.eventMode,
        price: Number(data.price) || 0,
        ticketLink: undefined,
        gamification: data.activities ?? undefined,
        customInviteMessage: data.customInviteMessage,
        automatedReminders: data.automatedReminders,
      };

      const response = await createEvent(formData as any).unwrap();
      const eventId = response.data.id;

      toast.success("Event created successfully!");
      setCreatedEventId(eventId);
      setShowSuccessModal(true);
      localStorage.removeItem("formData");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create event");
    }
  };

  const handlePaymentSuccess = (_ref: any) => {
    setIsPaymentSuccess(true);
    handleSubmit();
  };

  const handleModalClick = () => {
    setShowSuccessModal(false);
    dispatch(resetForm());
    router.replace(`/event/${createdEventId}`);
  };

  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* ── Order summary card ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-700 mb-1">
          Order Summary
        </p>

        {data.promoteEvent && (
          <LineItem name="Promotion" value={config.promotion} />
        )}
        <LineItem name="Gamification" value={config.gamification} />

        {discount && (
          <LineItem
            name={`Discount (${
              discount.amount >= 100
                ? `₦${discount.amount.toLocaleString()}`
                : `${discount.amount}%`
            })`}
            value={`-₦${discount.amount.toLocaleString()}`}
            isDiscount
          />
        )}

        <Separator className="my-2" />
        <LineItem name="Total" value={config.total} highlight />

        {/* Coupon */}
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={couponLoading || !!discount}
              className="pl-9 h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
            />
          </div>
          <Button
            type="button"
            onClick={handleVerifyCoupon}
            disabled={couponLoading || !!discount}
            className="h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg px-5 shrink-0 transition-colors"
          >
            {couponLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>

      {/* ── Payment gateway ── */}
      {/* {config.total > 0 && !isPaymentSuccess && user && (
        <ErcaspayPayment
          amount={config.total}
          description="Event Creation Fees"
          onSuccess={handlePaymentSuccess}
          disabled={isCreating || couponLoading}
        />
      )} */}

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isCreating || couponLoading}
          className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors"
        >
          {isCreating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating event...
            </span>
          ) : (
            "Create Event"
          )}
        </Button>

        {/* Fixed: was `onClick={() => setStep(5)}` — setStep is an action creator, needs dispatch */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => dispatch(setStep(5))}
          className="w-full h-11 text-gray-700 hover:text-gray-900 font-medium"
        >
          Back
        </Button>
      </div>

      {/* ── Success modal ── */}
      <Dialog open={showSuccessModal} onOpenChange={handleModalClick}>
        <DialogContent className="rounded-2xl max-w-sm text-center px-6 py-8">
          <DialogTitle className="sr-only">Event Created</DialogTitle>

          <div className="flex justify-center mb-5">
            <div className="relative w-40 h-40">
              <Image
                src="/smiley.png"
                alt="Success"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <p className="text-xl font-semibold text-gray-900 mb-1">
            Event created successfully!!
          </p>
          <p className="text-sm text-gray-500 mb-7">
            Your event has been added to your event list.
          </p>

          {createdEventId && (
            <Button
              onClick={handleModalClick}
              className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
            >
              Go to Event
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
