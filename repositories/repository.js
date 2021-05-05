const fs = require('fs');
const crypto = require('crypto');
const util = require('util');


module.exports = class Repository{
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
    //creates an item
    async create(attributes){
        attributes.id = this.randomId();
        const records = await this.getAll();
        records.push(attributes);
        await this.writeAll(records);

        return attributes;
    }
    //gets a list of items
    async getAll() {
        //Open the file called this.filename,
        return JSON.parse(await fs.promises.readFile(this.filename, {encoding: 'utf8'}));

    }

    //writes all items to a *.json file
    async writeAll(records){
        await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
    }
    //generates a random id
    randomId(){
        return crypto.randomBytes(4).toString('hex');
    }
    //finds the item with the given id
    async getOne(id){
        const records = await this.getAll();
        return records.find(record => record.id === id);
    }
    //finds one item with the given filters
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