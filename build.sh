CRUEENT_VERSION=`node -e "console.log(require('./package').version)"`

zip -r "v$CRUEENT_VERSION.zip" ./dist/$CRUEENT_VERSION
