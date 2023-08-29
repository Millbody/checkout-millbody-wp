//Integrando com dataLayer
try {
  dataLayer.push({
    event: "debbug",
  });
} catch (err) {
  var dataLayer = [];
}
var valores_padrao = {
  number: "**** **** **** ****",
  name: "NOME NO CARTÃO",
  expiry: "**/**",
  cvc: "***",
};
var urlParams = new URLSearchParams(window.location.search);
window.checkout = {};

String.prototype.validaTelefone = function () {
  var telefone = this;
  telefone = telefone.replace(/\D/g, "");

  if (!(telefone.length >= 10 && telefone.length <= 11)) return false;

  if (telefone.length == 11 && parseInt(telefone.substring(2, 3)) != 9)
    return false;

  for (var n = 0; n < 10; n++) {
    if (telefone == new Array(11).join(n) || telefone == new Array(12).join(n))
      return false;
  }
  var codigosDDD = [
    11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
    37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 64, 63,
    65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
    89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
  ];
  if (codigosDDD.indexOf(parseInt(telefone.substring(0, 2))) == -1)
    return false;
  if (
    telefone.length == 10 &&
    [2, 3, 4, 5, 7].indexOf(parseInt(telefone.substring(2, 3))) == -1
  )
    return false;

  return true;
};

var checkoutElement = document.getElementById("millbody-checkout"),
  account = checkoutElement.dataset.account,
  host = "https://box.millbody.com",
  // host = "http://localhost:7777",
  checkoutUrl = host + "/" + account + "/checkout/",
  planCode =
    getUrlParameter("plan") || document.getElementById("plan_code").value;
window.userToken = getUrlParameter("token");

var card = new Card({
  form: "#millbody-checkout",
  container: ".card-wrapper",
  width: "100%",
  height: 250,
  formSelectors: {
    numberInput: 'input[name="checkout[payment][credit_card_number]"]',
    nameInput: 'input[name="checkout[payment][credit_card_name]"]',
    expiryInput: 'input[name="checkout[payment][expire_date]"]',
    cvcInput: 'input[name="checkout[payment][cvv]"]',
  },
  placeholders: valores_padrao,
});

function getCardFlag(cardnumber) {
  var cardnumber = cardnumber.replace(/[^0-9]+/g, "");

  var cards = {
    visa: /^4[0-9]{12}(?:[0-9]{3})/,
    mastercard: /^5[1-5][0-9]{14}/,
    diners_club: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
    american_express: /^3[47][0-9]{13}/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}/,
    hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
    elo: /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}/,
    aura: /^(5078\d{2})(\d{2})(\d{11})$/,
  };

  for (var flag in cards) {
    if (cards[flag].test(cardnumber)) {
      window.dataLayerPaymentInfo();
      return flag;
    }
  }

  return false;
}

var myHeaders = new Headers({
  "Content-Type": "application/json",
  Accept: "application/json",
  Requester: window.location.href,
});

window.addEventListener("DOMContentLoaded", function (event) {
  var checkoutPaymentElement = document.querySelector(".checkout-payment");

  document.querySelector(
    'input[name="checkout[payment][credit_card_number]"]'
  ).focusout = function (event) {
    var labelCard = getCardFlag(this.value);
    document.querySelector(
      'input[name="checkout[payment][credit_card_label]"]'
    ).value = labelCard;
  };

  function GoToNextFromStep(checkoutStep) {
    var valueStep = parseInt(checkoutStep.dataset.step),
      nextStep = valueStep + 1;
    var validation = validateFormStep(checkoutStep);
    if (validation === false) return;
    var nextStepElement = document.querySelector(
      '.checkout-step[data-step="' + nextStep + '"]'
    );
    if (
      nextStep < 4 &&
      !checkoutStep.classList.contains("active") &&
      checkout.plan.store !== "stripe"
    ) {
      checkoutStep.classList.remove("enabled");
      checkoutStep.classList.add("disabled");
      nextStepElement.classList.add("enabled");
      nextStepElement.classList.remove("disabled");
    } else {
      nextStepElement.innerHTML = "carregando...";
      checkoutStep.closest(".millbody-checkout").requestSubmit();
    }
  }

  document
    .querySelector(".continue-step")
    .addEventListener("click", function (event) {
      event.preventDefault();
      var checkoutStep = document.querySelector(".checkout-step.enabled");
      var customer = {
        name: getValFromId("name"),
        last_name: getValFromId("last_name"),
        email: getValFromId("email"),
        phone: getValFromId("phone"),
        cpf: getValFromId("cpf"),
        gender:
          getValFromId("gender") || getValFromId("gender_check")
            ? "Feminino"
            : "Masculino",
      };
      if (customer.email) {
        window.localStorage.setItem("Customer", JSON.stringify(customer));
        if (window.checkout) window.checkout.customer = customer;
      }
      var datalayer_product = {
        item_name: checkout.plan.name,
        name: checkout.plan.name,
        item_id: checkout.plan.code,
        id: checkout.plan.code,
        item_brand: "Millbody",
        brand: "Millbody",
        price: checkout.plan.value,
        affiliation:
          "Checkout Transparente " +
          checkout.plan.store +
          " " +
          window.location.host,
        quantity: 1,
      };
      window.dataLayer.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "BRL",
          value: checkout.plan.value,
          items: [datalayer_product],
          products: [datalayer_product],
        },
      });
      GoToNextFromStep(checkoutStep);
    });

  //botao voltar
  document
    .querySelector(".back-step")
    .addEventListener("click", function (event) {
      event.preventDefault();
      var checkoutStep = document.querySelector(".checkout-step.enabled");
      var valueStep = parseInt(checkoutStep.dataset.step),
        backStep = valueStep - 1;
      if (backStep > 0) {
        checkoutStep.classList.remove("enabled");
        checkoutStep.classList.add("disabled");
        var backStepElement = document.querySelector(
          '.checkout-step[data-step="' + backStep + '"]'
        );
        backStepElement.classList.add("enabled");
        backStepElement.classList.remove("disabled");
        backStepElement.querySelector("input").focus();
      }
    });

  document.addEventListener("keyup", function (event) {
    event.target.classList.remove("validation-failed");
  });

  document
    .querySelector(".millbody-checkout")
    .addEventListener("focusout", function (event) {
      if (event.target.required) ValidationUxInput(event.target);
      dataLayer.push({
        event: "focusout",
        elementName: event.target.name,
      });
    });

  jQuery(document).ready(function () {
    // MASKS
    jQuery("#cpf").mask("000.000.000-00");
    jQuery("#zipcode").mask("00000-000");
    jQuery("#phone").mask("(00) 00000-0000");
    jQuery('input[name="checkout[payment][expire_date]"]').mask("00/00");
    jQuery('input[name="checkout[payment][cvv]"]').mask("000");
  });

  // VALIDATE PLAN
  var consultPlanUrl = checkoutUrl + "?plan_code=" + planCode;
  if (userToken) consultPlanUrl += "&relationship_token=" + userToken;

  fetch(consultPlanUrl, {
    method: "GET",
    credentials: "omit",
    mode: "cors",
    headers: myHeaders,
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      var planName = document.getElementById("planName"),
        planDescription = document.getElementById("planDescription"),
        planValue = document.getElementById("planValue"),
        installments = document.getElementById("installments"),
        i = 1,
        planValueText,
        planValueTextMajor,
        plan = response.plan,
        planValueNumber = parseFloat(plan.value).toFixed(2),
        planInstallments = plan.installments || 1,
        user = response.user;
      Array.prototype.forEach.call(
        installments.querySelectorAll("option"),
        function (node) {
          node.parentNode.removeChild(node);
        }
      );

      checkout.plan = plan;
      document.title = "Checkout " + plan.name + " " + document.title;
      checkout.plan.planValueNumber = planValueNumber;
      checkout.plan.planInstallments = planInstallments;
      var planCover = document.querySelector("img#planCover, #planCover img");
      if (plan.cover && planCover) {
        planCover.src = plan.cover.uri;
        planCover.srcset = plan.cover.uri;
      }

      var customerStorage = localStorage.getItem("Customer");
      if (customerStorage && !user) {
        var customerJSON = JSON.parse(customerStorage);
        if (window.checkout) window.checkout.customer = customerJSON;
        document.getElementById("name").value = customerJSON.name;
        document.getElementById("last_name").value = customerJSON.last_name;
        document.getElementById("email").value = customerJSON.email;
        document.getElementById("cpf").value = customerJSON.cpf;
        document.getElementById("phone").value = customerJSON.phone;
        document.querySelector(".step1").classList.remove("enabled");
        document.querySelector(".step1").classList.add("disabled");
        document.querySelector(".step2").classList.remove("disabled");
        document.querySelector(".step2").classList.add("enabled");
        // validar CUSTOMER window.dataLayerPaymentInfo();
        var datalayer_product = {
          item_name: checkout.plan.name,
          name: checkout.plan.name,
          item_id: checkout.plan.code,
          id: checkout.plan.code,
          item_brand: "Millbody",
          brand: "Millbody",
          price: checkout.plan.value,
          affiliation:
            "Checkout Transparente " +
            checkout.plan.store +
            " " +
            window.location.host,
          quantity: 1,
        };
        window.dataLayer.push({
          event: "begin_checkout",
          ecommerce: {
            currency: "BRL",
            value: checkout.plan.value,
            items: [datalayer_product],
            products: [datalayer_product],
          },
        });

        if (checkout.plan.store == "stripe") {
          document.querySelector(".step2").innerHTML = "carregando...";
          document
            .querySelector(".step1")
            .closest(".millbody-checkout")
            .requestSubmit();
        }
      }

      if (user) {
        document.getElementById("email").closest(".row").remove();
        document.getElementById("gender_check").closest(".row").remove();
        if (document.getElementById("name"))
          document.getElementById("name").closest(".row").remove();
        if (document.getElementById("last_name"))
          document.getElementById("last_name").closest(".row").remove();
        if (document.getElementById("cpf"))
          document.getElementById("cpf").closest(".row").remove();
        if (document.getElementById("phone"))
          document.getElementById("phone").closest(".row").remove();
        if (document.querySelector(".address-form"))
          document.querySelector(".address-form").remove();
        document
          .querySelector(".step1")
          .insertAdjacentHTML(
            "beforeend",
            '<div class="row"><div class="col s12">' +
              user.name +
              "</div></div>"
          );
        document
          .querySelector(".step1")
          .insertAdjacentHTML(
            "beforeend",
            '<div class="row"><div class="col s12">' +
              user.email +
              "</div></div>"
          );

        document.querySelector(".step1").classList.remove("enabled");
        document.querySelector(".step1").classList.add("disabled");
        document.querySelector(".step2").classList.remove("disabled");
        document.querySelector(".step2").classList.add("enabled");

        // validar CUSTOMER window.dataLayerPaymentInfo();
        var datalayer_product = {
          item_name: checkout.plan.name,
          name: checkout.plan.name,
          item_id: checkout.plan.code,
          id: checkout.plan.code,
          item_brand: "Millbody",
          brand: "Millbody",
          price: checkout.plan.value,
          affiliation:
            "Checkout Transparente " +
            checkout.plan.store +
            " " +
            window.location.host,
          quantity: 1,
        };
        window.dataLayer.push({
          event: "begin_checkout",
          ecommerce: {
            currency: "BRL",
            value: checkout.plan.value,
            items: [datalayer_product],
            products: [datalayer_product],
          },
        });

        if (checkout.plan.store !== "stripe") {
          document.getElementById("credit_card_number").focus();
        } else {
          document.querySelector(".card-form").innerHTML = "carregando...";
          document
            .querySelector(".step1")
            .closest(".millbody-checkout")
            .requestSubmit();
        }
      }
      var plan_product = {
        item_name: checkout.plan.name,
        item_id: checkout.plan.code,
        item_brand: "Millbody",
        price: checkout.plan.value,
        affiliation:
          "Checkout Transparente " +
          checkout.plan.store +
          " " +
          window.location.host,
        quantity: 1,
      };
      dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "BRL",
          value: checkout.plan.value,
          items: [plan_product],
          products: [plan_product],
        },
      });

      var installmentUrl = urlParams.get("installment");
      var installmentSelected = installmentUrl
        ? installmentUrl
        : planInstallments;

      do {
        installments.innerHTML +=
          '<option value="' +
          i +
          '"' +
          (i == installmentSelected ? "selected" : "") +
          ">" +
          i +
          "x de R$" +
          (planValueNumber / i).toFixed(2).replace(".", ",") +
          "</option>";
        i += 1;
      } while (i <= planInstallments);
      planName.textContent = plan.name;
      planDescription.textContent = plan.description;
      planValueTextMajor =
        "<span>" +
        planInstallments +
        "x R$" +
        (planValueNumber / planInstallments).toFixed(2) +
        "</span>";
      planInstallments > 1
        ? (planValueText =
            planValueTextMajor +
            "<br/><small>(Total R$" +
            planValueNumber +
            ")</small>")
        : (planValueText = planValueTextMajor);
      planValue.innerHTML = planValueText;
    })
    .catch(function (error) {
      dataLayer.push({
        event: "consult_plan_error",
        error_message: JSON.stringify(error),
      });
      console.log("error consulta ", error);
    });
});

function validateFormStep(step) {
  var validation;
  var requiredInputs = step.querySelectorAll("input[required]");
  for (var i = 0; i < requiredInputs.length; i++) {
    validation = ValidationUxInput(requiredInputs[i]);
    if (validation.classList.contains("validation-failed")) {
      validation = false;
      break;
    }
  }
  return !!validation;
}

function ValidationUxInput(input) {
  validation = ValidateInput(input);
  if (validation) {
    input.classList.remove("validation-failed");
    input.classList.add("validation-success");
  } else {
    input.classList.remove("validation-success");
    input.classList.add("validation-failed");
  }
  return input;
}

function ValidateInput(input) {
  var inputValue = input.value;
  var validation = {
    email: input.value
      ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input.value.trim())
      : false,
    name: !!input.value && input.value.length > 1,
    last_name: !!input.value && input.value.length > 1,
    cpf: !!input.value && TestaCPF(input.value),
    phone:
      !!input.value && input.value.match(/\d+/g)
        ? input.value.validaTelefone()
        : false,
    zipcode:
      !!input.value && input.value.match(/\d+/g)
        ? input.value.match(/\d+/g).join("").length == 8
        : false,
    address: !!input.value && input.value.length > 3,
    number: !!input.value && input.value.length > 0,
    neighborhood: !!input.value && input.value.length > 1,
    city: !!input.value && input.value.length > 1,
    state: !!input.value && input.value.length == 2,
    credit_card_number:
      !!input.value && input.value.match(/\d+/g)
        ? input.value.match(/\d+/g).join("").length == 16
        : false,
    credit_card_name: !!input.value && input.value.length > 1,
    expire_date: !!input.value && TestaExpireDate(inputValue),
    cvv:
      !!input.value && input.value.match(/\d+/g)
        ? inputValue.match(/\d+/g).join("").length >= 3
        : false,
  };
  return validation[input.id];
}

function TestaCPF(cpfValue) {
  var filteredCpf = cpfValue.match(/\d+/g);
  if (filteredCpf) {
    var strCPF = !!filteredCpf && filteredCpf.join("");
    var Soma;
    var Resto;
    Soma = 0;
    if (strCPF == "00000000000") return false;

    for (i = 1; i <= 9; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

    if (Resto == 10 || Resto == 11) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (i = 1; i <= 10; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;

    if (Resto == 10 || Resto == 11) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;
    return true;
  } else {
    return false;
  }
}

function TestaExpireDate(exipreDate) {
  var regexExpireDate = exipreDate.match(/\d+/g),
    dateToday = new Date();
  if (!regexExpireDate) return false;
  if (regexExpireDate.join("").length < 4) return false;
  if ("20" + regexExpireDate[1] < dateToday.getFullYear()) return false;
  if (
    "20" + regexExpireDate[1] == dateToday.getFullYear() &&
    regexExpireDate[0] <= dateToday.getMonth() + 1
  )
    return false;
  return true;
}
