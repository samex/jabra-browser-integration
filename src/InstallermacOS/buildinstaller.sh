#! /bin/bash

cd "./src/ChromeHost"
cmake -DCMAKE_BUILD_TYPE=Release .
make
cd ../InstallermacOS
rm -v ./ROOT/Library/Google/Chrome/NativeMessagingHosts/jabrachromehost ./ROOT/Library/Google/Chrome/NativeMessagingHosts/libjabra.dylib

ROOT_FOLDER=${PWD}/ROOT/Library/Google/Chrome/NativeMessagingHosts

cp -a ../ChromeHost/bin/jabrachromehost ./ROOT/Library/Google/Chrome/NativeMessagingHosts
cp -a ../ChromeHost/SDKmacOS/libjabra.dylib ./ROOT/Library/Google/Chrome/NativeMessagingHosts

#Uncomment to sign the application. Provide a valid signing certificate.
#codesign --sign "Developer ID Application: GN Audio AS" ${ROOT_FOLDER}/jabrachromehost
pkgbuild --root "ROOT" --scripts ./scripts --identifier com.jabra.chromehost --version 2.0 JabraChromeHost2.0.unsigned.pkg
#Uncomment to sign the package and create dmg file. Provide a valid signing certificate.
#productsign --sign "Developer ID Installer: GN Audio AS" JabraChromeHost2.0.unsigned.pkg JabraChromeHost2.0.pkg
#hdiutil create -volname JabraChromeHost -srcfolder ./JabraChromeHost2.0.pkg -ov -format UDZO JabraChromeHost2.0.dmg
