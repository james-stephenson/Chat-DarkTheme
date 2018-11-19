#!/usr/bin/env bash

echo "WARNING: This is a crude hack to modify the Electron asar bundle for the Hangouts Chat.app on MacOS.  It could break very easily with future upgrades of the app.  Your mileage may vary."

set -ex

if [[ ! -e /Applications/Chat.app/Contents/Resources/electron.asar.orig ]]; then
  cp /Applications/Chat.app/Contents/Resources/electron.asar{,.orig}
fi

asar extract /Applications/Chat.app/Contents/Resources/electron.asar.orig build

echo "require('./custom-init.js');" >> build/renderer/init.js
cp src/custom-init.js build/renderer/.

rm -f electron.asar
asar pack build electron.asar

cp electron.asar /Applications/Chat.app/Contents/Resources/electron.asar
