const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository{
//creates a user with the given attributes
    async create(attributes) {
        attributes.id = this.randomId();

        const salt = crypto.randomBytes(8).toString('hex'); //generates random salt

        const hashed = await scrypt(attributes.password, salt, 64);

        const records = await this.getAll();
        const record = ({
            ...attributes,
            password: `${hashed.toString('hex')}.${salt}` // replaces original password, '.' when salt is beginning...
        });
        records.push(record);
        //write the updated 'records' array back to this.filename
        await this.writeAll(records);

        return record;
    }
    //comparing passwords
    async comparePasswords(saved,supplied){
        //saved -> password saved in our database. hashed.salt
        //supplied -> password given to us by a user trying sign in

        const [hashed, salt] = saved.split('.');
        const hashedSuppliedBuff = await scrypt(supplied, salt, 64);

        return hashed === hashedSuppliedBuff.toString('hex');

    }
}

module.exports = new UsersRepository('users.json');