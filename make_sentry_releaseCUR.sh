export SENTRY_AUTH_TOKEN=e7786f866f764e89a3842b9c820267b888d3d4f18208462da50d3f3b4427351e
#export SENTRY_AUTH_TOKEN=f70a470611894c8f89ab8d02add97a1dcb7085a09f2546278217a2dbd82e8441
export SENTRY_ORG=jessedp
export SENTRY_PROJECT=tablo-tools-electron
#export SENTRY_RELEASE1=$(sentry-cli releases propose-version)
export SENTRY_RELEASE="0.1.7-beta.2"

# export SENTRY_LOG_LEVEL=debug

#sentry-cli releases new -p $SENTRY_PROJECT $SENTRY_RELEASE
#sentry-cli releases set-commits --auto $SENTRY_RELEASE
#sentry-cli releases finalize $SENTRY_RELEASE
echo $SENTRY_RELEASE
sentry-cli info
# yarn build
yarn package-linux
# yarn install

# cross-env SENTRY_ORG=jessedp SENTRY_PROJECT=tablo-tools-electron SENTRY_RELEASE=$(sentry-cli releases propose-version) &&
