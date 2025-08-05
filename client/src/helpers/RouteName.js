export const RouteIndex = "/";
export const RouteSignIn = "/sign-in";
export const RouteSignUp = "/sign-up";
export const RouteProfile = (countryCode = "ug", userRole = null) => {
  if (userRole === "escort") {
    return `/${countryCode}/escort/profile`;
  }
  return `/${countryCode}/profile`;
};
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

export const RouteSearch = (q) => {
  if (q) {
    return `/search?q=${q}`;
  } else {
    return `/search`;
  }
};

export const RouteCommentDetails = "/hommages";
export const RouteUser = "/users";
