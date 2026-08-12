"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useCreatePayoutAccountMutation,
  useGetSupportedPayoutOptionsQuery,
  type PayoutRail,
} from "@/app/provider/api/payoutApi";

/**
 * Human labels and input hints per rail-specific field name.
 *
 * The backend tells us *which* fields a rail needs; this maps those keys to
 * something a person can read. A key with no entry still renders — it just
 * falls back to the raw key — so a new backend field never breaks the form.
 */
const FIELD_META: Record<
  string,
  { label: string; placeholder?: string; inputMode?: "numeric" | "text"; maxLength?: number; hint?: string }
> = {
  accountNumber: { label: "Account number", placeholder: "0123456789", inputMode: "numeric" },
  bankCode: { label: "Bank code", placeholder: "058", inputMode: "numeric", maxLength: 6 },
  bankName: { label: "Bank name", placeholder: "e.g. GTBank" },
  routingNumber: {
    label: "Routing number",
    placeholder: "021000021",
    inputMode: "numeric",
    maxLength: 9,
    hint: "9 digits, found on the bottom of a check",
  },
  accountType: { label: "Account type", placeholder: "checking" },
  sortCode: { label: "Sort code", placeholder: "12-34-56", maxLength: 8, hint: "6 digits" },
  iban: {
    label: "IBAN",
    placeholder: "DE89 3704 0044 0532 0130 00",
    hint: "We check the IBAN's built-in checksum before saving",
  },
  bic: { label: "BIC (optional)", placeholder: "COBADEFFXXX" },
  swiftBic: { label: "SWIFT / BIC code", placeholder: "COBADEFFXXX", hint: "8 or 11 characters" },
  bankAddress: { label: "Bank address (optional)" },
  intermediaryBic: { label: "Intermediary BIC (optional)" },
  email: { label: "Email", placeholder: "you@example.com" },
  wiseAccountId: { label: "Wise account ID (optional)" },
  phoneNumber: { label: "Phone number", placeholder: "+2348012345678" },
  provider: { label: "Provider", placeholder: "e.g. MTN MoMo" },
};

/** Common ISO country codes, keyed by rail, to prefill sensibly. */
const RAIL_DEFAULT_COUNTRY: Partial<Record<PayoutRail, string>> = {
  NIGERIAN_BANK: "NG",
  US_ACH: "US",
  UK_FASTER_PAYMENTS: "GB",
};

const RAIL_DEFAULT_CURRENCY: Partial<Record<PayoutRail, string>> = {
  NIGERIAN_BANK: "NGN",
  US_ACH: "USD",
  UK_FASTER_PAYMENTS: "GBP",
  SEPA: "EUR",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselect this currency when opened from a "no account for X" prompt. */
  defaultCurrency?: string;
}

export function AddPayoutAccountDialog({ open, onOpenChange, defaultCurrency }: Props) {
  const { data: supported, isLoading: loadingOptions } =
    useGetSupportedPayoutOptionsQuery();
  const [createAccount, { isLoading: isSaving }] = useCreatePayoutAccountMutation();

  const [rail, setRail] = useState<PayoutRail | "">("");
  const [currency, setCurrency] = useState(defaultCurrency ?? "");
  const [country, setCountry] = useState("");
  const [accountName, setAccountName] = useState("");
  const [label, setLabel] = useState("");
  const [details, setDetails] = useState<Record<string, string>>({});

  const currencies = supported?.data?.currencies ?? [];
  // Memoised so the `selectedRail` lookup below doesn't see a fresh array
  // identity on every render.
  const rails = useMemo(() => supported?.data?.rails ?? [], [supported]);

  const selectedRail = useMemo(
    () => rails.find((r) => r.rail === rail),
    [rails, rail],
  );

  const reset = () => {
    setRail("");
    setCurrency(defaultCurrency ?? "");
    setCountry("");
    setAccountName("");
    setLabel("");
    setDetails({});
  };

  const handleRailChange = (value: string) => {
    const next = value as PayoutRail;
    setRail(next);
    // Clear details — the previous rail's fields don't apply to the new one.
    setDetails({});
    if (!currency && RAIL_DEFAULT_CURRENCY[next]) {
      setCurrency(RAIL_DEFAULT_CURRENCY[next]!);
    }
    if (!country && RAIL_DEFAULT_COUNTRY[next]) {
      setCountry(RAIL_DEFAULT_COUNTRY[next]!);
    }
  };

  /**
   * Client-side mirror of the backend's per-rail checks. The server remains the
   * source of truth — this just catches the typo before a round trip.
   */
  const clientValidate = (): string | null => {
    if (!rail) return "Choose how you want to be paid";
    if (!currency) return "Choose a currency";
    if (!/^[A-Za-z]{2}$/.test(country)) return "Country must be a 2-letter code, e.g. NG";
    if (accountName.trim().length < 2) return "Enter the name on the account";

    for (const key of selectedRail?.requiredFields ?? []) {
      if (!details[key]?.trim()) {
        return `${FIELD_META[key]?.label ?? key} is required`;
      }
    }

    const d = details;
    switch (rail) {
      case "NIGERIAN_BANK":
        if (!/^\d{10}$/.test(d.accountNumber ?? ""))
          return "A Nigerian account number is exactly 10 digits";
        break;
      case "US_ACH":
        if (!/^\d{9}$/.test(d.routingNumber ?? ""))
          return "A US routing number is exactly 9 digits";
        if (!["checking", "savings"].includes((d.accountType ?? "").toLowerCase()))
          return "Account type must be checking or savings";
        break;
      case "UK_FASTER_PAYMENTS":
        if (!/^\d{6}$/.test((d.sortCode ?? "").replace(/[-\s]/g, "")))
          return "A UK sort code is 6 digits";
        if (!/^\d{8}$/.test(d.accountNumber ?? ""))
          return "A UK account number is 8 digits";
        break;
      case "SEPA":
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test((d.iban ?? "").replace(/[\s-]/g, "").toUpperCase()))
          return "That doesn't look like a valid IBAN";
        break;
      case "WISE":
      case "PAYPAL":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email ?? ""))
          return "Enter a valid email address";
        break;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = clientValidate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await createAccount({
        rail: rail as PayoutRail,
        currency: currency.toUpperCase(),
        country: country.toUpperCase(),
        accountName: accountName.trim(),
        label: label.trim() || undefined,
        details,
      }).unwrap();

      toast.success("Payout account added");
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      // The backend returns specific, useful messages (checksum failures, wrong
      // digit counts) — surface them rather than a generic failure.
      const e = err as { data?: { error?: { message?: string }; message?: string } };
      toast.error(
        e?.data?.error?.message ?? e?.data?.message ?? "Couldn't add that account",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a payout account</DialogTitle>
          <DialogDescription>
            Where should we send your money? Nigerian and international accounts
            are both supported.
          </DialogDescription>
        </DialogHeader>

        {loadingOptions ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">How do you want to be paid?</Label>
              <Select value={rail} onValueChange={handleRailChange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a payout method" />
                </SelectTrigger>
                <SelectContent>
                  {rails.map((r) => (
                    <SelectItem key={r.rail} value={r.rail}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rail && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.symbol} {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-medium">
                      Bank country
                    </Label>
                    <Input
                      id="country"
                      placeholder="NG"
                      value={country}
                      onChange={(e) =>
                        setCountry(e.target.value.toUpperCase().slice(0, 2))
                      }
                      className="rounded-xl uppercase"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accountName" className="text-xs font-medium">
                    Name on the account
                  </Label>
                  <Input
                    id="accountName"
                    placeholder="e.g. Jane Doe"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Must match your bank records exactly, or the transfer will bounce.
                  </p>
                </div>

                {/* Rail-specific fields, driven entirely by the backend's
                    requiredFields/optionalFields — no hardcoded per-country forms. */}
                {[
                  ...(selectedRail?.requiredFields ?? []),
                  ...(selectedRail?.optionalFields ?? []),
                ].map((key) => {
                  const meta = FIELD_META[key];
                  const isRequired = selectedRail?.requiredFields.includes(key);

                  if (key === "accountType") {
                    return (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs font-medium">
                          {meta?.label ?? key}
                        </Label>
                        <Select
                          value={details[key] ?? ""}
                          onValueChange={(v) =>
                            setDetails((d) => ({ ...d, [key]: v }))
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Choose one" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={key} className="text-xs font-medium">
                        {meta?.label ?? key}
                        {!isRequired && !meta?.label?.includes("optional") && (
                          <span className="text-muted-foreground"> (optional)</span>
                        )}
                      </Label>
                      <Input
                        id={key}
                        placeholder={meta?.placeholder}
                        inputMode={meta?.inputMode}
                        maxLength={meta?.maxLength}
                        value={details[key] ?? ""}
                        onChange={(e) =>
                          setDetails((d) => ({ ...d, [key]: e.target.value }))
                        }
                        className="rounded-xl"
                      />
                      {meta?.hint && (
                        <p className="text-[11px] text-muted-foreground">{meta.hint}</p>
                      )}
                    </div>
                  );
                })}

                <div className="space-y-1.5">
                  <Label htmlFor="label" className="text-xs font-medium">
                    Nickname (optional)
                  </Label>
                  <Input
                    id="label"
                    placeholder="e.g. My GTBank account"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-muted/50 border border-border p-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground">
                    We only ever show the last 4 digits of this account back to you.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => onOpenChange(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save account"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
