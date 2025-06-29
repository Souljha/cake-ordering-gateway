import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  User,
  CreditCard,
  Package,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";

// Define the schema for profile form validation
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

// Define the type for the profile form values
type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  // Set up the profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
    mode: "onChange",
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(); // Changed from .single() to .maybeSingle()

        if (error && error.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no results" - this is now handled by maybeSingle returning null
          throw error;
        }

        setProfileData(profile); // profile can be null here

        // Update form values only if profile exists
        if (profile) {
          profileForm.reset({
            firstName: (profile as any).first_name || "",
            lastName: (profile as any).last_name || "",
            email: user.email || "", // email comes from auth user
            phone: (profile as any)?.phone || "",
            address: (profile as any)?.address || "",
            city: (profile as any)?.city || "",
            postalCode: (profile as any)?.postal_code || "",
          });
        } else {
          // If no profile, reset with email from auth user and other fields empty
          profileForm.reset({
            firstName: "",
            lastName: "",
            email: user.email || "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
          });
          // Optionally, inform the user or prompt to create a profile
          toast({
            title: "Profile not found",
            description: "Please complete your profile information.",
          });
        }

        // Fetch subscription data if available
        const queryPromise = (supabase as any) // Cast supabase to any for this query
            .from("user_subscriptions")
            .select(
                `
        *,
        subscription_plans(*) 
        `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        const subscriptionQueryResult: any = await queryPromise;

        const data = subscriptionQueryResult?.data?.[0];
        const subError = subscriptionQueryResult?.error;
        const subscription: any = data;

        if (!subError && data) {
          setSubscriptionData(subscription);
        }

        // Fetch order history
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!orderError && orders) {
          setOrderHistory(orders);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: error.message || "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone ? parseFloat(values.phone) : undefined,
          address: values.address,
          city: values.city,
          postal_code: values.postalCode ? parseFloat(values.postalCode) : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (!profileData) return "U";
    return `${profileData.first_name?.charAt(0) || ""}${
      profileData.last_name?.charAt(0) || ""
    }`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-1/4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profileData?.avatar_url || ""} />
                      <AvatarFallback className="bg-cake-pink text-white text-xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">
                      {profileData?.first_name} {profileData?.last_name}
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    {subscriptionData && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cake-pink/10 text-cake-pink">
                          {subscriptionData.subscription_plans?.name ||
                            "Subscriber"}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <nav className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="#profile" className="flex items-center">
                        <User size={18} className="mr-2" />
                        Profile
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="#subscription" className="flex items-center">
                        <CreditCard size={18} className="mr-2" />
                        Subscription
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="#orders" className="flex items-center">
                        <Package size={18} className="mr-2" />
                        Orders
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href="#settings" className="flex items-center">
                        <Settings size={18} className="mr-2" />
                        Settings
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={signOut}
                    >
                      <LogOut size={18} className="mr-2" />
                      Sign Out
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="w-full md:w-3/4">
              <Tabs defaultValue="profile">
                <TabsList className="mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" id="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form
                          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="First name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Last name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Email address"
                                      {...field}
                                      disabled
                                      className="bg-muted/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={profileForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Phone number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Address Information
                            </h3>

                            <FormField
                              control={profileForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Street address"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={profileForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="City" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={profileForm.control}
                                name="postalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Postal code"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              className="bg-cake-pink hover:bg-cake-pink/90"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Subscription Tab */}
                <TabsContent value="subscription" id="subscription">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Subscription</CardTitle>
                      <CardDescription>
                        Manage your subscription plan and billing details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-cake-pink" />
                        </div>
                      ) : subscriptionData ? (
                        <div>
                          <div className="bg-cake-pink/10 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold text-cake-pink mb-2">
                                  {subscriptionData.subscription_plans?.name ||
                                    "Standard Subscription"}
                                </h3>
                                <p className="text-muted-foreground">
                                  {subscriptionData.status === "active"
                                    ? "Active"
                                    : "Inactive"}{" "}
                                  • Renews{" "}
                                  {subscriptionData.current_period_end
                                    ? formatDate(
                                        subscriptionData.current_period_end
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold">
                                  $
                                  {subscriptionData.subscription_plans?.price ||
                                    "0.00"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  per{" "}
                                  {subscriptionData.subscription_plans
                                    ?.interval || "month"}
                                </p>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Billing cycle</span>
                                <span>
                                  {subscriptionData.subscription_plans
                                    ?.interval_count || 1}{" "}
                                  {subscriptionData.subscription_plans
                                    ?.interval || "month"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Next billing date</span>
                                <span>
                                  {subscriptionData.current_period_end
                                    ? formatDate(
                                        subscriptionData.current_period_end
                                      )
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment method</span>
                                <span>
                                  ••••{" "}
                                  {subscriptionData.payment_method_last4 ||
                                    "1234"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Subscription Benefits
                            </h3>
                            <ul className="space-y-2">
                              <li className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-cake-pink mr-2"></div>
                                <span>Monthly cake delivery</span>
                              </li>
                              <li className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-cake-pink mr-2"></div>
                                <span>Exclusive seasonal flavors</span>
                              </li>
                              <li className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-cake-pink mr-2"></div>
                                <span>10% discount on additional orders</span>
                              </li>
                              <li className="flex items-center">
                                <div className="h-2 w-2 rounded-full bg-cake-pink mr-2"></div>
                                <span>
                                  Free delivery on subscription orders
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="flex justify-end gap-4 mt-6">
                            <Button variant="outline">
                              Update Payment Method
                            </Button>
                            <Button variant="destructive">
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <h3 className="text-lg font-medium mb-2">
                            No Active Subscription
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            You don't have an active subscription plan.
                          </p>
                          <Button className="bg-cake-pink hover:bg-cake-pink/90">
                            Subscribe Now
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" id="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>
                        View your past orders and delivery status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-cake-pink" />
                        </div>
                      ) : orderHistory.length > 0 ? (
                        <div className="space-y-6">
                          {orderHistory.map((order) => (
                            <div
                              key={order.id}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="bg-muted p-4 flex justify-between items-center">
                                <div>
                                  <p className="font-medium">
                                    Order #{order.id.substring(0, 8)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(order.created_at)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      order.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {order.status?.charAt(0).toUpperCase() +
                                      order.status?.slice(1) || "Pending"}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between mb-2">
                                  <span className="text-muted-foreground">
                                    Total
                                  </span>
                                  <span className="font-medium">
                                    ${order.total_amount?.toFixed(2) || "0.00"}
                                  </span>
                                </div>
                                <div className="flex justify-between mb-4">
                                  <span className="text-muted-foreground">
                                    Items
                                  </span>
                                  <span>{order.item_count || 0} items</span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  View Order Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <h3 className="text-lg font-medium mb-2">
                            No Orders Yet
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            You haven't placed any orders yet.
                          </p>
                          <Button className="bg-cake-pink hover:bg-cake-pink/90">
                            Browse Products
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" id="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">
                            Email Notifications
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Order updates</p>
                                <p className="text-sm text-muted-foreground">
                                  Receive emails about your order status
                                </p>
                              </div>
                              <div className="flex items-center h-5">
                                <input
                                  id="order-updates"
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-cake-pink focus:ring-cake-pink"
                                />
                              </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  Promotional emails
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Receive emails about promotions and discounts
                                </p>
                              </div>
                              <div className="flex items-center h-5">
                                <input
                                  id="promotional-emails"
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-cake-pink focus:ring-cake-pink"
                                />
                              </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Newsletter</p>
                                <p className="text-sm text-muted-foreground">
                                  Receive our monthly newsletter
                                </p>
                              </div>
                              <div className="flex items-center h-5">
                                <input
                                  id="newsletter"
                                  type="checkbox"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-cake-pink focus:ring-cake-pink"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-medium mb-4">Password</h3>
                          <Button variant="outline">Change Password</Button>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-medium mb-4 text-destructive">
                            Danger Zone
                          </h3>
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
