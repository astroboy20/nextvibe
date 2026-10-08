"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeOff, Eye } from "lucide-react";
import { useState } from "react";

const PasswordField = ({
  name,
  label,
  placeholder,
  control,
}: {
  name: "password" | "confirmPassword";
  label: string;
  placeholder: string;
  control: any;
}) => {
  const [show, setShow] = useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                className="h-11 rounded-lg border-gray-300 pr-10 focus-visible:ring-[#5B1A57]"
                {...field}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PasswordField;