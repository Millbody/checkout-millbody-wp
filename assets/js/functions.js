// remover Toast materialize (diminuir o requirement)
var g = document.createElement("div");
g.setAttribute("id", "snackbar");
document.body.appendChild(g);

var SnackBar = function (message, timing) {
  var x = document.getElementById("snackbar");
  x.innerHTML = message;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, timing || 3000);
};
function getUrlParameter(sParam) {
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
}

try {
  grecaptcha.ready(function () {
    if (!window.checkout_recaptcha) return;
    grecaptcha
      .execute(window.checkout_recaptcha, {
        action: "submit",
      })
      .then(function (token) {
        document.getElementById("recaptcha-token").value = token;
      });
  });
} catch (error) {
  console.log("error grecaptcha ", error);
}

function getValFromId(idLabel) {
  var element_id = document.getElementById(idLabel);
  if (element_id && element_id.value) {
    return element_id.value.trim();
  }
  return "";
}

window.submitForm = function (event) {
  event.preventDefault();
  var loadingComponent = jQuery(".loading-component"),
    activeStepElement = jQuery(".millbody-checkout").find(
      ".checkout-step.enabled"
    ),
    redirect = checkoutElement.dataset.redirect,
    successComponent = jQuery(".success-order"),
    activeStep = parseInt(activeStepElement.data("step")),
    customer = {
      name: getValFromId("name"),
      last_name: getValFromId("last_name"),
      email: getValFromId("email"),
      cpf: getValFromId("cpf"),
      phone: getValFromId("phone"),
      gender:
        getValFromId("gender") || getValFromId("gender_check")
          ? "Feminino"
          : "Masculino",
      billing: {
        zipcode: getValFromId("zipcode"),
        address: getValFromId("address"),
        number: getValFromId("number"),
        complement: getValFromId("complement"),
        neighborhood: getValFromId("neighborhood"),
        city: getValFromId("city"),
        state: getValFromId("state"),
      },
    };
  checkout.customer = customer;
  body = {
    token: getValFromId("recaptcha-token"),
    checkout: {
      plan_code: planCode,
    },
  };
  if (checkout.plan.store == "stripe") {
    var clids = ["gclid", "fbclid", "ttclid"];
    var success_url = getValFromId("success_url");
    for (var i = 0; i < clids.length; i++) {
      var first_character = "";
      success_url.indexOf("?") > -1
        ? (first_character = "&")
        : (first_character = "?");
      var param = window.sessionStorage.getItem(clids[i]);
      if (param) {
        success_url += first_character + clids[i] + "=" + param;
      }
    }
    body.checkout.payment = {
      success_url: success_url,
    };
  } else {
    body.checkout.payment = {
      credit_card_number: getValFromId("credit_card_number"),
      credit_card_name: getValFromId("credit_card_name"),
      expire_date: getValFromId("expire_date"),
      cvv: getValFromId("cvv"),
      credit_card_label: getValFromId("credit_card_label"),
      installments: getValFromId("installments"),
    };
  }

  userToken
    ? (body.checkout.relationship_token = userToken)
    : (body.checkout.customer = customer);

  if (
    activeStep < 3 &&
    !activeStepElement.hasClass("submit-step") &&
    checkout.plan.store !== "stripe"
  ) {
    var validation = validateFormStep(activeStepElement);
    loadingComponent.removeClass("active");
    if (validation === false) return false;
    GoToNextFromStep(
      jQuery(".millbody-checkout").find(".checkout-step.enabled")
    );
  } else {
    if (!loadingComponent.hasClass("active")) {
      loadingComponent.addClass("active");
    }
    if (
      checkout.plan.store !== "stripe" &&
      !getValFromId("credit_card_label")
    ) {
      SnackBar(
        "Cartão inv&aacute;lido! Por favor, revise os dados para continuar"
      );
      return false;
    }
    dataLayerPaymentInfo();

    fetch(checkoutUrl, {
      method: "POST",
      body: JSON.stringify(body),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Requester: window.location.href,
      },
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw response.json();
        }
      })
      .then(function (response) {
        try {
          window.hash = CryptoJS.SHA256(checkout.customer.email);
          window.hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
          window.localStorage.removeItem("Customer");
          if (response.checkout_type == "redirect" && response.url) {
            window.location.href = response.url;
            return;
          } else {
            dataLayerSuccess();
          }
          checkoutElement.hidden = true;
        } catch (err) {
          throw JSON.stringify(err);
        }
        if (redirect) {
          var redirectUrl = redirect;
          redirectUrl += "?plan_code=" + planCode;
          redirectUrl += "&id=" + window.hashInBase64;
          window.location.replace(redirectUrl);
        } else {
          successComponent.addClass("active");
        }
      })
      .catch(function (error) {
        console.log("error => ", error);
        error.then((response) => {
          SnackBar(response.message);
          throw response;
        });
        throw JSON.stringify(error);
      })
      .finally(function () {
        loadingComponent.removeClass("active");
      });
  }
};

function dataLayerPaymentInfo() {
  window.dataLayer.push({
    event: "add_payment_info",
    ecommerce: {
      currency: "BRL",
      payment_type: "Cartão de Crédito",
      value: checkout.plan.planValueNumber,
      items: [
        {
          id: planCode,
          name: checkout.plan.name,
          price: checkout.plan.planValueNumber,
          quantity: 1,
          item_brand: "Millbody",
        },
      ],
      products: [
        {
          id: planCode,
          name: checkout.plan.name,
          price: checkout.plan.planValueNumber,
          quantity: 1,
          item_brand: "Millbody",
        },
      ],
    },
    user: {
      user_id: window.hashInBase64,
      email: checkout.customer.email,
      first_name: checkout.customer.name,
      last_name: checkout.customer.last_name,
      phone: "+55" + checkout.customer.phone,
    },
  });
}

function dataLayerSuccess() {
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: window.hashInBase64,
      affiliation:
        "Checkout Transparente " +
        checkout.plan.store +
        " " +
        window.location.host,
      value: checkout.plan.planValueNumber,
      currency: "BRL",
      items: [
        {
          id: planCode,
          name: checkout.plan.name,
          price: checkout.plan.planValueNumber,
          quantity: 1,
          item_brand: "Millbody",
        },
      ],
      products: [
        {
          id: planCode,
          name: checkout.plan.name,
          price: checkout.plan.planValueNumber,
          quantity: 1,
          item_brand: "Millbody",
        },
      ],
    },
    user: {
      user_id: window.hashInBase64,
      email: checkout.customer.email,
      first_name: checkout.customer.name,
      last_name: checkout.customer.last_name,
      phone: "+55" + checkout.customer.phone,
    },
  });
  window.dataLayer.push({
    event: "subscribe",
    subscription: {
      subscription_id: window.hashInBase64,
      subscription_plan: planCode,
      currency: "BRL",
      value: checkout.plan.planValueNumber,
    },
    user: {
      user_id: window.hashInBase64,
      email: checkout.customer.email,
      first_name: checkout.customer.name,
      last_name: checkout.customer.last_name,
      phone: "+55" + checkout.customer.phone,
    },
  });
}

var checkoutElement = document.getElementById("assinar").querySelector("form");
checkoutElement.onsubmit = function (event) {
  submitForm(event);
};
