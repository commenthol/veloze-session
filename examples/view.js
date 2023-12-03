export const view = ({ title, body }) => `<DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
  body { font-family: sans-serif; }
  nav > a { margin-right: 0.5em; }
  </style>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/?novisit=1">No Visit</a>
    <a href="/reset-id">Reset Id</a>
    <a href="/destroy">Destroy</a>
  </nav>
  <h1>${title}</h1>
  ${body}
</body>
</html>
`
