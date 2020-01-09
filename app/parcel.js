const path = require('path');
const Bundler = require('parcel-bundler'); // eslint-disable-line import/no-extraneous-dependencies

const clientPath = path.join(__dirname, './client/index.js');

const deafaultConfig = {
  logLevel: 3,
  sourceMaps: false,
  detailedReport: true,
  cache: false,
  contentHash: false
};

const clientOpts = {
  outDir: './dist/client',
  outFile: 'index.js',
  minify: true,
  target: 'browser'
};

(async () => {
  const client = new Bundler(
    clientPath,
    Object.assign(deafaultConfig, clientOpts)
  );

  await client.bundle();

  process.exit(0);
})();
