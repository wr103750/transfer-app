function encryptByDES(message, key) {
    if(key.length>=8) key = key.substring(0,8);
    else{
        for (var i = 8-key.length; i < 8; i++) {
            key = key.concat('\0');
        };
    }

    var keyHex = CryptoJS.enc.Utf8.parse(key);

    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        iv: keyHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
}
