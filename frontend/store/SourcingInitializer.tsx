"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useSourcingStore } from "./useSourcingStore";

export function SourcingInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  const [guestId, setGuestId] = useState<string>("");

  const setCountry = useSourcingStore(state => state.setCountry);
  const setCurrency = useSourcingStore(state => state.setCurrency);
  
  const activeHistoryId = useSourcingStore(state => state.activeHistoryId);
  const fetchSessionAndHydrate = useSourcingStore(state => state.fetchSessionAndHydrate);
  const handleResetLocal = useSourcingStore(state => state.handleResetLocal);

  // 1. Manage Guest ID
  useEffect(() => {
    let id = localStorage.getItem("workflow_guest_uuid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("workflow_guest_uuid", id);
    }
    setGuestId(id);
  }, []);

  const activeUserId = guestId || "default_session";

  // 2. Location and Currency Detection (IP based)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const persistedCountry = Cookies.get("workflow_country");
      const persistedCurrency = Cookies.get("workflow_currency");

      if (!persistedCountry && !persistedCurrency) {
        const detectLocation = async () => {
          let countryCode: string | null = null;
          try {
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
              const data = await res.json();
              if (data.country_code) {
                countryCode = data.country_code.toUpperCase();
              }
            }
          } catch (err) {
            console.warn("Location detection failed.", err);
          }

          if (countryCode) {
            setCountry(countryCode);
            if (countryCode === "LK") {
              setCurrency("LKR");
            } else {
              setCurrency("USD");
            }
          } else {
            setCountry("LK");
            setCurrency("LKR");
          }
        };
        detectLocation();
      }
    }
  }, [setCountry, setCurrency]);

  // 3. Popstate Event Listener for Browser Navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith("/c/")) {
        const id = path.split("/c/")[1];
        if (id) {
          useSourcingStore.setState({ activeHistoryId: id, isChatting: true });
          fetchSessionAndHydrate(id, activeUserId, router);
        }
      } else {
        handleResetLocal();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [fetchSessionAndHydrate, handleResetLocal, activeUserId, router]);

  return <>{children}</>;
}
