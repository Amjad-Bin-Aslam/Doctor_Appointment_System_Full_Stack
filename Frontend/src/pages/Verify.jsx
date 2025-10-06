import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function Verify() {
  const { backendUrl, token } = useContext(AppContext);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate()

  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get("success") === "true";
      const appointmentId = searchParams.get("appointmentId");

      if (!appointmentId) {
        toast.error("Invalid appointment ID");
        return;
      }

      try {
        const { data } = await axios.post(backendUrl + '/api/user/verify-stripe-appointment',
          { success, appointmentId },
          { headers: { token } }
        );

        if (data.success) {
          toast.success("Payment successful! Appointment confirmed.");
          navigate("/my-appointments");
        } else {
          toast.error("Payment failed or cancelled.");
          navigate("/appointments");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error(error.response?.data?.message || "Something went wrong.");
      }
    };

    verifyPayment();
  }, [searchParams, backendUrl, token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
    </div>
  );
}

export default Verify;
