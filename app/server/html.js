module.exports = state => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>DEMO</title>
    <link rel="shortcut icon" href="/favicon.26242483.ico">
    <link rel="stylesheet" href="/index.css" />
</head>
<body>
<div id="root"></div>
<script>
  // WARNING: See the following for security issues around embedding JSON in HTML:
  // http://redux.js.org/recipes/ServerRendering.html#security-considerations
  window.__STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}
</script>
<script src="/index.js"></script>
</body>
</html>
`;
