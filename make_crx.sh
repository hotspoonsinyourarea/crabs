#!/bin/bash

cd "$(dirname "$0")"


if which chrome &> /dev/null; then
    CHROME_EXECUTABLE="chrome"
elif which chromium &> /dev/null; then
    CHROME_EXECUTABLE="chromium"
else
    echo "chrome, chromium not found"
    exit 1
fi

$CHROME_EXECUTABLE --pack-extension="client"

rm -f client.pem

mv client.crx crabs.crx