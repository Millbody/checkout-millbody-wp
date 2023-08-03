window.getUrlParameter = function (sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
};

(function () {
  ["gclid", "fbclid", "ttclid"].forEach(function (item) {
    var value = getUrlParameter(item);
    if (value) {
      window.sessionStorage.setItem(item, value);
    }
  });
})();

(function () {
  var searchParams = new URLSearchParams(window.location.search);
  if (
    searchParams.size > 0 &&
    window.location.href.indexOf("session_id=") > -1
  ) {
    var params = Object.fromEntries(searchParams);

    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: params.customer_e,
        currency: "BRL",
        payment_type: "Stripe",
        value: params.value,
        items: [
          {
            id: params.plan,
            price: params.value,
            quantity: 1,
            item_brand: "Millbody",
          },
        ],
        products: [
          {
            id: params.plan,
            price: params.value,
            quantity: 1,
            item_brand: "Millbody",
          },
        ],
      },
      user: {
        user_id: params.customer_e,
        email: params.customer_e,
        phone: params.customer_p,
      },
    });
  }
})();
