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
    var datalayer_product = {
      id: params.plan,
      name: params.plan,
      price: params.value,
      brand: "Millbody",
      item_id: params.plan,
      item_name: params.plan,
      item_brand: "Millbody",
      quantity: 1,
    };
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: params.customer_e,
        currency: "BRL",
        payment_type: "Stripe",
        value: params.value,
        items: [datalayer_product],
        products: [datalayer_product],
      },
      user: {
        user_id: params.customer_e,
        email: params.customer_e,
        phone: params.customer_p,
      },
    });
  }
})();

(function () {
  var input_elements_on_page = document.querySelectorAll("input, selector");
  for (var i = 0; i < input_elements_on_page.length; i++) {
    input_elements_on_page[i].addEventListener("focusout", function (event) {
      var event_datalayer = {
        event: "focusout",
        element_name: event.target.name,
      };
      if (event.target.value) {
        event_datalayer[event.target.name] = event.target.value;
      }

      window.dataLayer.push(event_datalayer);
    });
  }
})();
