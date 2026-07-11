const API = {
  HOME: '/user_home.php',
  LOGIN: '/login.php',
  SEND_OTP: '/OTP/send_otp.php',
  VERIFY_OTP: '/OTP/verify_otp.php',
  REGISTER: '/user_register.php',
  PRODUCTS: '/products.php',
  ADD_TO_CART: '/add_to_cart.php',
  GET_CART: '/get_cart.php',
  UPDATE_CART: '/update_cart.php',
  ADD_PRODUCT: '/add-product.php',
  CATEGORIES: '/categories.php',
  CATEGORY_PRODUCTS: '/category_products.php',
  GET_ADRESS:'/get_addresses.php',
  ADD_ADRESS:'/add_addresses.php',
  UPDATE_ADDRESS:'/update_addresses.php',
  UPDATE_DEFAULT_ADDRESS:'/update_default_address.php',
  DELETE_ADDRESS: '/delete_address.php',
  GET_PRODUCT_DETAIL: '/get_product_detail.php',
  CHECK_WISHLIST: '/check_wishlist.php',
  ADD_WISHLIST: "/add_to_wishlist.php",
  REMOVE_WISHLIST: "remove_wishlist.php",
  APPLY_GST: "/getCartSummary.php",
  GET_WISHLIST: "/get_wishlist.php",
  SEARCH_BUSES: "/search_buses.php",
  BOOK_TICKET: "/book_ticket.php",
  GET_CITIES: "/get_cities.php",
  GET_USER_BOOKINGS: "get_user_bookings.php",
  RECHARGE: "/recharge.php",
  GET_DATA_PACKS: "/get_datapacks.php",
  BUY_DATA_PACK: "/buy_datapack.php",
  CREATE_PAYMENT: "/create_recharge_payment.php",
  CREATE_ORDER: "/create_recharge_order.php",
  CALCULATE_AMOUNT: "/calculate_amount.php",
  VERIFY_RECHARGE_PAYMENT: "/verify_recharge_payment.php",
  VERIFY_BUS_PAYMENT: "/verify_bus_payment.php",
  UPDATE_PAYMENT_STATUS: "/update_payment_status.php",
  REFUND_BOOKING: "/refund_booking.php",
  CREATE_BOOKING_ORDER: "/create_booking_order.php",
  CREATE_TEMP_BOOKING: "/create_temp_booking.php",
  BOOKING_INIT: "/booking_init.php",
  UPDATE_BOOKING_PAYMENT: "/update_booking_payment.php",
  CONFIRM_BOOKING: "/confirm_booking.php",
  REFUND_DIRECT: "/refund_direct.php", // 🔥 important // 🔥 important
  BUS_TICKET_TERMS_AND_CONDITIONS: "/bus_ticket_terms_and_conditions.php", // 🔥 important
  CANCEL_BOOKING: "/cancel_booking.php", // 🔥 important
  UPDATE_USER_PROFILE: "/update_user_profile.php", // 🔥 important
  GET_USER_POINTS:"/get_user_points.php",
  GET_USER_POINTS_DETAIL: "/get_user_points_detail.php",
  GET_RECHARGE_HISTORY:"/get_recharge_history.php",
  GET_USER_POINTS_FOR_USE:"/get_user_points_for_use.php",
  PLACE_ORDER: 'place_order.php',
  GET_ORDERS: '/get_orders.php',
  CREATE_RAZORPAY_ORDER:'create_razorpay_order.php',
  VERIFY_ORDER_PAYMENT:'verify_order_payment.php',
  CANCEL_ORDER_ITEM: '/order_cancel_return/cancel_order_item.php',
  REQUEST_RETURN: '/order_cancel_return/request_return.php',
  GET_COUNTERS:'/electricity_bill/getCounters.php',
  GET_BILL_DETAILS:'/electricity_bill/getBillDetails.php',
  GET_SERVICE_CHARGE:'/electricity_bill/getServiceCharge.php',
  CREATE_ELECTRICITY_ORDER:'/electricity_bill/createElectricityOrder.php',
  MAKE_PAYMENT:'/electricity_bill/makePayment.php',
  GET_NEW_CONSUMER_ID: '/electricity_bill/getNewConsumerId.php',
  MAKE_PAYMENT_V2:'/electricity_bill/makePaymentV2.php',
  SUBMIT_PRAWASI_CARD_APPLICATION: '/submit_detail_for_prawasi_card.php', // 🔥 important
  SAVE_PERSONAL_DETAILS: '/prawasi_card_uploads/save_personal_details.php', // 🔥 important
  GET_PERSONAL_DETAILS: '/prawasi_card_uploads/get_personal_details.php', // 🔥 important
  SAVE_ID_DETAILS: '/prawasi_card_uploads/save_id_details.php', // 🔥 important
  GET_ID_DETAILS: '/prawasi_card_uploads/get_id_details.php', // 🔥 important
  SAVE_JAMANI_DETAILS: '/prawasi_card_uploads/save_jamani_details.php', // 🔥 important
  GET_JAMANI_DETAILS: '/prawasi_card_uploads/get_jamani_details.php', // 🔥 important
  SAVE_APPLICATION_PAYMENT: '/prawasi_card_uploads/save_application_payment.php', // 🔥 important
  GET_MY_APPLICATIONS: '/prawasi_card_uploads/get_my_applications.php', // 🔥 important
  GET_PRAWASI_CARD_COST: '/prawasi_card_uploads/get_prawasi_card_cost.php', // 🔥 important
  GET_PAYMENT_CONFIG: '/payment/get_payment_config.php', // 🔥 important
  CANCEL_ORDER: '/payment/cancel_order_payment.php', // 🔥 important
  GET_PRODUCT_CITY: '/city/get_product_city.php', // 🔥 important
  CHECK_SERVICEABLE_LOCATION: '/city/check_serviceable_location.php', // 🔥 important
  GET_CITY_PINCODES: '/city/get_city_pincodes.php', // 🔥 important
  GET_SERVICES: '/services/get_services.php',
  GET_SETTING_MENU: '/setting/get_setting_menu.php',
  GET_APP_CONFIG: '/app_config.php',
  VALIDATE_USER: '/validate_user.php',
  SUBMIT_FEEDBACK: '/feedback/submit_feedback.php',
  REFRESH_TOKEN: '/refresh_token.php',
  GET_REFERRAL_CODE: '/get_referral_code.php',
  APPLY_REFERRAL_CODE: '/apply_referral_code.php',
  GET_INTERNET_SERVICE_PROVIDERS: '/internet_billing/get_internet_service_providers.php',
  GET_WORLDLINK_DETAILS: '/internet_billing/get_worldlink_details.php',
  CREATE_INTERNET_BILL_ORDER: '/internet_billing/create_internet_bill_order.php',
  CREATE_INTERNET_BILL_RAZORPAY_ORDER: '/internet_billing/create_internet_bill_razorpay_order.php',
  VERIFY_WORLDLINK_PAYMENT: '/internet_billing/verify_worldlink_payment.php',
  GET_INTERNET_BILL_HISTORY: '/internet_billing/get_internet_bill_history.php',
  CANCEL_INTERNET_BILL_PAYMENT: '/internet_billing/cancel_internet_bill_payment.php',
  CANCEL_RECHARGE_PAYMENT: '/cancel_recharge_payment.php',
};

export default API;