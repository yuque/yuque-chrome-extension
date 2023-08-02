CRUEENT_VERSION=`node -e "console.log(require('./package').version)"`
DIST_DIR=dist/$CRUEENT_VERSION

mkdir -p $DIST_DIR

curl -o $DIST_DIR/doc.css $EDITOR_CSS_URL
curl -o $DIST_DIR/doc.umd.js $EDITOR_JS_URL
curl -o $DIST_DIR/CodeMirror.js $EDITOR_CM_URL
curl -o $DIST_DIR/katex.min.js $EDITOR_KATEX_URL
