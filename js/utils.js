// Taken from: https://github.com/thoseEyes/thoseShoutouts

let utils = (function () {
  'use strict';

  let module = {};

  const readFile = async (file) => {
    let response = '';

    await $.ajax({
      url: file,
      type: 'GET',
      dataType: 'text',
      success: function (data) {
        response = data;
      },
    });

    return response;
  };

  const readFileToArray = async (file) => {
    const text = await readFile(file);
    const array = text.trim().split('\n');

    const cleaned = array.filter((s) => {
      return !s.startsWith('#') && s !== '';
    });

    return cleaned;
  };

  // Adapted from CSCC09 Coursework - uses callback instead of promises
  function sendFiles(method, url, data, callback) {
    let formdata = new FormData();
    Object.keys(data).forEach(function (key) {
      let value = data[key];
      formdata.append(key, value);
    });

    let xhr = new XMLHttpRequest();

    xhr.onload = function () {
      if (xhr.status !== 200)
        callback('[' + xhr.status + ']' + xhr.responseText, null);
      else callback(null, JSON.parse(xhr.responseText));
    };

    xhr.open(method, url, true);
    xhr.send(formdata);
  }

  const writeFile = (file, data, callback) => {
    sendFiles('POST', file, data, function (err, res) {
      if (err) return callback(err);
      return callback(null);
    });
  };

  module.readFile = readFile;
  module.readFileToArray = readFileToArray;
  module.writeFile = writeFile;

  return module;
})();
