const fs = require('fs');
const crypto = require('crypto');
const util = require('util');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository {
    constructor(filename) {
        if (!filename) {
            throw new Error('Creating a repository requires a filename');
        }
        this.filename = filename;
        try {
            fs.accessSync(this.filename); //checks if file is existing
        } catch (err) {
            fs.writeFileSync(this.filename, '[]'); //creates a file
        }
    }
    //gets a list of users
    async getAll() {
        //Open the file called this.filename,
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding: 'utf8'}));

    }
    //creates a user with the given attributes
    async create(attributes){
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
    //writes all users to a users.json file
    async writeAll(records){
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }
    //generates a random id
    randomId(){
        return crypto.randomBytes(4).toString('hex');
    }
    //finds the user with the given id
    async getOne(id){
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }
    //finds one user with the given filters
    async getOneBy(filters){

        const records = await this.getAll();

        for(let record of records){
            let found = true;
            for (const key in filters) {
                if(record[key] !== filters[key]){
                    found = false;
                }
            }
            if(found === true){
                return record;
            }
        }

    }

    //delete the user with the given id
    async delete(id){
        const records = await this.getAll();
        const filteredRecords = records.filter(record => record.id !== id);
        await this.writeAll(filteredRecords);
    }
    //updates the user with the given id using the given attributes
    async update(id, attributes){
        const records = await this.getAll();
        const record = records.find(record => record.id === id);

        if(!record){
            throw new Error(`Record with id ${id} not found`);
        }
        //record === {email: 'test@test@com}
        //attrs === { password: 'mypassword'}
        Object.assign(record, attributes);
        //record === {email: 'test@test@com',password: 'mypassword'}
        await this.writeAll(records);
    }
}
module.exports = new UsersRepository('users.json');