CRUEENT_VERSION=`node -e "console.log(require('./package').version)"`

zip -r $CRUEENT_VERSION.zip ./dist/$CRUEENT_VERSION
