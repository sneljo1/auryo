#!/bin/bash

git config --global user.email "jonas.snellinckx@gmail.com"
git config --global user.name "Jonas via Travis CI"

PACKAGE_VERSION=$(cat src/package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g')

# Snap
mkdir auryo-snap
cd auryo-snap
git init
git remote add origin https://${1}@github.com/auryo/auryo-snap.git > /dev/null 2>&1
git pull origin master
sed -i "s/{VERSION}/$PACKAGE_VERSION/g" ../resources/snap/snapcraft.yaml
cp -R ../resources/snap/* ./snap
git add -A
git commit --message "Travis build $2 for ${PACKAGE_VERSION}"
git push --quiet --set-upstream origin master

cd ..

# AUR

git clone ssh://aur@aur.archlinux.org/auryo.git AUR-repo
cd AUR-repo
sed -i "s/[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/$PACKAGE_VERSION/g" PKGBUILD
sed -i "s/[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/$PACKAGE_VERSION/g" .SRCINFO
git add -A
git commit --message "Travis build $2 for ${PACKAGE_VERSION}"
git push --quiet --set-upstream origin master

