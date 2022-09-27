(function () {
  'use strict';

  const styles = configs.styles;

  function customStyles() {
    loadGoogleFont(styles.fontFamily);

    document.documentElement.style.setProperty('--height', styles.height);
    document.documentElement.style.setProperty('--width', styles.width);

    let backgroundColor = styles.backgroundColor.toString();
    if (backgroundColor.startsWith('#')) {
      backgroundColor = backgroundColor.slice(1);
    }

    let red = parseInt(backgroundColor.slice(0, 2), 16);
    let green = parseInt(backgroundColor.slice(2, 4), 16);
    let blue = parseInt(backgroundColor.slice(4, 6), 16);

    document.documentElement.style.setProperty('--background-red', red);
    document.documentElement.style.setProperty('--background-green', green);
    document.documentElement.style.setProperty('--background-blue', blue);
    document.documentElement.style.setProperty(
      '--background-opacity',
      styles.backgroundOpacity
    );

    document.documentElement.style.setProperty(
      '--text-color',
      styles.textColor
    );
    document.documentElement.style.setProperty(
      '--font-family',
      styles.fontFamily
    );
  }

  /**
   * Dynamically loads a google font
   * @param {string} font
   */
  function loadGoogleFont(font) {
    WebFont.load({
      google: {
        families: [font],
      },
    });
  }

  window.addEventListener('load', customStyles);
})();
