export const view = ({ title, body }) => `<DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
  body { font-family: sans-serif; }
  </style>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="javascript:location.reload();">Reload</a>
  </nav>
  <h1>${title}</h1>
  ${body}
</body>
</html>
`
