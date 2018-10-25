#!/usr/bin/env bash

echo "WARNING: This is a crude hack to modify the Electron asar bundle for the Hangouts Chat.app on MacOS.  It could break very easily with future upgrades of the app.  Your mileage may vary."

set -ex

rm -f electron.asar
asar pack chat electron.asar

cp electron.asar /Applications/Chat.app/Contents/Resources/electron.asar
