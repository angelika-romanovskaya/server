const crypto = require('crypto');
const secret = 'pppppppppppppppppppppppppppppppp';

const encrypt = (password)=>{
    const iv = Buffer.from(crypto.randomBytes(16));
    const cipher = crypto.createCipheriv('aes-256-ctr',Buffer.from(secret), iv);

    const encyptedPassword = Buffer.concat([cipher.update(password), cipher.final()]);

    return {iv: iv.toString("hex"), password: encyptedPassword.toString("hex")};
}

const decrypt = (encyption)=>{
    const decipher = crypto.createDecipheriv("aes-256-ctr", Buffer.from(secret), Buffer.from(encyption.iv, "hex"));

    const decriptedPassword = Buffer.concat([decipher.update(Buffer.from(encyption.password, "hex")), decipher.final()]);

    return decriptedPassword.toString();
}

module.exports = {encrypt, decrypt}
