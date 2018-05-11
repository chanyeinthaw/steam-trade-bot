let crypto = require('crypto');
let Base64 = require('js-base64').Base64;
let serialize = require('php-serialize');

/** Decrypts Laravel encrypted data
 *
 * @type {Function}
 * @param {function} data - Base64 encoded encryption string as created by Laravel
 * @access public
 */
function decrypt(data) {
	let key = new Buffer(global.appKey, 'base64');
	// If no data - return blank string
	if (data !== "") {
		// Check localised cache to save time
		if (!global.decryptionCache[data]) {
			try {
				//  Decode and parse required properties
				let b64 = Base64.decode(data);
				let json = JSON.parse(b64);
				let iv = Buffer.from(json.iv, "base64");
				let value = Buffer.from(json.value, "base64");

				// Create decipher
				let decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

				// Decrypt
				let decrypted = decipher.update(value, 'binary', 'utf8');
				decrypted += decipher.final('utf8');

				// Store in cache
				global.decryptionCache[data] = decrypted;

				return decrypted;
			}
			catch(e) {
				console.log(e);
				return "";
			}
		}
		else {
			// Use cached value
			return global.decryptionCache[data];
		}
	}
	else {
		return "";
	}

}

module.exports = decrypt;