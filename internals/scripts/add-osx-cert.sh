#!/usr/bin/env sh

KEY_CHAIN=build.keychain

CERTIFICATE_P12=certificate.p12

# Recreate the certificate from the secure environment variable
echo $CERTIFICATE_OSX | base64 --decode > $CERTIFICATE_P12

#create a keychain
security create-keychain -p travis $KEY_CHAIN

# Make the keychain the default so identities are found
security default-keychain -s $KEY_CHAIN

# Unlock the keychain
security unlock-keychain -p travis $KEY_CHAIN

security import $CERTIFICATE_P12 -k $KEY_CHAIN -P $CERTIFICATE_PASS -T /usr/bin/codesign;

security set-key-partition-list -S apple-tool:,apple: -s -k travis $KEY_CHAIN

# remove certs
rm -fr *.p12


# P8


# CERTIFICATE_P8=AuthKey_2M45D3G29B.p8

# mkdir ~/.private_keys

# echo $CERTIFICATE_OSX_P8 | base64 --decode > ~/.private_keys/$CERTIFICATE_P8

# rm -fr *.p8
