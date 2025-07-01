const api = "https://localhost:7035/api/"; // API URL

function ajaxCall(method, api, data, successCB, errorCB) {
  $.ajax({
    type: method,
    url: api,
    data: data,
    cache: false,
    contentType: "application/json",
    dataType: "json",
    success: successCB,
    error: errorCB,
  });
}
