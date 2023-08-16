(function () {
  var zipcode = document.getElementById("zipcode");
  if (zipcode) {
    zipcode.addEventListener("keyup", function (event) {
      var numberPattern = /\d+/g,
        originalValue = this.value.match(numberPattern)
          ? this.value.match(numberPattern).join("")
          : "",
        zipcode = originalValue;
      zipcodeElement = this;
      if (originalValue.length >= 6 && originalValue.length <= 8) {
        var addressForm = zipcodeElement.closest(".address-form");
        zipcode = zipcode.slice(0, 5) + "-" + zipcode.slice(5);
        if (originalValue.length == 8) {
          var myHeaders = new Headers();
          fetch("https://viacep.com.br/ws/" + originalValue + "/json", {
            method: "GET",
            credentials: "omit",
            mode: "cors",
            headers: myHeaders,
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              addressForm
                .querySelector(".form-address")
                .classList.add("active");
              addressForm
                .querySelector(".continue-zipcode")
                .classList.add("hidden");
              addressForm.querySelector("#address").value = data.logradouro;
              addressForm.querySelector("#neighborhood").value = data.bairro;
              addressForm.querySelector("#city").value = data.localidade;
              addressForm.querySelector("#state").value = data.uf;
              addressForm.querySelector("#number").focus();
            })
            .catch(function (error) {
              console.log(
                "There has been a problem with your fetch operation: " +
                  error.message
              );
            });
        }
      }
    });
    document
      .querySelector(".continue-zipcode")
      .addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(".form-address").classList.add("active");
        document.querySelector(".continue-zipcode").classList.add("hidden");
      });
  } //zipcode
})();
