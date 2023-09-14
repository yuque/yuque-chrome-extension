class WebpackLogPlugin {
  constructor() {
    this.isFirst = true;
  }

  log(...args) {
    console.log(...args);
  }

  apply(compiler) {
    compiler.hooks.invalid.tap('WebpackLogPlugin', () => {
      this.log();
      this.log('start compiling...');
    });
    compiler.hooks.done.tap('WebpackLogPlugin', () => {
      if (this.isFirst) {
        this.isFirst = false;
        setTimeout(() => {
          this.log();
          this.log('build success');
          this.log('open chrome://extensions select dist folder');
        });
      } else {
        setTimeout(() => {
          this.log('updated success, use ctrl+r to refresh extension\n');
        });
      }
    });
  }
}

module.exports = WebpackLogPlugin;
