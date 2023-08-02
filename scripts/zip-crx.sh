CRUEENT_VERSION=`node -e "console.log(require('./package').version)"`

# .crx 默认下载会被拦截，需要压缩下载后再解压
zip -r $CRUEENT_VERSION.crx.zip $CRUEENT_VERSION.crx
