var utils;
(function() {
  var hexcase = 0;
  var chrsz = 8;
// Add integers, wrapping at 2^32. This uses 16-bit operations internally
// to work around bugs in some JS interpreters.
  function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

// Bitwise rotate a 32-bit number to the left.
  function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

// Convert an 8-bit or 16-bit string to an array of big-endian words
// In 8-bit function, characters >255 have their hi-byte silently ignored.
  function str2binb(str) {
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < str.length * chrsz; i += chrsz)
      bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i % 32);
    return bin;
  }

// Convert an array of big-endian words to a string
  function binb2str(bin) {
    var str = "";
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < bin.length * 32; i += chrsz)
      str += String.fromCharCode((bin[i >> 5] >>> (32 - chrsz - i % 32)) & mask);
    return str;
  }

// Convert an array of big-endian words to a hex string.
  function binb2hex(binarray) {
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++) {
      str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
        hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8  )) & 0xF);
    }
    return str;
  }

  function hex2bin(hex_str) {
    var char_str = "";
    var num_str = "";
    var i;
    for (i = 0; i < hex_str.length; i += 2) {
      char_str += String.fromCharCode(parseInt(hex_str.substring(i, i + 2), 16));
    }
    return char_str;
  }

// Convert an array of big-endian words to a base-64 string
  function binb2b64(binarray) {
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i += 3) {
      var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16)
        | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8 )
        | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
      for (var j = 0; j < 4; j++) {
        if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
        else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
      }
    }
    return str;
  }

  utils = {
    safe_add: safe_add,
    str2binb: str2binb,
    binb2str: binb2str,
    binb2hex: binb2hex,
    hex2bin: hex2bin,
    binb2b64: binb2b64,
    rol: rol
  };
})();
