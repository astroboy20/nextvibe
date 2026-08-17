"use client";

import { useEffect, useMemo, useState } from "react";
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
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  useCreatePayoutAccountMutation,
  useGetSupportedPayoutOptionsQuery,
  useGetBanksQuery,
  useLazyResolveAccountQuery,
  type PayoutRail,
} from "@/app/provider/api/payoutApi";
import { COUNTRIES, currencyForCountry } from "@/utils/countries";

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

/**
 * Nigerian bank details are handled by a dedicated block rather than the
 * generic field loop: the bank is a picker (which is what makes the bank code
 * unnecessary to type), and the account number drives a lookup. These keys are
 * therefore excluded from the generic renderer.
 */
const NG_HANDLED_KEYS = new Set(["accountNumber", "bankCode", "bankName"]);

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

  const isNigerian = rail === "NIGERIAN_BANK";

  // Bank list is only needed for the Nigerian flow — skip the request otherwise.
  const { data: banksData, isLoading: loadingBanks } = useGetBanksQuery(undefined, {
    skip: !isNigerian,
  });
  const banks = useMemo(() => banksData?.data ?? [], [banksData]);

  const [resolveAccount, { data: resolved, isFetching: isResolving, error: resolveError }] =
    useLazyResolveAccountQuery();

  const currencies = supported?.data?.currencies ?? [];
  // Memoised so the `selectedRail` lookup below doesn't see a fresh array
  // identity on every render.
  const rails = useMemo(() => supported?.data?.rails ?? [], [supported]);

  const selectedRail = useMemo(
    () => rails.find((r) => r.rail === rail),
    [rails, rail],
  );

  const accountNumber = details.accountNumber ?? "";
  const bankCode = details.bankCode ?? "";
  const canResolve = isNigerian && /^\d{10}$/.test(accountNumber) && Boolean(bankCode);

  /**
   * Look the account up once both halves are present.
   *
   * An effect is the right tool here despite the usual "you might not need an
   * effect" rule: this synchronises with an external system, and the trigger is
   * two fields being jointly complete rather than any single event. Keyed on
   * the pair so editing either one re-runs it, and only one lookup happens per
   * distinct pair.
   */
  useEffect(() => {
    if (!canResolve) return;
    resolveAccount({ accountNumber, bankCode });
  }, [canResolve, accountNumber, bankCode, resolveAccount]);

  const resolvedName =
    canResolve && !isResolving && !resolveError
      ? resolved?.data?.accountName
      : undefined;

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

    /**
     * The rail's defaults win, unconditionally.
     *
     * These used to be guarded with `if (!currency)` / `if (!country)`, so they
     * only ever applied to the *first* rail picked. Choosing "Nigerian bank"
     * and then switching to "US bank account (ACH)" left the form on Nigeria
     * and NGN — a US ACH account described as Nigerian, in naira. Picking a
     * rail is a strong statement about where the money lands, so it has to
     * override what the previous rail implied.
     */
    const railCurrency = RAIL_DEFAULT_CURRENCY[next];
    if (railCurrency) setCurrency(railCurrency);

    /**
     * Cleared rather than left stale for rails that span countries — SEPA,
     * Wise, PayPal, SWIFT, mobile money. Carrying the old country over would
     * silently attach the wrong one to the new account details; an empty field
     * forces a deliberate choice instead.
     */
    setCountry(RAIL_DEFAULT_COUNTRY[next] ?? "");
  };

  /**
   * Changing the country moves the currency with it — an organizer picking
   * Ghana should not be left looking at NGN. Only when we know the country's
   * currency and the platform actually supports it; otherwise the existing
   * choice stands rather than being cleared.
   */
  const handleCountryChange = (value: string) => {
    setCountry(value);
    const next = currencyForCountry(value);
    if (next && currencies.some((c) => c.code === next)) {
      setCurrency(next);
    }
  };

  /**
   * Client-side mirror of the backend's per-rail checks. The server remains the
   * source of truth — this just catches the typo before a round trip.
   */
  const clientValidate = (): string | null => {
    if (!rail) return "Choose how you want to be paid";
    if (!currency) return "Choose a currency";
    if (!/^[A-Za-z]{2}$/.test(country)) return "Choose the bank's country";

    // Nigerian accounts take their name from the bank, so there is nothing for
    // the organizer to type — but the lookup has to have succeeded.
    if (isNigerian) {
      if (!bankCode) return "Choose your bank";
      if (!/^\d{10}$/.test(accountNumber))
        return "A Nigerian account number is exactly 10 digits";
      if (isResolving) return "Still checking that account — one moment";
      if (!resolvedName)
        return "We couldn't verify that account. Check the number and the bank.";
    } else if (accountName.trim().length < 2) {
      return "Enter the name on the account";
    }

    for (const key of selectedRail?.requiredFields ?? []) {
      if (!details[key]?.trim()) {
        return `${FIELD_META[key]?.label ?? key} is required`;
      }
    }

    const d = details;
    switch (rail) {
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
        // Sent for the record, but the server re-resolves Nigerian accounts and
        // uses the bank's answer — this is never the trusted value.
        accountName: isNigerian ? resolvedName : accountName.trim(),
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
                    <Label className="text-xs font-medium">Bank country</Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      {/* Capped — this is the full ISO country list. */}
                      <SelectContent className="max-h-64">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                </div>

                {/* ── Nigerian accounts: pick a bank, then we verify the number ── */}
                {isNigerian ? (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Bank</Label>
                      <Select
                        value={bankCode}
                        onValueChange={(code) => {
                          const bank = banks.find((b) => b.code === code);
                          setDetails((d) => ({
                            ...d,
                            bankCode: code,
                            bankName: bank?.name ?? "",
                          }));
                        }}
                        disabled={loadingBanks}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue
                            placeholder={loadingBanks ? "Loading banks…" : "Choose your bank"}
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {banks.map((b) => (
                            <SelectItem key={b.code} value={b.code}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="accountNumber" className="text-xs font-medium">
                        Account number
                      </Label>
                      <Input
                        id="accountNumber"
                        placeholder="0123456789"
                        inputMode="numeric"
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) =>
                          setDetails((d) => ({
                            ...d,
                            accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                          }))
                        }
                        className="rounded-xl"
                      />
                    </div>

                    {/* Verification result — this replaces typing a name. */}
                    {canResolve && (
                      <div
                        className={
                          "flex items-start gap-2 rounded-xl border p-3 " +
                          (isResolving
                            ? "border-border bg-muted/50"
                            : resolvedName
                              ? "border-emerald-600/30 bg-emerald-600/5"
                              : "border-destructive/30 bg-destructive/5")
                        }
                      >
                        {isResolving ? (
                          <>
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              Checking that account with the bank…
                            </p>
                          </>
                        ) : resolvedName ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Account name
                              </p>
                              <p className="text-sm font-semibold break-words">
                                {resolvedName}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Confirmed by your bank. If this isn&apos;t you, check the
                                number and bank.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                            <p className="text-xs text-destructive">
                              {(resolveError as { data?: { error?: { message?: string } } })
                                ?.data?.error?.message ??
                                "We couldn't verify that account. Check the number and the bank."}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
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
                )}

                {/* Rail-specific fields, driven entirely by the backend's
                    requiredFields/optionalFields — no hardcoded per-country forms.
                    Nigerian bank fields are handled by the block above. */}
                {[
                  ...(selectedRail?.requiredFields ?? []),
                  ...(selectedRail?.optionalFields ?? []),
                ]
                  .filter((key) => !(isNigerian && NG_HANDLED_KEYS.has(key)))
                  .map((key) => {
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
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl"
                    disabled={isSaving || (isNigerian && (isResolving || !resolvedName))}
                  >
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
