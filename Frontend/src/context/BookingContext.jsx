import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const guestStr = localStorage.getItem("guest_customer");
      const activeCustomer =
        JSON.parse(userStr) || JSON.parse(guestStr) || null;
      if (activeCustomer?.Customer_ID) {
        setCustomerId(activeCustomer.Customer_ID);
      } else {
        setLoading(false);
        setError("No customer ID found. Please log in.");
      }
    } catch {
      setLoading(false);
      setError("Failed to read user data.");
    }
  }, []);

  useEffect(() => {
    if (!customerId) return;

    let isSubscribed = true;
    api
      .get(`/user-bookings/${customerId}`)
      .then((res) => {
        if (!isSubscribed) return;
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error("Bookings fetch error:", err);
        setError("Failed to load bookings.");
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [customerId]);

  return (
    <BookingContext.Provider
      value={{ bookings, loading, error, customerId }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingProvider");
  }
  return context;
}
