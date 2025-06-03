import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { getProductImageUrl } from "@/lib/supabaseStorage";
import { supabase } from "@/integrations/supabase/client";
import CreditCardForm from "@/components/payment/CreditCardForm";
import PayPalCheckout from "@/components/payment/PayPalCheckout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeProvider from "@/components/payment/StripeProvider";

// Define types for form data
interface CheckoutFormData {
  firstName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryDate: string;
  deliveryTime: string;
  specialInstructions: string;
  paymentMethod: "creditCard" | "paypal" | "bitcoin" | "bankTransfer";
}

// Define types for payment service responses
interface PaymentServiceResponse {
  orderId?: string;
  clientSecret?: string;
  orderID?: string;
  address?: string;
  amount?: number;
  reference?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, cartTotal, deliveryFee, clearCart } = useCart();

  // State for checkout process
  const [paymentStep, setPaymentStep] = useState<
    "details" | "payment" | "confirmation"
  >("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Payment-specific states
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<
    string | null
  >(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [bitcoinPaymentDetails, setBitcoinPaymentDetails] =
    useState<PaymentServiceResponse | null>(null);
  const [bankTransferInfo, setBankTransferInfo] =
    useState<PaymentServiceResponse | null>(null);

  // Form data state
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryDate: "",
    deliveryTime: "morning",
    specialInstructions: "",
    paymentMethod: "creditCard",
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  // Warn if Stripe public key is missing
  useEffect(() => {
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      // eslint-disable-next-line no-console
      console.warn("Stripe public key is missing in environment variables.");
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle radio changes
  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value as CheckoutFormData["paymentMethod"],
    }));
  };

  // Replace the createPaymentIntent function with this:
  const createPaymentIntent = async (
    amount: number,
    method: string,
    orderId: string
  ): Promise<PaymentServiceResponse> => {
    if (method === "creditCard") {
      try {
        // Use the Docker-hosted Stripe API server
        const response = await fetch(
          "http://localhost:3001/api/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: amount,
              currency: "ZAR",
              payment_id: orderId,
              is_subscription: false,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to create payment intent"
          );
        }

        const data = await response.json();
        return {
          orderId,
          clientSecret: data.clientSecret,
        };
      } catch (error) {
        console.error("Payment intent creation error:", error);
        throw error;
      }
    } else {
      // Mock response for other payment methods
      return {
        orderId,
        orderID: "mockPayPalOrderID",
        address: "mockBitcoinAddress",
        amount,
        reference: orderId,
        bankDetails: {
          bankName: "Mock Bank",
          accountName: "Mock Account",
          accountNumber: "1234567890",
        },
      };
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
      });
      navigate("/products");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items for Supabase
      const orderItems = cart.map((item) => ({
        id: item.id, // Assuming product ID
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
        // Add any other product details you want to store per item
      }));

      // Prepare shipping address for Supabase
      const shippingAddress = {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        // Potentially add firstName, email, phone here if you want them as part of shipping_address JSON
      };

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.firstName,
          customer_email: formData.email,
          customer_phone: formData.phone
            ? Number(formData.phone.replace(/\D/g, ""))
            : null, // Convert to number, remove non-digits, or null
          shipping_address: shippingAddress, // Use the structured shipping_address
          delivery_date: formData.deliveryDate,
          delivery_time: formData.deliveryTime,
          special_instructions: formData.specialInstructions,
          payment_method: formData.paymentMethod,
          status: "pending",
          total_amount: cartTotal + deliveryFee,
          items: orderItems, // Use the transformed orderItems
        })
        .select("id")
        .single();

      if (orderError) {
        throw new Error(orderError.message);
      }

      const orderId = orderData?.id;
      setCurrentOrderId(orderId);

      // Create payment intent based on payment method
      const paymentServiceResponse = await createPaymentIntent(
        cartTotal + deliveryFee,
        formData.paymentMethod,
        orderId
      );

      setPaymentStep("payment"); // Move to payment step

      if (
        formData.paymentMethod === "creditCard" &&
        paymentServiceResponse.clientSecret
      ) {
        setPaymentIntentClientSecret(paymentServiceResponse.clientSecret);
      } else if (
        formData.paymentMethod === "paypal" &&
        paymentServiceResponse.orderID
      ) {
        setPaypalOrderId(paymentServiceResponse.orderID);
      } else if (
        formData.paymentMethod === "bitcoin" &&
        paymentServiceResponse.address
      ) {
        setBitcoinPaymentDetails(paymentServiceResponse);
      } else if (
        formData.paymentMethod === "bankTransfer" &&
        paymentServiceResponse.bankDetails
      ) {
        setBankTransferInfo(paymentServiceResponse);
      } else {
        throw new Error(
          "Payment provider response was not in the expected format."
        );
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: err?.message || "An error occurred during checkout.",
      });
      setPaymentStep("details"); // Revert to details step on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string | null) => {
    if (orderId) {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        toast({
          title: "Order Update Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        clearCart();
        setPaymentStep("confirmation"); // Move to confirmation after successful update
        navigate("/order-confirmation", {
          state: {
            orderNumber: orderId,
            orderDate: new Date().toLocaleDateString(),
            items: cart,
            total: cartTotal + deliveryFee,
            customerInfo: formData,
          },
        });
      }
    } else {
      toast({
        title: "Order ID Missing",
        description: "Cannot update order status without an Order ID.",
        variant: "destructive",
      });
      setPaymentStep("details"); // Revert to details if orderId is missing
    }
  };

  const handlePaymentFailure = async (
    orderId: string | null,
    errorMessage: string
  ) => {
    if (orderId) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "payment_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        toast({
          title: "Order Update Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: errorMessage,
    });
    setPaymentStep("details");
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

            {paymentStep === "details" && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    {/* Contact Details */}
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm mb-6">
                      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        Contact Details
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Full Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="johndoe@gmail.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Mobile</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+27123456789"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm mb-6">
                      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        Delivery Details
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Delivery Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deliveryDate">Delivery Date</Label>
                            <Input
                              id="deliveryDate"
                              name="deliveryDate"
                              type="date"
                              value={formData.deliveryDate}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryTime">Preferred Time</Label>
                            <Select
                              onValueChange={(value) =>
                                handleSelectChange("deliveryTime", value)
                              }
                              defaultValue={formData.deliveryTime}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">
                                  Morning (8AM - 12PM)
                                </SelectItem>
                                <SelectItem value="afternoon">
                                  Afternoon (12PM - 4PM)
                                </SelectItem>
                                <SelectItem value="evening">
                                  Evening (4PM - 8PM)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialInstructions">
                            Special Instructions
                          </Label>
                          <Textarea
                            id="specialInstructions"
                            name="specialInstructions"
                            placeholder="Any special delivery instructions or cake customization details"
                            value={formData.specialInstructions}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
                      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        Payment
                      </h2>
                      <RadioGroup
                        defaultValue={formData.paymentMethod}
                        onValueChange={handleRadioChange}
                        className="flex flex-wrap gap-4 mb-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="creditCard"
                            id="creditCard"
                            className="text-cake-pink"
                          />
                          <Label htmlFor="creditCard">Card</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="paypal"
                            id="paypal"
                            className="text-cake-pink"
                          />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="bitcoin"
                            id="bitcoin"
                            className="text-cake-pink"
                          />
                          <Label htmlFor="bitcoin">Bitcoin</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="bankTransfer"
                            id="bankTransfer"
                            className="text-cake-pink"
                          />
                          <Label htmlFor="bankTransfer">Bank Transfer</Label>
                        </div>
                      </RadioGroup>

                      <div className="mt-6 text-xs text-muted-foreground">
                        <p>
                          Your personal data will be used to process your order,
                          support your experience throughout this website, and
                          for other purposes described in our privacy policy.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm sticky top-24">
                      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        Order Summary
                      </h2>

                      <div className="space-y-4 mb-6">
                        {/* Add try/catch to prevent cart rendering errors */}
                        {(() => {
                          try {
                            return cart.map(
                              (
                                item // item is implicitly CartItem from useCart()
                              ) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3"
                                >
                                  <div className="w-16 h-16 rounded overflow-hidden">
                                    <img
                                      src={getProductImageUrl(
                                        item.image_url || ""
                                      )}
                                      alt={item.name || "Product image"}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-grow">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    R{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              )
                            );
                          } catch (err: any) {
                            return (
                              <div style={{ color: "red" }}>
                                Failed to render cart: {err.message}
                              </div>
                            );
                          }
                        })()}
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>R{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>R{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base">
                          <span>Total</span>
                          <span>R{(cartTotal + deliveryFee).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={cart.length === 0 || isProcessing}
                      >
                        {isProcessing
                          ? "Processing..."
                          : `Proceed to Pay R${(
                              cartTotal + deliveryFee
                            ).toFixed(2)}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

              {paymentStep === "payment" && (
              <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                  Payment
                </h2>
                
                {formData.paymentMethod === "creditCard" && paymentIntentClientSecret && stripePromise && (
                  <StripeProvider clientSecret={paymentIntentClientSecret}>
                    <Elements stripe={stripePromise}>
                      <CreditCardForm 
                        onSuccess={(paymentId) => handlePaymentSuccess(paymentId)}
                        onError={(error) => handlePaymentFailure(currentOrderId, error)}
                        orderId={currentOrderId}
                      />
                    </Elements>
                  </StripeProvider>
                )}
                
                {formData.paymentMethod === "paypal" && paypalOrderId && (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Complete with PayPal
                      </h3>
                      <PayPalCheckout
                        orderId={paypalOrderId || undefined}
                        amount={cartTotal + deliveryFee}
                        currency="ZAR"
                        onSuccess={(details) => {
                          console.log("PayPal Success Details:", details);
                          handlePaymentSuccess(currentOrderId);
                        }}
                        onError={(err) =>
                          handlePaymentFailure(
                            currentOrderId,
                            err || "PayPal payment failed"
                          )
                        }
                      />
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => setPaymentStep("details")}
                      >
                        Back to Details
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {formData.paymentMethod === "bitcoin" && bitcoinPaymentDetails && (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Pay with Bitcoin
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Send {bitcoinPaymentDetails.amount} ZAR to the following
                        Bitcoin address:
                      </p>
                      <p className="font-mono bg-background p-2 rounded text-sm break-all mb-4">
                        {bitcoinPaymentDetails.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Once payment is sent, it may take some time to confirm. We
                        will notify you.
                      </p>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => handlePaymentSuccess(currentOrderId)}
                      >
                        I've Made The Payment
                      </Button>
                      <Button
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => setPaymentStep("details")}
                      >
                        Back to Details
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {formData.paymentMethod === "bankTransfer" && bankTransferInfo && (
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Bank Transfer Details
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Please transfer R{(cartTotal + deliveryFee).toFixed(2)}{" "}
                        to:
                      </p>
                      <div className="mt-2 space-y-1 text-sm bg-muted p-3 rounded-md">
                        <p>
                          <span className="font-medium">Bank:</span>{" "}
                          {bankTransferInfo.bankDetails.bankName || "Cake Bank"}
                        </p>
                        <p>
                          <span className="font-medium">Account Name:</span>{" "}
                          {bankTransferInfo.bankDetails.accountName ||
                            "Cake A Day"}
                        </p>
                        <p>
                          <span className="font-medium">Account Number:</span>{" "}
                          {bankTransferInfo.bankDetails.accountNumber ||
                            "1234567890"}
                        </p>
                        <p>
                          <span className="font-medium">Reference:</span>{" "}
                          {bankTransferInfo.reference ||
                            currentOrderId ||
                            "Your Order ID"}
                        </p>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        onClick={() => handlePaymentSuccess(currentOrderId)}
                      >
                        I've Made The Transfer
                      </Button>
                      <Button
                        variant="outline"
                        className="mt-2 w-full"
                        onClick={() => setPaymentStep("details")}
                      >
                        Back to Details
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {paymentStep === "confirmation" && (
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold mb-4">
                  Processing Confirmation...
                </h2>
                <p>You will be redirected shortly.</p>
              </div>
            )}
          </div>
        </section>
    </div>
  );
};

export default CheckoutPage;
