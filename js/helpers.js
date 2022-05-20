let helpers = (function () {
  'use strict';

  let module = {};

  function customStyles() {
    document.documentElement.style.setProperty(
      '--background-color',
      configs.styles.backgroundColor
    );
    document.documentElement.style.setProperty(
      '--background-opacity',
      configs.styles.backgroundOpacity
    );
    document.documentElement.style.setProperty(
      '--text-color',
      configs.styles.textColor
    );
  }

  module.customStyles = customStyles;

  return module;
})();
