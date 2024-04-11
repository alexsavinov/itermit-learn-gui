// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require('path').join(__dirname, 'coverage/ng-test'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 71,
          branches: 46,
          functions: 66,
          lines: 71
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    // browsers: ['Chrome'],
    // browsers: ['ChromeHeadless'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    restartOnFileChange: true,

    junitReporter: {
      // outputDir: require('path').join(__dirname, 'coverage/ng-test'), // results will be saved as $outputDir/$browserName.xml
      outputDir: 'coverage', // results will be saved as $outputDir/$browserName.xml
      outputFile: 'TESTS.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
      // suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: false, // add browser name to report and classes names
      // nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      // classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      // properties: {}, // key value pair of properties to add to the <properties> section of the report
      // xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
    }
  });
};
