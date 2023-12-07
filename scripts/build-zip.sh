CRUEENT_VERSION=`node -e "console.log(require('./package').version)"`

zip -r $CRUEENT_VERSION.zip ./dist/$CRUEENT_VERSION
zip -r $CRUEENT_VERSION-beta.zip ./dist/$CRUEENT_VERSION-beta
