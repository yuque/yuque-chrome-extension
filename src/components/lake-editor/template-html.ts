/**
 * iframe的内容
 */
export const templateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>
  <link rel="stylesheet" type="text/css" href="./doc.css"/>
  <style>
    body {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .toolbar-container {
      display: none;
    }
    #toolbar {
      flex: 1;
    }
    #root {
      flex: 1;
      overflow: hidden;
    }
    #child {
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
    .ne-layout-mode-fixed .ne-engine, .ne-layout-mode-adapt .ne-engine {
      padding-top: 16px;
    }
    .ne-layout-mode-fixed .ne-editor-body, .ne-layout-mode-adapt .ne-editor-body {
      height: 100%;
    }
    .ne-ui-overlay-button {
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;;
      border: none !important;;
    }
    ::selection {
      color: #fff !important;
      background: #1677ff !important;
    }
    .continue-button:hover, .continue-button:focus {
      color: #00B96B;
      border-color: #00B96B;
    }
    .ne-layout-mode-fixed .ne-editor-wrap {
      padding: 16px 16px 0;
      height: 100%;
    }
    .ne-layout-mode-fixed .ne-engine {
      padding: 0;
      min-height: calc(100vh - 34px)
    }
    .ne-layout-mode-fixed .ne-editor-wrap-content {
      min-width: 317px;
    }
    .ne-layout-mode-fixed .ne-editor-outer-wrap-box {
      min-width: 317px;
    }
  </style>
</head>
<body>
  <div class="toolbar-container">
    <div id="toolbar"></div>
    <div id="child"></div>
  </div>
  <div id="root"></div>
  <script src="./doc.umd.js"></script>
</body>
</html>
`;
