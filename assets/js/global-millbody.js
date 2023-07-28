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
