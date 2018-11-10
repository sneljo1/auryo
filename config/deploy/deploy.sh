#!/bin/bash

git config --global user.email "jonas.snellinckx@gmail.com"
git config --global user.name "Jonas via Travis CI"

current_date_time="`date +%Y%m%d%H%M%S`";
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[", ]//g')

# Snap

BASEDIR=$(dirname $0)

cd $BASEDIR/auryo-snap
git pull origin master
sed -i "s/{VERSION}/$PACKAGE_VERSION/g" ../config/build/snap/snapcraft.yaml
cp -R ../config/build/snap/* ./snap
echo $current_date_time > triggered_build_at
git add -A
git commit --message "Update for ${PACKAGE_VERSION} - ${current_date_time}"
git push --quiet --set-upstream origin master

cd ..

# AUR

MD5=`sha256sum ./release/*.pacman | awk '{ print $1 }'`

echo "Pacman MD5: $MD5"

git clone ssh://aur@aur.archlinux.org/auryo-bin.git AUR-repo
cd AUR-repo
perl -pi -e "s/[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/$PACKAGE_VERSION/g" PKGBUILD
perl -pi -e "s/[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+)?/$PACKAGE_VERSION/g" .SRCINFO

perl -pi -e "s/^[A-Fa-f0-9]{64}$/$MD5/g" PKGBUILD
perl -pi -e "s/^[A-Fa-f0-9]{64}$/$MD5/g" .SRCINFO

git add -A
git commit --message "Travis build $2 for ${PACKAGE_VERSION}"
git push --quiet --set-upstream origin master

