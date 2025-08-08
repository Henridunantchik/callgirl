export const RouteIndex = "/";
export const RouteSignIn = "/sign-in";
export const RouteSignUp = "/sign-up";
export const RouteProfile = (countryCode = "ug", userRole = null) => {
  if (userRole === "escort") {
    return `/${countryCode}/escort/profile`;
  }
  return `/${countryCode}/profile`;
};

// Escort Directory Routes
export const RouteEscortList = (countryCode = "ug") => `/${countryCode}/escorts`;
export const RouteEscortProfile = (countryCode = "ug", slug) => `/${countryCode}/escort/${slug}`;
export const RouteEscortRegistration = (countryCode = "ug") => `/${countryCode}/escort/registration`;
export const RouteEscortDashboard = (countryCode = "ug") => `/${countryCode}/escort/dashboard`;

// Client Routes
export const RouteClientDashboard = (countryCode = "ug") => `/${countryCode}/client/dashboard`;
export const RouteClientFavorites = (countryCode = "ug") => `/${countryCode}/client/favorites`;
export const RouteClientBookings = (countryCode = "ug") => `/${countryCode}/client/bookings`;
export const RouteClientMessages = (countryCode = "ug") => `/${countryCode}/client/messages`;

// Admin Routes
export const RouteAdminDashboard = (countryCode = "ug") => `/${countryCode}/admin/dashboard`;
export const RouteAdminUsers = (countryCode = "ug") => `/${countryCode}/admin/users`;
export const RouteAdminModeration = (countryCode = "ug") => `/${countryCode}/admin/moderation`;
export const RouteAdminPayments = (countryCode = "ug") => `/${countryCode}/admin/payments`;
export const RouteAdminAnalytics = (countryCode = "ug") => `/${countryCode}/admin/analytics`;

// Search Routes
export const RouteSearch = (countryCode = "ug", q) => {
  if (q) {
    return `/${countryCode}/search?q=${q}`;
  } else {
    return `/${countryCode}/search`;
  }
};

// Legal Routes
export const RoutePrivacyPolicy = (countryCode = "ug") => `/${countryCode}/legal/privacy`;
export const RouteTermsOfService = (countryCode = "ug") => `/${countryCode}/legal/terms`;
export const RouteAgeDisclaimer = (countryCode = "ug") => `/${countryCode}/legal/age-disclaimer`;

// Legacy Routes (to be deprecated)
export const RouteCategoryDetails = "/sexe";
export const RouteAddCategory = "/sexe/add";
export const RouteEditCategory = (category_id) => {
  if (category_id) {
    return `/sexe/edit/${category_id}`;
  } else {
    return `/sexe/edit/:category_id`;
  }
};

export const RouteBlog = "/victimes";
export const RouteBlogAdd = "/victime/add";
export const RouteBlogEdit = (blogid) => {
  if (blogid) {
    return `/victime/edit/${blogid}`;
  } else {
    return `/victime/edit/:blogid`;
  }
};

export const RouteBlogDetails = (category, blog) => {
  if (!category || !blog) {
    return "/victimes/:sexe/:blog";
  } else {
    return `/victimes/${category}/${blog}`;
  }
};

export const RouteBlogByCategory = (category) => {
  if (!category) {
    return "/victimes/:category";
  } else {
    return `/victimes/${category}`;
  }
};

export const RouteCommentDetails = "/hommages";
export const RouteUser = "/users";
