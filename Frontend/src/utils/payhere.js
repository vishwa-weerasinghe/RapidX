/**
 * PayHere Checkout Utility
 *
 * Ensures PayHere JS SDK is loaded and launches the PayHere payment modal.
 * If the modal SDK is unavailable, it gracefully falls back to PayHere hosted checkout redirect.
 */

export const loadPayHereSdk = () => {
    return new Promise((resolve) => {
        if (window.payhere) {
            return resolve(window.payhere);
        }

        const existingScript = document.getElementById("payhere-sdk-script");
        if (existingScript) {
            existingScript.onload = () => resolve(window.payhere);
            return;
        }

        const script = document.createElement("script");
        script.id = "payhere-sdk-script";
        script.type = "text/javascript";
        script.src = "https://www.payhere.lk/lib/payhere.js";
        script.async = true;
        script.onload = () => {
            console.log("PayHere JS SDK loaded successfully");
            resolve(window.payhere);
        };
        script.onerror = () => {
            console.error("Failed to load PayHere JS SDK script");
            resolve(null);
        };

        document.head.appendChild(script);
    });
};

/**
 * Fallback to PayHere Hosted Redirect Form POST
 */
export const redirectToPayHereHostedCheckout = (params) => {
    const isSandbox = params.sandbox !== false;
    const checkoutUrl = isSandbox
        ? "https://sandbox.payhere.lk/pay/checkout"
        : "https://www.payhere.lk/pay/checkout";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkoutUrl;
    form.style.display = "none";

    Object.keys(params).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
};

/**
 * Start PayHere payment flow (Popup modal with fallback to hosted redirect)
 */
export const startPayHerePayment = async (payhereParams, { onCompleted, onDismissed, onError }) => {
    const payhere = await loadPayHereSdk();

    if (payhere) {
        payhere.onCompleted = function (orderId) {
            console.log("PayHere Payment Completed for Order ID:", orderId);
            if (onCompleted) onCompleted(orderId);
        };

        payhere.onDismissed = function () {
            console.log("PayHere Payment Modal Dismissed");
            if (onDismissed) onDismissed();
        };

        payhere.onError = function (error) {
            console.error("PayHere Payment Error:", error);
            if (onError) onError(error);
        };

        try {
            payhere.startPayment(payhereParams);
            return;
        } catch (err) {
            console.warn("PayHere startPayment error, falling back to hosted checkout:", err);
        }
    }

    // Fallback: Redirect to PayHere secure hosted page
    redirectToPayHereHostedCheckout(payhereParams);
};
