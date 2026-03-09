"use client";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";

const ProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
      >
        {children}
      </GoogleOAuthProvider>
    </Provider>
  );
};

export default ProviderWrapper;
